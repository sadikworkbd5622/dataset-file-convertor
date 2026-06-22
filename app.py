"""
Parquet ↔ JSON Converter — Web Interface
Flask backend for uploading .parquet files and converting them to .json
Refactored to use background threads for async processing (No Docker/Celery needed).
"""

import os
import uuid
import threading
from concurrent.futures import ThreadPoolExecutor
from flask import Flask, request, jsonify, send_file, render_template
from config import Config
from services.converter import process_parquet

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config.from_object(Config)

# In-memory task tracker and background thread pool
# This avoids the need for Celery/Redis
task_registry = {}
executor = ThreadPoolExecutor(max_workers=4)

def run_conversion_task(task_id, parquet_path, json_path, original_name, job_id, analyze=False, api_key=""):
    """Background thread function to process the file."""
    try:
        task_registry[task_id] = {"state": "PROCESSING", "status": "Converting Parquet to JSON..."}
        result = process_parquet(parquet_path, json_path, original_name, job_id, analyze, api_key)
        task_registry[task_id] = {"state": "SUCCESS", "result": result}
    except Exception as e:
        task_registry[task_id] = {"state": "FAILURE", "error": str(e)}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/convert", methods=["POST"])
def convert():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    if not file.filename.lower().endswith(".parquet"):
        return jsonify({"error": "Only .parquet files are supported"}), 400

    job_id = str(uuid.uuid4())[:8]
    task_id = str(uuid.uuid4())
    original_name = os.path.splitext(file.filename)[0]

    parquet_path = os.path.join(app.config["UPLOAD_DIR"], f"{job_id}.parquet")
    json_path = os.path.join(app.config["OUTPUT_DIR"], f"{job_id}.json")
    file.save(parquet_path)

    analyze = request.form.get("analyze") == "true"
    api_key = app.config.get("GEMINI_API_KEY", "")

    # Register task and start background thread
    task_registry[task_id] = {"state": "PENDING", "status": "Queued..."}
    executor.submit(run_conversion_task, task_id, parquet_path, json_path, original_name, job_id, analyze, api_key)

    return jsonify({
        "success": True,
        "task_id": task_id,
        "job_id": job_id,
        "status": "Processing..."
    }), 202

@app.route("/api/status/<task_id>")
def task_status(task_id):
    if task_id not in task_registry:
        return jsonify({"state": "FAILURE", "error": "Task not found"}), 404
        
    return jsonify(task_registry[task_id])

@app.route("/api/download/<job_id>")
def download(job_id):
    json_path = os.path.join(app.config["OUTPUT_DIR"], f"{job_id}.json")
    if not os.path.exists(json_path):
        return jsonify({"error": "File not found or expired"}), 404

    filename = request.args.get("name", "converted.json")
    return send_file(json_path, as_attachment=True, download_name=filename)

@app.route("/api/cleanup", methods=["POST"])
def cleanup():
    count = 0
    for f in os.listdir(app.config["OUTPUT_DIR"]):
        os.remove(os.path.join(app.config["OUTPUT_DIR"], f))
        count += 1
    return jsonify({"cleaned": count})

if __name__ == "__main__":
    app.run(debug=True, port=5000)

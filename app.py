"""
Universal Dataset File Converter — Web Application
Flask backend supporting 13+ dataset format conversions with async processing.
"""

import os
import uuid
from collections import deque
from concurrent.futures import ThreadPoolExecutor

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

from config import Config
from services.converter import process_file
from services.formats import (
    formats_for_api,
    detect_format,
    get_format,
    get_accept_string,
)

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

# In-memory task tracker and background thread pool
task_registry = {}
conversion_history = deque(maxlen=Config.MAX_HISTORY)
executor = ThreadPoolExecutor(max_workers=4)


def run_conversion_task(task_id, input_path, output_path, original_name, job_id, source_format, target_format):
    """Background thread function to process the file conversion."""
    try:
        task_registry[task_id] = {
            "state": "PROCESSING",
            "status": f"Converting {source_format.upper()} → {target_format.upper()}..."
        }
        result = process_file(input_path, output_path, original_name, job_id, source_format, target_format)
        task_registry[task_id] = {"state": "SUCCESS", "result": result}

        # Add to conversion history
        conversion_history.appendleft({
            "job_id": job_id,
            "filename": result["filename"],
            "source_format": source_format,
            "target_format": target_format,
            "rows": result["rows"],
            "columns": result["columns"],
            "elapsed_seconds": result["elapsed_seconds"],
            "converted_at": result["converted_at"],
        })
    except Exception as e:
        task_registry[task_id] = {"state": "FAILURE", "error": str(e)}


# ──── Routes ────


@app.route("/api/formats")
def api_formats():
    """Return all supported formats with availability info."""
    return jsonify({
        "formats": formats_for_api(),
        "accept": get_accept_string(),
    })


@app.route("/api/convert", methods=["POST"])
def convert():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    # Detect source format
    source_format = request.form.get("source_format") or detect_format(file.filename)
    if not source_format:
        return jsonify({"error": f"Unrecognized file format: {file.filename}"}), 400

    # Get target format
    target_format = request.form.get("target_format", "json")
    target_fmt_info = get_format(target_format)
    if not target_fmt_info:
        return jsonify({"error": f"Unsupported target format: {target_format}"}), 400

    if source_format == target_format:
        return jsonify({"error": "Source and target formats are the same"}), 400

    # Generate IDs
    job_id = str(uuid.uuid4())[:8]
    task_id = str(uuid.uuid4())
    original_name = os.path.splitext(file.filename)[0]

    # Determine file extension for the source file on disk
    source_ext = os.path.splitext(file.filename)[1]
    input_path = os.path.join(app.config["UPLOAD_DIR"], f"{job_id}{source_ext}")

    # Determine output extension from target format
    target_ext = target_fmt_info["extensions"][0]
    output_path = os.path.join(app.config["OUTPUT_DIR"], f"{job_id}{target_ext}")

    # Save uploaded file
    file.save(input_path)

    # Register task and start background conversion
    task_registry[task_id] = {"state": "PENDING", "status": "Queued..."}
    executor.submit(
        run_conversion_task,
        task_id, input_path, output_path, original_name, job_id,
        source_format, target_format
    )

    return jsonify({
        "success": True,
        "task_id": task_id,
        "job_id": job_id,
        "source_format": source_format,
        "target_format": target_format,
        "status": "Processing...",
    }), 202


@app.route("/api/status/<task_id>")
def task_status(task_id):
    if task_id not in task_registry:
        return jsonify({"state": "FAILURE", "error": "Task not found"}), 404
    return jsonify(task_registry[task_id])


@app.route("/api/download/<job_id>")
def download(job_id):
    # Find the output file (could have any extension)
    output_dir = app.config["OUTPUT_DIR"]
    for f in os.listdir(output_dir):
        if f.startswith(job_id):
            file_path = os.path.join(output_dir, f)
            filename = request.args.get("name", f"converted{os.path.splitext(f)[1]}")
            return send_file(file_path, as_attachment=True, download_name=filename)

    return jsonify({"error": "File not found or expired"}), 404


@app.route("/api/history")
def api_history():
    return jsonify({"history": list(conversion_history)})


@app.route("/api/cleanup", methods=["POST"])
def cleanup():
    count = 0
    for f in os.listdir(app.config["OUTPUT_DIR"]):
        os.remove(os.path.join(app.config["OUTPUT_DIR"], f))
        count += 1
    return jsonify({"cleaned": count})


if __name__ == "__main__":
    app.run(debug=True, port=5000)

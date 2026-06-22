import os
import json
from datetime import datetime
import time
import pandas as pd
from utils.serializers import default_serializer

def process_parquet(parquet_path, json_path, original_name, job_id, analyze=False, api_key=""):
    """
    Reads a parquet file, converts it to JSON, and returns metadata.
    """
    try:
        df = pd.read_parquet(parquet_path)
        row_count = len(df)
        col_count = len(df.columns)
        columns = df.columns.tolist()

        # Detect column types
        col_types = {}
        for col in columns:
            dtype = str(df[col].dtype)
            if "int" in dtype:
                col_types[col] = "integer"
            elif "float" in dtype:
                col_types[col] = "float"
            elif "datetime" in dtype:
                col_types[col] = "datetime"
            elif "bool" in dtype:
                col_types[col] = "boolean"
            else:
                col_types[col] = "string"

        # Convert to JSON
        records = df.to_dict(orient="records")
        json_filename = f"{original_name}.json"

        if analyze and api_key:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            for i, record in enumerate(records):
                question_text = record.get("question", "")
                if question_text:
                    prompt = f'''
                    Analyze the following MCQ question and provide ONLY a JSON response with two keys:
                    "subject" (e.g., Physics, Math, Bengali), and "chapter" (e.g., Algebra, Organic Chemistry).
                    Do not include any markdown formatting.
                    Question: "{question_text}"
                    '''
                    try:
                        response = model.generate_content(prompt)
                        res_text = response.text.replace("```json", "").replace("```", "").strip()
                        analysis = json.loads(res_text)
                        record["subject"] = analysis.get("subject", "Unknown")
                        record["chapter"] = analysis.get("chapter", "Unknown")
                    except Exception:
                        record["subject"] = "Unknown"
                        record["chapter"] = "Unknown"
                    
                    time.sleep(1)

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2, ensure_ascii=False, default=default_serializer)

        parquet_size = os.path.getsize(parquet_path)
        json_size = os.path.getsize(json_path)

        # Preview (first 5 rows)
        preview = json.loads(
            json.dumps(records[:5], default=default_serializer, ensure_ascii=False)
        )

        return {
            "success": True,
            "job_id": job_id,
            "filename": json_filename,
            "rows": row_count,
            "columns": col_count,
            "column_names": columns,
            "column_types": col_types,
            "parquet_size": parquet_size,
            "json_size": json_size,
            "preview": preview,
            "converted_at": datetime.now().isoformat(),
        }
    except Exception as e:
        raise e
    finally:
        # Clean up uploaded parquet
        if os.path.exists(parquet_path):
            os.remove(parquet_path)

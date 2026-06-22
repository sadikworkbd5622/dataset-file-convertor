"""
Universal Dataset Converter Engine
Reads any supported format into a pandas DataFrame, then writes to any target format.
"""

import os
import io
import json
import sqlite3
import time
from datetime import datetime

import pandas as pd

from utils.serializers import default_serializer
from services.formats import get_format, detect_format


# ═══════════════════════════════════════════════════════════
# READERS — Load file into DataFrame
# ═══════════════════════════════════════════════════════════

def _read_csv(path, **kwargs):
    return pd.read_csv(path, encoding="utf-8-sig")


def _read_tsv(path, **kwargs):
    return pd.read_csv(path, sep="\t", encoding="utf-8-sig")


def _read_excel(path, **kwargs):
    return pd.read_excel(path, engine="openpyxl")


def _read_json(path, **kwargs):
    """Try records array first, then fallback to other orientations."""
    try:
        return pd.read_json(path, orient="records", encoding="utf-8")
    except ValueError:
        try:
            return pd.read_json(path, encoding="utf-8")
        except ValueError:
            # Last resort: load raw and wrap
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, dict):
                return pd.DataFrame([data])
            return pd.DataFrame(data)


def _read_jsonl(path, **kwargs):
    return pd.read_json(path, lines=True, encoding="utf-8")


def _read_parquet(path, **kwargs):
    return pd.read_parquet(path)


def _read_feather(path, **kwargs):
    return pd.read_feather(path)


def _read_orc(path, **kwargs):
    return pd.read_orc(path)


def _read_xml(path, **kwargs):
    return pd.read_xml(path)


def _read_yaml(path, **kwargs):
    import yaml
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if isinstance(data, list):
        return pd.DataFrame(data)
    elif isinstance(data, dict):
        # If dict of lists (column-oriented), try directly
        try:
            return pd.DataFrame(data)
        except ValueError:
            return pd.DataFrame([data])
    else:
        raise ValueError("YAML file must contain a list of records or a dict of columns")


def _read_sqlite(path, **kwargs):
    conn = sqlite3.connect(path)
    try:
        # Get all table names
        tables = pd.read_sql_query(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
            conn
        )
        if tables.empty:
            raise ValueError("SQLite database contains no tables")
        # Read the first table by default
        table_name = tables.iloc[0]["name"]
        return pd.read_sql_query(f'SELECT * FROM "{table_name}"', conn)
    finally:
        conn.close()


def _read_hdf5(path, **kwargs):
    return pd.read_hdf(path)


def _read_avro(path, **kwargs):
    import fastavro
    with open(path, "rb") as f:
        reader = fastavro.reader(f)
        records = [r for r in reader]
    return pd.DataFrame(records)


# ═══════════════════════════════════════════════════════════
# WRITERS — Save DataFrame to target format
# ═══════════════════════════════════════════════════════════

def _write_csv(df, path, **kwargs):
    df.to_csv(path, index=False, encoding="utf-8-sig")


def _write_tsv(df, path, **kwargs):
    df.to_csv(path, sep="\t", index=False, encoding="utf-8-sig")


def _write_excel(df, path, **kwargs):
    df.to_excel(path, index=False, engine="openpyxl")


def _write_json(df, path, **kwargs):
    records = df.to_dict(orient="records")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False, default=default_serializer)


def _write_jsonl(df, path, **kwargs):
    records = df.to_dict(orient="records")
    with open(path, "w", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False, default=default_serializer) + "\n")


def _write_parquet(df, path, **kwargs):
    df.to_parquet(path, index=False)


def _write_feather(df, path, **kwargs):
    df.to_feather(path)


def _write_orc(df, path, **kwargs):
    df.to_orc(path, index=False)


def _write_xml(df, path, **kwargs):
    df.to_xml(path, index=False)


def _write_yaml(df, path, **kwargs):
    import yaml
    records = json.loads(
        json.dumps(df.to_dict(orient="records"), default=default_serializer)
    )
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(records, f, default_flow_style=False, allow_unicode=True, sort_keys=False)


def _write_sqlite(df, path, **kwargs):
    conn = sqlite3.connect(path)
    try:
        df.to_sql("data", conn, if_exists="replace", index=False)
    finally:
        conn.close()


def _write_hdf5(df, path, **kwargs):
    # Convert object columns to string to avoid HDF5 serialization issues
    df_clean = df.copy()
    for col in df_clean.select_dtypes(include=["object"]).columns:
        df_clean[col] = df_clean[col].astype(str)
    df_clean.to_hdf(path, key="data", mode="w", format="table")


def _write_avro(df, path, **kwargs):
    import fastavro

    # Build Avro schema from DataFrame dtypes
    avro_fields = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        if "int" in dtype:
            avro_type = ["null", "long"]
        elif "float" in dtype:
            avro_type = ["null", "double"]
        elif "bool" in dtype:
            avro_type = ["null", "boolean"]
        elif "datetime" in dtype:
            avro_type = ["null", "string"]
        else:
            avro_type = ["null", "string"]
        avro_fields.append({"name": col, "type": avro_type})

    schema = {
        "type": "record",
        "name": "dataset",
        "fields": avro_fields,
    }

    parsed_schema = fastavro.parse_schema(schema)
    records = json.loads(
        json.dumps(df.to_dict(orient="records"), default=default_serializer)
    )

    with open(path, "wb") as f:
        fastavro.writer(f, parsed_schema, records)


# ═══════════════════════════════════════════════════════════
# DISPATCH MAPS
# ═══════════════════════════════════════════════════════════

READERS = {
    "csv": _read_csv,
    "tsv": _read_tsv,
    "excel": _read_excel,
    "json": _read_json,
    "jsonl": _read_jsonl,
    "parquet": _read_parquet,
    "feather": _read_feather,
    "orc": _read_orc,
    "xml": _read_xml,
    "yaml": _read_yaml,
    "sqlite": _read_sqlite,
    "hdf5": _read_hdf5,
    "avro": _read_avro,
}

WRITERS = {
    "csv": _write_csv,
    "tsv": _write_tsv,
    "excel": _write_excel,
    "json": _write_json,
    "jsonl": _write_jsonl,
    "parquet": _write_parquet,
    "feather": _write_feather,
    "orc": _write_orc,
    "xml": _write_xml,
    "yaml": _write_yaml,
    "sqlite": _write_sqlite,
    "hdf5": _write_hdf5,
    "avro": _write_avro,
}


# ═══════════════════════════════════════════════════════════
# MAIN CONVERSION FUNCTION
# ═══════════════════════════════════════════════════════════

def _detect_column_types(df):
    """Detect readable column types for schema display."""
    col_types = {}
    for col in df.columns:
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
    return col_types


def process_file(input_path, output_path, original_name, job_id, source_format, target_format):
    """
    Universal file converter.

    Args:
        input_path: Path to the uploaded file on disk.
        output_path: Path where the converted file will be written.
        original_name: Original filename without extension.
        job_id: Unique job identifier.
        source_format: Format ID of the source file (e.g., "csv", "parquet").
        target_format: Format ID of the target file (e.g., "json", "excel").

    Returns:
        Dict with conversion metadata and preview data.
    """
    start_time = time.time()

    try:
        # Validate formats
        if source_format not in READERS:
            raise ValueError(f"Unsupported source format: {source_format}")
        if target_format not in WRITERS:
            raise ValueError(f"Unsupported target format: {target_format}")

        # Read source file
        reader = READERS[source_format]
        df = reader(input_path)

        # Gather metadata
        row_count = len(df)
        col_count = len(df.columns)
        columns = df.columns.tolist()
        col_types = _detect_column_types(df)

        # Get source file size
        input_size = os.path.getsize(input_path)

        # Write target file
        writer = WRITERS[target_format]
        writer(df, output_path)

        # Get output file size
        output_size = os.path.getsize(output_path)

        # Elapsed time
        elapsed = round(time.time() - start_time, 2)

        # Build target filename
        target_fmt = get_format(target_format)
        target_ext = target_fmt["extensions"][0] if target_fmt else f".{target_format}"
        output_filename = f"{original_name}{target_ext}"

        # Preview (first 5 rows as JSON-serializable dicts)
        preview_df = df.head(5)
        preview = json.loads(
            json.dumps(preview_df.to_dict(orient="records"), default=default_serializer, ensure_ascii=False)
        )

        return {
            "success": True,
            "job_id": job_id,
            "filename": output_filename,
            "source_format": source_format,
            "target_format": target_format,
            "rows": row_count,
            "columns": col_count,
            "column_names": columns,
            "column_types": col_types,
            "input_size": input_size,
            "output_size": output_size,
            "elapsed_seconds": elapsed,
            "preview": preview,
            "converted_at": datetime.now().isoformat(),
        }
    except Exception as e:
        raise e
    finally:
        # Clean up uploaded source file
        if os.path.exists(input_path):
            os.remove(input_path)

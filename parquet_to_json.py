#!/usr/bin/env python3
"""
Parquet to JSON Converter
Converts .parquet files to properly formatted .json files.

Usage:
    python parquet_to_json.py <input.parquet> [output.json]

If output path is not specified, it will use the same name as input with .json extension.
"""

import sys
import os
import json

try:
    import pandas as pd
except ImportError:
    print("Error: 'pandas' is required. Install it with: pip install pandas pyarrow")
    sys.exit(1)

try:
    import pyarrow  # noqa: F401
except ImportError:
    print("Error: 'pyarrow' is required. Install it with: pip install pyarrow")
    sys.exit(1)


def convert_parquet_to_json(input_path: str, output_path: str | None = None) -> str:
    """
    Convert a Parquet file to a properly formatted JSON file.

    Args:
        input_path: Path to the input .parquet file.
        output_path: Optional path for the output .json file.
                     Defaults to the same name/location with .json extension.

    Returns:
        The path to the generated JSON file.
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")

    if not input_path.lower().endswith(".parquet"):
        raise ValueError(f"Input file must be a .parquet file, got: {input_path}")

    # Default output path: same name with .json extension
    if output_path is None:
        output_path = os.path.splitext(input_path)[0] + ".json"

    print(f"Reading: {input_path}")
    df = pd.read_parquet(input_path)

    print(f"  → {len(df)} rows × {len(df.columns)} columns")
    print(f"  → Columns: {', '.join(df.columns.tolist())}")

    # Convert to list of dicts (records orientation) for a proper JSON array
    records = df.to_dict(orient="records")

    # Custom serializer to handle types that json.dumps can't handle natively
    def default_serializer(obj):
        if isinstance(obj, (pd.Timestamp,)):
            return obj.isoformat()
        if hasattr(obj, "item"):  # numpy scalar types
            return obj.item()
        if isinstance(obj, bytes):
            return obj.decode("utf-8", errors="replace")
        raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

    print(f"Writing: {output_path}")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False, default=default_serializer)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"  → Done! Output size: {size_kb:.1f} KB")
    return output_path


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        result = convert_parquet_to_json(input_path, output_path)
        print(f"\n✅ Successfully converted to: {result}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

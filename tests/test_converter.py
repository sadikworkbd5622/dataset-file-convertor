"""
Tests for the Universal Dataset Converter Engine
"""

import os
import json
import pytest
import pandas as pd
from services.converter import process_file


@pytest.fixture
def sample_df():
    """Standard test DataFrame used across test cases."""
    return pd.DataFrame({
        "id": [1, 2, 3],
        "name": ["Alice", "Bob", "Charlie"],
        "score": [95.5, 87.3, 92.1],
        "active": [True, False, True],
    })


@pytest.fixture
def sample_csv(tmp_path, sample_df):
    path = tmp_path / "test.csv"
    sample_df.to_csv(path, index=False)
    return str(path)


@pytest.fixture
def sample_parquet(tmp_path, sample_df):
    path = tmp_path / "test.parquet"
    sample_df.to_parquet(path, index=False)
    return str(path)


@pytest.fixture
def sample_json(tmp_path, sample_df):
    path = tmp_path / "test.json"
    records = sample_df.to_dict(orient="records")
    with open(path, "w") as f:
        json.dump(records, f)
    return str(path)


@pytest.fixture
def sample_excel(tmp_path, sample_df):
    path = tmp_path / "test.xlsx"
    sample_df.to_excel(path, index=False)
    return str(path)


# ──── CSV Conversion Tests ────

def test_csv_to_json(sample_csv, tmp_path):
    output = str(tmp_path / "output.json")
    result = process_file(sample_csv, output, "test", "job001", "csv", "json")

    assert result["success"] is True
    assert result["rows"] == 3
    assert result["columns"] == 4
    assert result["source_format"] == "csv"
    assert result["target_format"] == "json"
    assert os.path.exists(output)
    assert not os.path.exists(sample_csv)  # Source cleaned up

    # Verify JSON output is valid
    with open(output) as f:
        data = json.load(f)
    assert len(data) == 3
    assert data[0]["name"] == "Alice"


def test_csv_to_parquet(sample_csv, tmp_path):
    output = str(tmp_path / "output.parquet")
    result = process_file(sample_csv, output, "test", "job002", "csv", "parquet")

    assert result["success"] is True
    assert result["rows"] == 3
    assert os.path.exists(output)

    # Verify parquet output
    df = pd.read_parquet(output)
    assert len(df) == 3


def test_csv_to_excel(sample_csv, tmp_path):
    output = str(tmp_path / "output.xlsx")
    result = process_file(sample_csv, output, "test", "job003", "csv", "excel")

    assert result["success"] is True
    assert result["rows"] == 3
    assert os.path.exists(output)


def test_csv_to_tsv(sample_csv, tmp_path):
    output = str(tmp_path / "output.tsv")
    result = process_file(sample_csv, output, "test", "job004", "csv", "tsv")

    assert result["success"] is True
    assert os.path.exists(output)


# ──── Parquet Conversion Tests ────

def test_parquet_to_json(sample_parquet, tmp_path):
    output = str(tmp_path / "output.json")
    result = process_file(sample_parquet, output, "test", "job010", "parquet", "json")

    assert result["success"] is True
    assert result["rows"] == 3
    assert result["columns"] == 4
    assert os.path.exists(output)


def test_parquet_to_csv(sample_parquet, tmp_path):
    output = str(tmp_path / "output.csv")
    result = process_file(sample_parquet, output, "test", "job011", "parquet", "csv")

    assert result["success"] is True
    assert os.path.exists(output)


# ──── JSON Conversion Tests ────

def test_json_to_csv(sample_json, tmp_path):
    output = str(tmp_path / "output.csv")
    result = process_file(sample_json, output, "test", "job020", "json", "csv")

    assert result["success"] is True
    assert result["rows"] == 3
    assert os.path.exists(output)


def test_json_to_parquet(sample_json, tmp_path):
    output = str(tmp_path / "output.parquet")
    result = process_file(sample_json, output, "test", "job021", "json", "parquet")

    assert result["success"] is True
    assert os.path.exists(output)


def test_json_to_excel(sample_json, tmp_path):
    output = str(tmp_path / "output.xlsx")
    result = process_file(sample_json, output, "test", "job022", "json", "excel")

    assert result["success"] is True
    assert os.path.exists(output)


# ──── Excel Conversion Tests ────

def test_excel_to_json(sample_excel, tmp_path):
    output = str(tmp_path / "output.json")
    result = process_file(sample_excel, output, "test", "job030", "excel", "json")

    assert result["success"] is True
    assert result["rows"] == 3
    assert os.path.exists(output)


def test_excel_to_csv(sample_excel, tmp_path):
    output = str(tmp_path / "output.csv")
    result = process_file(sample_excel, output, "test", "job031", "excel", "csv")

    assert result["success"] is True
    assert os.path.exists(output)


# ──── Metadata Tests ────

def test_result_metadata(sample_csv, tmp_path):
    output = str(tmp_path / "output.json")
    result = process_file(sample_csv, output, "mydata", "jobMeta", "csv", "json")

    assert result["filename"] == "mydata.json"
    assert result["job_id"] == "jobMeta"
    assert "preview" in result
    assert len(result["preview"]) <= 5
    assert "elapsed_seconds" in result
    assert "input_size" in result
    assert "output_size" in result
    assert "column_types" in result
    assert result["column_types"]["id"] == "integer"
    assert result["column_types"]["score"] == "float"
    assert result["column_types"]["active"] == "boolean"
    assert result["column_types"]["name"] in ("string", "object")


def test_column_detection(sample_csv, tmp_path):
    output = str(tmp_path / "output.json")
    result = process_file(sample_csv, output, "test", "jobCol", "csv", "json")

    assert set(result["column_names"]) == {"id", "name", "score", "active"}
    assert result["columns"] == 4


# ──── Error Handling Tests ────

def test_unsupported_source_format(tmp_path):
    fake_file = tmp_path / "test.csv"
    fake_file.write_text("a,b\n1,2")

    output = str(tmp_path / "output.json")
    with pytest.raises(ValueError, match="Unsupported source format"):
        process_file(str(fake_file), output, "test", "jobErr", "INVALID", "json")


def test_unsupported_target_format(tmp_path):
    fake_file = tmp_path / "test.csv"
    fake_file.write_text("a,b\n1,2")

    output = str(tmp_path / "output.xyz")
    with pytest.raises(ValueError, match="Unsupported target format"):
        process_file(str(fake_file), output, "test", "jobErr2", "csv", "INVALID")

import os
import pytest
import pandas as pd
from services.converter import process_parquet

@pytest.fixture
def sample_parquet(tmp_path):
    df = pd.DataFrame({
        "id": [1, 2, 3],
        "name": ["Alice", "Bob", "Charlie"],
        "active": [True, False, True]
    })
    parquet_path = tmp_path / "test.parquet"
    df.to_parquet(parquet_path)
    return str(parquet_path)

def test_process_parquet(sample_parquet, tmp_path):
    json_path = str(tmp_path / "test.json")
    result = process_parquet(sample_parquet, json_path, "test", "job123")
    
    assert result["success"] is True
    assert result["rows"] == 3
    assert result["columns"] == 3
    assert os.path.exists(json_path)
    
    # Parquet file should be cleaned up
    assert not os.path.exists(sample_parquet)

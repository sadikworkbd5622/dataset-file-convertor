import pandas as pd

def default_serializer(obj):
    """Handle types that json.dumps can't serialize natively."""
    import numpy as np

    # Pandas types
    if isinstance(obj, (pd.Timestamp, pd.DatetimeTZDtype)):
        return obj.isoformat()
    if isinstance(obj, pd.NaT.__class__):
        return None

    # Numpy arrays → convert to Python list
    if isinstance(obj, np.ndarray):
        return obj.tolist()

    # Numpy scalar types (int64, float32, bool_, etc.)
    if isinstance(obj, np.generic):
        if np.isnan(obj) if np.issubdtype(type(obj), np.floating) else False:
            return None
        return obj.item()

    # Raw bytes
    if isinstance(obj, bytes):
        return obj.decode("utf-8", errors="replace")

    # Catch-all for pandas NA variants
    try:
        if pd.isna(obj):
            return None
    except (ValueError, TypeError):
        pass

    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

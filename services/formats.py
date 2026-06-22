"""
Dataset Format Registry
Defines all supported file formats with metadata for the universal converter.
"""

# Each format entry contains:
#   id, name, extensions (list), color, icon (emoji), description,
#   category, can_read, can_write
FORMATS = {
    "csv": {
        "id": "csv",
        "name": "CSV",
        "extensions": [".csv"],
        "color": "#4CAF50",
        "gradient": "linear-gradient(135deg, #4CAF50, #2E7D32)",
        "icon": "📊",
        "description": "Comma-Separated Values",
        "category": "tabular",
        "can_read": True,
        "can_write": True,
        "mime": "text/csv",
    },
    "tsv": {
        "id": "tsv",
        "name": "TSV",
        "extensions": [".tsv"],
        "color": "#66BB6A",
        "gradient": "linear-gradient(135deg, #66BB6A, #388E3C)",
        "icon": "📋",
        "description": "Tab-Separated Values",
        "category": "tabular",
        "can_read": True,
        "can_write": True,
        "mime": "text/tab-separated-values",
    },
    "excel": {
        "id": "excel",
        "name": "Excel",
        "extensions": [".xlsx", ".xls"],
        "color": "#1B5E20",
        "gradient": "linear-gradient(135deg, #43A047, #1B5E20)",
        "icon": "📗",
        "description": "Microsoft Excel Spreadsheet",
        "category": "tabular",
        "can_read": True,
        "can_write": True,
        "mime": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    "json": {
        "id": "json",
        "name": "JSON",
        "extensions": [".json"],
        "color": "#FF9800",
        "gradient": "linear-gradient(135deg, #FFA726, #E65100)",
        "icon": "🔶",
        "description": "JavaScript Object Notation",
        "category": "structured",
        "can_read": True,
        "can_write": True,
        "mime": "application/json",
    },
    "jsonl": {
        "id": "jsonl",
        "name": "JSONL",
        "extensions": [".jsonl", ".ndjson"],
        "color": "#FB8C00",
        "gradient": "linear-gradient(135deg, #FFB74D, #E65100)",
        "icon": "📜",
        "description": "JSON Lines (Newline-Delimited)",
        "category": "structured",
        "can_read": True,
        "can_write": True,
        "mime": "application/x-ndjson",
    },
    "parquet": {
        "id": "parquet",
        "name": "Parquet",
        "extensions": [".parquet"],
        "color": "#6C5CE7",
        "gradient": "linear-gradient(135deg, #A29BFE, #6C5CE7)",
        "icon": "🏛️",
        "description": "Apache Parquet Columnar Format",
        "category": "columnar",
        "can_read": True,
        "can_write": True,
        "mime": "application/octet-stream",
    },
    "feather": {
        "id": "feather",
        "name": "Feather",
        "extensions": [".feather", ".arrow"],
        "color": "#00BCD4",
        "gradient": "linear-gradient(135deg, #4DD0E1, #00838F)",
        "icon": "🪶",
        "description": "Apache Arrow Feather Format",
        "category": "columnar",
        "can_read": True,
        "can_write": True,
        "mime": "application/octet-stream",
    },
    "orc": {
        "id": "orc",
        "name": "ORC",
        "extensions": [".orc"],
        "color": "#7C4DFF",
        "gradient": "linear-gradient(135deg, #B388FF, #651FFF)",
        "icon": "🔮",
        "description": "Optimized Row Columnar Format",
        "category": "columnar",
        "can_read": True,
        "can_write": True,
        "mime": "application/octet-stream",
    },
    "xml": {
        "id": "xml",
        "name": "XML",
        "extensions": [".xml"],
        "color": "#E91E63",
        "gradient": "linear-gradient(135deg, #F06292, #AD1457)",
        "icon": "📄",
        "description": "Extensible Markup Language",
        "category": "structured",
        "can_read": True,
        "can_write": True,
        "mime": "application/xml",
    },
    "yaml": {
        "id": "yaml",
        "name": "YAML",
        "extensions": [".yaml", ".yml"],
        "color": "#FF5722",
        "gradient": "linear-gradient(135deg, #FF8A65, #BF360C)",
        "icon": "⚙️",
        "description": "YAML Ain't Markup Language",
        "category": "structured",
        "can_read": True,
        "can_write": True,
        "mime": "text/yaml",
    },
    "sqlite": {
        "id": "sqlite",
        "name": "SQLite",
        "extensions": [".db", ".sqlite", ".sqlite3"],
        "color": "#2196F3",
        "gradient": "linear-gradient(135deg, #64B5F6, #0D47A1)",
        "icon": "🗄️",
        "description": "SQLite Database File",
        "category": "database",
        "can_read": True,
        "can_write": True,
        "mime": "application/x-sqlite3",
    },
    "hdf5": {
        "id": "hdf5",
        "name": "HDF5",
        "extensions": [".h5", ".hdf5"],
        "color": "#009688",
        "gradient": "linear-gradient(135deg, #4DB6AC, #004D40)",
        "icon": "🧬",
        "description": "Hierarchical Data Format v5",
        "category": "scientific",
        "can_read": True,
        "can_write": True,
        "mime": "application/x-hdf5",
    },
    "avro": {
        "id": "avro",
        "name": "Avro",
        "extensions": [".avro"],
        "color": "#795548",
        "gradient": "linear-gradient(135deg, #A1887F, #3E2723)",
        "icon": "🔷",
        "description": "Apache Avro Serialization",
        "category": "columnar",
        "can_read": True,
        "can_write": True,
        "mime": "application/avro",
    },
}


def get_all_extensions():
    """Return a flat set of all supported file extensions."""
    exts = set()
    for fmt in FORMATS.values():
        exts.update(fmt["extensions"])
    return exts


def detect_format(filename):
    """Detect format id from a filename. Returns None if unrecognized."""
    name = filename.lower()
    for fmt_id, fmt in FORMATS.items():
        for ext in fmt["extensions"]:
            if name.endswith(ext):
                return fmt_id
    return None


def get_format(fmt_id):
    """Return format metadata by id, or None."""
    return FORMATS.get(fmt_id)


def get_writable_formats():
    """Return list of format ids that support writing."""
    return [fid for fid, f in FORMATS.items() if f["can_write"]]


def get_readable_formats():
    """Return list of format ids that support reading."""
    return [fid for fid, f in FORMATS.items() if f["can_read"]]


def get_accept_string():
    """Return a comma-separated string of all accepted extensions for HTML input."""
    return ",".join(sorted(get_all_extensions()))


def formats_for_api():
    """Return the full format registry as a list, suitable for the API response."""
    available = check_availability()
    result = []
    for fmt_id, fmt in FORMATS.items():
        entry = {**fmt, "available": available.get(fmt_id, True)}
        result.append(entry)
    return result


def check_availability():
    """Check which formats have their required libraries installed."""
    avail = {}
    for fmt_id in FORMATS:
        avail[fmt_id] = True  # Default: available

    # Check optional dependencies
    try:
        import pyarrow  # noqa: F401
    except ImportError:
        avail["parquet"] = False
        avail["feather"] = False
        avail["orc"] = False

    try:
        import openpyxl  # noqa: F401
    except ImportError:
        avail["excel"] = False

    try:
        import lxml  # noqa: F401
    except ImportError:
        avail["xml"] = False

    try:
        import yaml  # noqa: F401
    except ImportError:
        avail["yaml"] = False

    try:
        import tables  # noqa: F401
    except ImportError:
        avail["hdf5"] = False

    try:
        import fastavro  # noqa: F401
    except ImportError:
        avail["avro"] = False

    return avail

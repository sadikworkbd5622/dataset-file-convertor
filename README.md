# DataForge — Universal Dataset File Converter

<p align="center">
  <strong>Convert between 13+ dataset formats instantly</strong><br>
  CSV · JSON · Parquet · Excel · XML · YAML · SQLite · Feather · ORC · HDF5 · Avro · TSV · JSONL
</p>

---

## ✨ Features

- **13+ Format Support** — Read and write CSV, TSV, Excel, JSON, JSONL, Parquet, Feather, ORC, XML, YAML, SQLite, HDF5, and Avro
- **Any-to-Any Conversion** — Convert between any pair of supported formats
- **Instant Preview** — See schema, column types, and first 5 rows before downloading
- **Drag & Drop Upload** — Simply drop your dataset file into the browser
- **Async Processing** — Background thread pool for non-blocking conversions
- **Conversion History** — Track your recent conversions (persisted in browser)
- **Premium Dark UI** — Glassmorphism design with smooth animations
- **Keyboard Shortcuts** — `Ctrl+U` to upload, `Escape` to reset
- **Auto-Detection** — Automatically detects input format from file extension
- **Up to 500 MB** — Handle large datasets

## 📊 Supported Formats

| Format | Extensions | Category | Read | Write |
|--------|-----------|----------|:----:|:-----:|
| CSV | `.csv` | Tabular | ✅ | ✅ |
| TSV | `.tsv` | Tabular | ✅ | ✅ |
| Excel | `.xlsx`, `.xls` | Tabular | ✅ | ✅ |
| JSON | `.json` | Structured | ✅ | ✅ |
| JSONL | `.jsonl`, `.ndjson` | Structured | ✅ | ✅ |
| Parquet | `.parquet` | Columnar | ✅ | ✅ |
| Feather | `.feather`, `.arrow` | Columnar | ✅ | ✅ |
| ORC | `.orc` | Columnar | ✅ | ✅ |
| XML | `.xml` | Structured | ✅ | ✅ |
| YAML | `.yaml`, `.yml` | Structured | ✅ | ✅ |
| SQLite | `.db`, `.sqlite` | Database | ✅ | ✅ |
| HDF5 | `.h5`, `.hdf5` | Scientific | ✅ | ✅ |
| Avro | `.avro` | Columnar | ✅ | ✅ |

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/sadikworkbd5622/dataset-file-convertor.git
cd dataset-file-convertor

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

Open **http://localhost:5000** in your browser.

## 🔌 API Documentation

### `GET /api/formats`
Returns all supported formats with availability status.

### `POST /api/convert`
Upload a file for conversion.

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | The dataset file to convert |
| `target_format` | String | Yes | Target format ID (e.g., `json`, `csv`, `parquet`) |
| `source_format` | String | No | Source format ID. Auto-detected if omitted |

**Response:** `202 Accepted`
```json
{
  "success": true,
  "task_id": "uuid",
  "job_id": "short-id",
  "source_format": "csv",
  "target_format": "json",
  "status": "Processing..."
}
```

### `GET /api/status/<task_id>`
Check conversion progress.

### `GET /api/download/<job_id>?name=filename.json`
Download the converted file.

### `GET /api/history`
Get recent conversion history.

## 🧪 Testing

```bash
python -m pytest tests/ -v
```

## 🏗️ Project Structure

```
converter/
├── app.py                    # Flask application & routes
├── config.py                 # Configuration
├── requirements.txt          # Python dependencies
├── services/
│   ├── converter.py          # Universal conversion engine
│   └── formats.py            # Format registry & metadata
├── utils/
│   └── serializers.py        # JSON serialization helpers
├── static/
│   ├── style.css             # Premium dark theme CSS
│   └── app.js                # Client-side JavaScript
├── templates/
│   └── index.html            # Main HTML template
└── tests/
    └── test_converter.py     # Test suite
```

## 📝 License

MIT License

---

<p align="center">
  Built with ❤️ using Flask + Pandas
</p>

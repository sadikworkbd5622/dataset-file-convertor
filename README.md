# DataForge — Universal Dataset File Converter

<p align="center">
  <strong>Convert between 13+ dataset formats instantly</strong><br>
  CSV · JSON · Parquet · Excel · XML · YAML · SQLite · Feather · ORC · HDF5 · Avro · TSV · JSONL
</p>

---

## ✨ Features

- **13+ Format Support** — Read and write CSV, TSV, Excel, JSON, JSONL, Parquet, Feather, ORC, XML, YAML, SQLite, HDF5, and Avro.
- **Any-to-Any Conversion** — Convert between any pair of supported formats.
- **Premium Dark UI** — Fully responsive, modern Next.js + React frontend with glassmorphism design and smooth micro-animations.
- **Instant Preview** — See schema, column types, and the first 5 rows before downloading.
- **Drag & Drop Upload** — Simply drop your dataset file into the browser.
- **Async Processing** — Background thread pool on the Flask backend for non-blocking large dataset conversions.
- **Auto-Detection** — Automatically detects input format from the file extension.
- **Decoupled Architecture** — Clean separation of concerns between the robust Python Pandas backend and the Next.js React frontend.
- **Up to 500 MB** — Handle large datasets efficiently.

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

## 🚀 Quick Start (Local Development)

Because DataForge uses a decoupled architecture, you need to run both the Python backend and the Next.js frontend concurrently.

### Prerequisites
- **Python 3.10+** (Backend)
- **Node.js 18+** (Frontend)

### 1. Start the Flask Backend (Port 5000)

```bash
# Clone the repository
git clone https://github.com/sadikworkbd5622/dataset-file-convertor.git
cd dataset-file-convertor

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
python app.py
```

### 2. Start the Next.js Frontend (Port 3000)

Open a new terminal window:

```bash
cd dataset-file-convertor/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open **http://localhost:3000** in your browser to use DataForge!

---

## 🌍 Deployment

DataForge is fully configured for production deployment. The recommended stack is **Render** for the Python backend and **Vercel** for the Next.js frontend.

### Deploying Backend (Render)
1. Create a new **Web Service** on Render and connect your GitHub repo.
2. Set the Environment to `Python 3`.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn app:app`

### Deploying Frontend (Vercel)
1. Import your GitHub project into Vercel.
2. Under "Build & Development Settings", ensure the **Framework Preset** is set to **Next.js**.
3. **Important:** Change the **Root Directory** to `frontend`.
4. Deploy! Your Next.js app will automatically route requests to the production Render URL.

---

## 🔌 API Documentation

The backend exposes a clean REST API at `http://127.0.0.1:5000/api/*`.

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
Check conversion progress via polling.

### `GET /api/download/<job_id>?name=filename.json`
Download the converted file.

### `GET /api/history`
Get recent conversion history.

## 🧪 Testing

The backend includes a comprehensive pytest suite to test the conversion engine logic:

```bash
python -m pytest tests/ -v
```

## 🏗️ Architecture

```text
converter/
├── app.py                    # Flask REST API endpoints
├── config.py                 # Configuration
├── requirements.txt          # Python dependencies
├── services/                 # Python logic (Pandas converter, formats)
├── tests/                    # Pytest test suite
│
└── frontend/                 # Next.js Application
    ├── package.json
    ├── next.config.mjs       # Proxy routing (local 5000 -> production Render)
    └── src/
        ├── app/              # Next.js App Router (page.js, layout.js, globals.css)
        ├── components/       # Reusable React UI components
        └── lib/              # Client-side API fetchers and utils
```

## 📝 License

MIT License

---

<p align="center">
  Built with ❤️ using <strong>Next.js</strong>, <strong>React</strong>, <strong>Flask</strong>, and <strong>Pandas</strong>
</p>

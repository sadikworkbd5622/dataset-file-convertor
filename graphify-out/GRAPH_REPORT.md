# Graph Report - dataset-file-convertor  (2026-06-26)

## Corpus Check
- 31 files · ~3,821,141 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 175 nodes · 200 edges · 21 communities (18 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7e3eb27d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `process_file()` - 22 edges
2. `DataForge — Universal Dataset File Converter` - 9 edges
3. `get_format()` - 6 edges
4. `🔌 API Documentation` - 6 edges
5. `detect_format()` - 5 edges
6. `get_accept_string()` - 5 edges
7. `formats_for_api()` - 5 edges
8. `api_formats()` - 4 edges
9. `scripts` - 4 edges
10. `ConversionResults()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `run_conversion_task()` --calls--> `process_file()`  [EXTRACTED]
  app.py → services/converter.py
- `test_column_detection()` --calls--> `process_file()`  [EXTRACTED]
  tests/test_converter.py → services/converter.py
- `test_csv_to_excel()` --calls--> `process_file()`  [EXTRACTED]
  tests/test_converter.py → services/converter.py
- `test_csv_to_json()` --calls--> `process_file()`  [EXTRACTED]
  tests/test_converter.py → services/converter.py
- `test_csv_to_parquet()` --calls--> `process_file()`  [EXTRACTED]
  tests/test_converter.py → services/converter.py

## Import Cycles
- None detected.

## Communities (21 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (7): _detect_column_types(), Universal Dataset Converter Engine Reads any supported format into a pandas Data, Detect readable column types for schema display., Try records array first, then fallback to other orientations., _read_json(), default_serializer(), Handle types that json.dumps can't serialize natively.

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (25): api_formats(), convert(), Universal Dataset File Converter — Web Application Flask backend supporting 13+, Background thread function to process the file conversion., Return all supported formats with availability info., run_conversion_task(), Config, Application Configuration (+17 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (20): process_file(), Universal file converter.      Args:         input_path: Path to the uploaded fi, Tests for the Universal Dataset Converter Engine, Standard test DataFrame used across test cases., sample_df(), test_column_detection(), test_csv_to_excel(), test_csv_to_json() (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (19): 1. Start the Flask Backend (Port 5000), 2. Start the Next.js Frontend (Port 3000), 🔌 API Documentation, 🏗️ Architecture, DataForge — Universal Dataset File Converter, Deploying Backend (Render), Deploying Frontend (Vercel), 🌍 Deployment (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (6): ConversionResults(), getDownloadUrl(), formatBytes(), formatNumber(), syntaxHighlight(), timeAgo()

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (11): dependencies, next, react, react-dom, name, private, scripts, build (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.40
Nodes (3): inter, jetbrainsMono, metadata

### Community 8 - "Community 8"
Cohesion: 0.50
Nodes (3): compilerOptions, paths, @/*

### Community 9 - "Community 9"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **33 isolated node(s):** `@/*`, `nextConfig`, `name`, `version`, `private` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `process_file()` connect `Community 2` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `get_format()` connect `Community 1` to `Community 0`, `Community 2`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `Universal Dataset File Converter — Web Application Flask backend supporting 13+`, `Background thread function to process the file conversion.`, `Return all supported formats with availability info.` to the rest of the system?**
  _53 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0846774193548387 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
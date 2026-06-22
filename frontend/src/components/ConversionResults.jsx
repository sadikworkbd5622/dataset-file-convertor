import { formatBytes, formatNumber, syntaxHighlight } from "../lib/utils";
import { getDownloadUrl } from "../lib/api";

export default function ConversionResults({ job, formats, onReset }) {
  if (!job) return null;

  const srcFmt = formats.find(f => f.id === job.source_format);
  const tgtFmt = formats.find(f => f.id === job.target_format);
  
  const fromName = srcFmt ? srcFmt.name : job.source_format.toUpperCase();
  const toName = tgtFmt ? tgtFmt.name : job.target_format.toUpperCase();

  const handleDownload = () => {
    window.location.href = getDownloadUrl(job.job_id, job.filename);
  };

  return (
    <section className="results" id="results">
        <div className="conversion-badge">
            <span className="conversion-badge__from">{fromName}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <span className="conversion-badge__to">{toName}</span>
            <span className="conversion-badge__time">{job.elapsed_seconds}s</span>
        </div>

        <div className="stats">
            <div className="stat-card">
                <span className="stat-card__icon">📊</span>
                <span className="stat-card__value">{formatNumber(job.rows)}</span>
                <span className="stat-card__label">Rows</span>
            </div>
            <div className="stat-card">
                <span className="stat-card__icon">📋</span>
                <span className="stat-card__value">{formatNumber(job.columns)}</span>
                <span className="stat-card__label">Columns</span>
            </div>
            <div className="stat-card">
                <span className="stat-card__icon">📥</span>
                <span className="stat-card__value">{formatBytes(job.input_size)}</span>
                <span className="stat-card__label">Input Size</span>
            </div>
            <div className="stat-card">
                <span className="stat-card__icon">📤</span>
                <span className="stat-card__value">{formatBytes(job.output_size)}</span>
                <span className="stat-card__label">Output Size</span>
            </div>
        </div>

        <div className="schema-panel">
            <div className="panel-header">
                <h3 className="panel-header__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
                    </svg>
                    Schema
                </h3>
                <span className="panel-header__count">{job.columns} columns</span>
            </div>
            <div className="schema-table-wrap">
                <table className="schema-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Column</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {job.column_names.map((col, i) => {
                            const type = job.column_types[col] || "string";
                            return (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td className="col-name">{col}</td>
                                    <td><span className={`type-badge type-badge--${type}`}>{type}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="preview-panel">
            <div className="panel-header">
                <h3 className="panel-header__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                    </svg>
                    Data Preview
                </h3>
                <span className="preview-badge">First 5 rows</span>
            </div>
            <pre className="preview-code" dangerouslySetInnerHTML={{__html: syntaxHighlight(job.preview)}}></pre>
        </div>

        <div className="download-section">
            <button className="btn-download" type="button" onClick={handleDownload}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Download {job.filename}</span>
            </button>
            <button className="btn-reset" type="button" onClick={onReset}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Convert Another
            </button>
        </div>
    </section>
  );
}

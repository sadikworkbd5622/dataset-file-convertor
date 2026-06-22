import { useEffect, useState } from "react";
import { timeAgo, formatNumber } from "../lib/utils";

export default function ConversionHistory({ history, onClearHistory, formats }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <section className="history-section" id="historySection">
        <div className="panel-header">
            <h3 className="panel-header__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Recent Conversions
            </h3>
            <button className="history-clear-btn" type="button" title="Clear history" onClick={onClearHistory}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
        </div>
        <div className="history-list">
            {history.length === 0 ? (
                <div className="history-empty">
                    <p>No conversions yet. Upload a file to get started!</p>
                </div>
            ) : (
                history.map((entry, idx) => {
                    const srcFmt = formats.find(f => f.id === entry.source_format);
                    const tgtFmt = formats.find(f => f.id === entry.target_format);
                    return (
                        <div key={idx} className="history-item">
                            <div className="history-item__formats">
                                <span className="history-item__format history-item__format--from">{srcFmt ? srcFmt.name : entry.source_format}</span>
                                <span className="history-item__arrow">→</span>
                                <span className="history-item__format history-item__format--to">{tgtFmt ? tgtFmt.name : entry.target_format}</span>
                            </div>
                            <div className="history-item__info">
                                <div className="history-item__name">{entry.filename}</div>
                                <div className="history-item__meta">{formatNumber(entry.rows)} rows · {formatNumber(entry.columns)} cols · {entry.elapsed_seconds}s</div>
                            </div>
                            <div className="history-item__time">{timeAgo(entry.converted_at)}</div>
                        </div>
                    );
                })
            )}
        </div>
    </section>
  );
}

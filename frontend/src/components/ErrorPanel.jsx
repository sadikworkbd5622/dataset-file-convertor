export default function ErrorPanel({ error, onReset }) {
  if (!error) return null;
  return (
    <section className="error-panel" id="errorPanel">
        <div className="error-panel__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
        </div>
        <p className="error-panel__message">{error}</p>
        <button className="btn-reset" type="button" onClick={onReset}>Try again</button>
    </section>
  );
}

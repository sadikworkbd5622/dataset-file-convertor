export default function Header({
  theme,
  mobileNavOpen,
  onMobileNavClose,
  onMobileNavToggle,
  onToggleTheme,
}) {
  return (
    <header className="header" id="header">
      <div className="header__nav" aria-label="Product identity">
        <div className="header__brand">
          <span className="header__mark" aria-hidden="true">DF</span>
          <span className="header__wordmark">DataForge</span>
        </div>
        <nav
          className={`header__nav-links ${mobileNavOpen ? "is-open" : ""}`}
          aria-label="Product highlights"
        >
          <a href="#formats" onClick={onMobileNavClose}>Formats</a>
          <a href="#preview" onClick={onMobileNavClose}>Preview</a>
          <a href="#export" onClick={onMobileNavClose}>Export</a>
        </nav>
        <button
          className="mobile-nav-toggle"
          type="button"
          aria-expanded={mobileNavOpen}
          aria-label="Toggle navigation menu"
          onClick={onMobileNavToggle}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <button className="theme-toggle theme-toggle--desktop" type="button" onClick={onToggleTheme}>
          <span>{theme === "dark" ? "Light" : "Dark"} mode</span>
        </button>
      </div>

      <div className="header__hero">
        <div className="header__content">
          <div className="header__badge">
            <span>Universal dataset converter</span>
          </div>
          <h1 className="header__title">
            Convert 13+ dataset formats in seconds.
          </h1>
          <p className="header__subtitle">
            DataForge converts CSV, JSON, Parquet, Excel, XML, YAML, SQLite, and
            more with preview, schema details, and clean export files.
          </p>

          <div className="header__actions" aria-label="Primary actions">
            <a className="header__primary-action" href="#formats">Start conversion</a>
            <a className="header__secondary-action" href="#export">View recent jobs</a>
          </div>

          <div className="header__proof" aria-label="Product assurances">
            <span>13+ formats</span>
            <span>Schema preview</span>
            <span>Server-side processing</span>
          </div>
        </div>

        <aside className="header__summary" aria-label="Product preview">
          <div className="header__summary-top">
            <span className="header__summary-label">Conversion preview</span>
            <span className="header__status">Ready</span>
          </div>
          <div className="header__summary-file">
            <span>sales_export.csv</span>
            <strong>CSV → Parquet</strong>
          </div>
          <div className="header__summary-grid">
            <span>Rows<strong>24.8k</strong></span>
            <span>Columns<strong>18</strong></span>
          </div>
          <div className="header__summary-progress" aria-hidden="true">
            <span></span>
          </div>
          <p>Clean export with detected schema, preview, and downloadable result.</p>
        </aside>
      </div>

      <div className="format-orbit" id="formatOrbit" aria-label="Supported formats">
        <div className="format-orbit__ring">
          <span className="format-orbit__dot">CSV</span>
          <span className="format-orbit__dot">JSON</span>
          <span className="format-orbit__dot">Parquet</span>
          <span className="format-orbit__dot">Excel</span>
          <span className="format-orbit__dot">XML</span>
          <span className="format-orbit__dot">YAML</span>
          <span className="format-orbit__dot">SQLite</span>
          <span className="format-orbit__dot">Feather</span>
        </div>
      </div>
    </header>
  );
}

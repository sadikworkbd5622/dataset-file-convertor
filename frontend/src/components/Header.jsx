export default function Header() {
  return (
    <header className="header" id="header">
        <div className="header__badge">
            <span className="header__icon">⚡</span>
            <span>Universal Converter</span>
        </div>
        <h1 className="header__title">
            <span className="header__title-brand">DataForge</span>
        </h1>
        <p className="header__subtitle">
            Convert between <strong>13+ dataset formats</strong> instantly.<br/>
            CSV, JSON, Parquet, Excel, XML, YAML, SQLite &amp; more.
        </p>

        <div className="format-orbit" id="formatOrbit">
            <div className="format-orbit__ring">
                <span className="format-orbit__dot" style={{"--i":0, "--color":"#4CAF50"}}>CSV</span>
                <span className="format-orbit__dot" style={{"--i":1, "--color":"#FF9800"}}>JSON</span>
                <span className="format-orbit__dot" style={{"--i":2, "--color":"#6C5CE7"}}>Parquet</span>
                <span className="format-orbit__dot" style={{"--i":3, "--color":"#1B5E20"}}>Excel</span>
                <span className="format-orbit__dot" style={{"--i":4, "--color":"#E91E63"}}>XML</span>
                <span className="format-orbit__dot" style={{"--i":5, "--color":"#FF5722"}}>YAML</span>
                <span className="format-orbit__dot" style={{"--i":6, "--color":"#2196F3"}}>SQLite</span>
                <span className="format-orbit__dot" style={{"--i":7, "--color":"#00BCD4"}}>Feather</span>
            </div>
        </div>
    </header>
  );
}

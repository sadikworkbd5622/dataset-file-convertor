import { useEffect, useRef, useState } from "react";

export default function FormatSelector({ formats, source, target, onSourceChange, onTargetChange }) {
  const [sourceOpen, setSourceOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  
  const sourceRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (sourceRef.current && !sourceRef.current.contains(e.target)) setSourceOpen(false);
      if (targetRef.current && !targetRef.current.contains(e.target)) setTargetOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const readableFormats = formats.filter(f => f.can_read);
  const writableFormats = formats.filter(f => f.can_write);

  const getSourceIcon = () => source === "auto" ? "🔍" : (formats.find(f => f.id === source)?.icon || "📁");
  const getSourceName = () => source === "auto" ? "Auto-detect" : (formats.find(f => f.id === source)?.name || source);
  const getTargetIcon = () => formats.find(f => f.id === target)?.icon || "🔶";
  const getTargetName = () => formats.find(f => f.id === target)?.name || target;

  return (
    <section className="format-selector" id="formatSelector">
      <div className="format-selector__row">
        <div className="format-selector__group">
          <label className="format-selector__label" htmlFor="sourceFormatSelect">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Source Format
          </label>
          <div className={`custom-select ${sourceOpen ? "open" : ""}`} ref={sourceRef} onClick={() => setSourceOpen(!sourceOpen)}>
            <button className="custom-select__trigger" type="button">
              <span className="custom-select__icon">{getSourceIcon()}</span>
              <span className="custom-select__text">{getSourceName()}</span>
              <svg className="custom-select__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div className="custom-select__dropdown">
              <button 
                type="button" 
                className={`custom-select__option ${source === "auto" ? "active" : ""}`} 
                onClick={(e) => { e.stopPropagation(); onSourceChange("auto"); setSourceOpen(false); }}
              >
                <span className="custom-select__option-icon">🔍</span>
                <span className="custom-select__option-info">
                  <span className="custom-select__option-name">Auto-detect</span>
                  <span className="custom-select__option-desc">Detect from file extension</span>
                </span>
              </button>
              {readableFormats.map(fmt => (
                <button 
                  key={fmt.id}
                  type="button" 
                  className={`custom-select__option ${!fmt.available ? "unavailable" : ""} ${source === fmt.id ? "active" : ""}`}
                  onClick={(e) => { 
                    e.stopPropagation();
                    if(fmt.available) { onSourceChange(fmt.id); setSourceOpen(false); }
                  }}
                >
                  <span className="custom-select__option-icon">{fmt.icon}</span>
                  <span className="custom-select__option-info">
                    <span className="custom-select__option-name">{fmt.name}</span>
                    <span className="custom-select__option-desc">{fmt.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="format-selector__arrow-wrap">
          <div className="format-selector__arrow">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>

        <div className="format-selector__group">
          <label className="format-selector__label" htmlFor="targetFormatSelect">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Target Format
          </label>
          <div className={`custom-select ${targetOpen ? "open" : ""}`} ref={targetRef} onClick={() => setTargetOpen(!targetOpen)}>
            <button className="custom-select__trigger" type="button">
              <span className="custom-select__icon">{getTargetIcon()}</span>
              <span className="custom-select__text">{getTargetName()}</span>
              <svg className="custom-select__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div className="custom-select__dropdown">
              {writableFormats.map(fmt => (
                <button 
                  key={fmt.id}
                  type="button" 
                  className={`custom-select__option ${!fmt.available ? "unavailable" : ""} ${target === fmt.id ? "active" : ""}`}
                  onClick={(e) => { 
                    e.stopPropagation();
                    if(fmt.available) { onTargetChange(fmt.id); setTargetOpen(false); }
                  }}
                >
                  <span className="custom-select__option-icon">{fmt.icon}</span>
                  <span className="custom-select__option-info">
                    <span className="custom-select__option-name">{fmt.name}</span>
                    <span className="custom-select__option-desc">{fmt.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

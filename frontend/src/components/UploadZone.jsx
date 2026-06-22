import { useRef, useState } from "react";

export default function UploadZone({ 
  formats, 
  sourceFormat, 
  targetFormat, 
  isConverting, 
  onUpload
}) {
  const [dragover, setDragover] = useState(false);
  const fileInputRef = useRef(null);

  if (isConverting) return null;

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragover(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragover(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragover(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
    e.target.value = "";
  };

  const accept = sourceFormat === "auto" 
    ? formats.flatMap(f => f.extensions).join(",") 
    : (formats.find(f => f.id === sourceFormat)?.extensions || []).join(",");

  return (
    <section 
      className={`upload-zone ${dragover ? "dragover" : ""}`}
      tabIndex="0" 
      role="button" 
      aria-label="Upload dataset file"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnter={handleDragOver}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
    >
      <div className="upload-zone__content">
        <div className="upload-zone__icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <h2 className="upload-zone__title">Drop your dataset file here</h2>
        <p className="upload-zone__hint">or click to browse · up to 500 MB</p>
        <div className="upload-zone__formats">
          <span className="upload-zone__format-tag">CSV</span>
          <span className="upload-zone__format-tag">JSON</span>
          <span className="upload-zone__format-tag">Parquet</span>
          <span className="upload-zone__format-tag">Excel</span>
          <span className="upload-zone__format-tag">XML</span>
          <span className="upload-zone__format-tag">YAML</span>
          <span className="upload-zone__format-tag">SQLite</span>
          <span className="upload-zone__format-tag">+6 more</span>
        </div>
      </div>

      <input 
        type="file" 
        hidden 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept={accept}
      />
    </section>
  );
}

export function UploadProgress({ isConverting, sourceFormat, targetFormat, uploadStatus, progressPct, formats, uploadedFileName }) {
  if (!isConverting) return null;

  const getSourceLabel = () => {
    if (sourceFormat === "auto") {
        if (!uploadedFileName) return "FILE";
        const detected = formats.find(f => f.extensions.some(ext => uploadedFileName.toLowerCase().endsWith(ext)));
        return detected ? detected.name : "FILE";
    }
    const fmt = formats.find(f => f.id === sourceFormat);
    return fmt ? fmt.name : sourceFormat.toUpperCase();
  };

  const getTargetLabel = () => {
    const fmt = formats.find(f => f.id === targetFormat);
    return fmt ? fmt.name : targetFormat.toUpperCase();
  };

  return (
    <section className="upload-zone" style={{ pointerEvents: "none" }}>
      <div className="upload-zone__progress">
        <div className="conversion-animation">
          <span className="conversion-animation__from">{getSourceLabel()}</span>
          <div className="conversion-animation__dots">
            <span></span><span></span><span></span>
          </div>
          <span className="conversion-animation__to">{getTargetLabel()}</span>
        </div>
        <p className="upload-zone__status">{uploadStatus}</p>
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${progressPct}%` }}></div>
        </div>
      </div>
    </section>
  );
}

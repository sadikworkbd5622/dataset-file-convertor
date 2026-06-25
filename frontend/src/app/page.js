"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FormatSelector from "@/components/FormatSelector";
import UploadZone, { UploadProgress } from "@/components/UploadZone";
import ConversionResults from "@/components/ConversionResults";
import ConversionHistory from "@/components/ConversionHistory";
import ErrorPanel from "@/components/ErrorPanel";
import ToastContainer, { useToast } from "@/components/Toast";

import { fetchFormats, uploadFile, pollStatus } from "@/lib/api";

export default function Home() {
  const [formats, setFormats] = useState([]);
  const [sourceFormat, setSourceFormat] = useState("auto");
  const [targetFormat, setTargetFormat] = useState("json");
  const [theme, setTheme] = useState("light");
  const [themeReady, setThemeReady] = useState(false);
  
  const [isConverting, setIsConverting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const [jobResult, setJobResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [history, setHistory] = useState([]);
  const { toasts, showToast } = useToast();

  useEffect(() => {
    // Load formats
    fetchFormats().then(data => {
      setFormats(data.formats);
    }).catch(err => {
      console.error(err);
      showToast("Failed to load formats", "error");
    });

    // Load history
    const stored = localStorage.getItem("df_history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem("df_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(storedTheme || (prefersDark ? "dark" : "light"));
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("df_theme", theme);
  }, [theme, themeReady]);

  const handleUpload = async (file, sourceOverride = sourceFormat, targetOverride = targetFormat) => {
    setUploadedFileName(file.name);
    setIsConverting(true);
    setJobResult(null);
    setError(null);
    setUploadStatus("Starting conversion...");
    setProgressPct(10);

    try {
      const data = await uploadFile(file, sourceOverride, targetOverride);
      setProgressPct(40);
      setUploadStatus("Processing...");
      
      const poll = async () => {
        try {
          const statusData = await pollStatus(data.task_id);
          if (statusData.state === "SUCCESS") {
            setProgressPct(100);
            setTimeout(() => {
              setJobResult(statusData.result);
              setIsConverting(false);
              showToast("Conversion completed successfully!", "success");
              
              // Update history
              const newEntry = {
                filename: statusData.result.filename,
                source_format: statusData.result.source_format,
                target_format: statusData.result.target_format,
                rows: statusData.result.rows,
                columns: statusData.result.columns,
                elapsed_seconds: statusData.result.elapsed_seconds,
                converted_at: statusData.result.converted_at,
              };
              setHistory(prev => {
                const newHist = [newEntry, ...prev].slice(0, 20);
                localStorage.setItem("df_history", JSON.stringify(newHist));
                return newHist;
              });
            }, 300);
          } else if (statusData.state === "FAILURE") {
            throw new Error(statusData.error || "Conversion failed");
          } else {
            if (statusData.state === "PROCESSING") {
              setProgressPct(60);
              if (statusData.status) setUploadStatus(statusData.status);
            }
            setTimeout(poll, 800);
          }
        } catch (err) {
          setError(err.message);
          setIsConverting(false);
          showToast("Conversion failed", "error");
        }
      };
      
      poll();
    } catch (err) {
      setError(err.message);
      setIsConverting(false);
      showToast(err.message, "error");
    }
  };

  const handleReset = () => {
    setJobResult(null);
    setError(null);
    setIsConverting(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("df_history");
    showToast("History cleared", "info");
  };

  const handleThemeToggle = () => {
    setTheme(current => current === "dark" ? "light" : "dark");
  };

  const handleSampleUpload = () => {
    const sampleCsv = [
      "order_id,region,revenue,status",
      "1001,North,12450,paid",
      "1002,West,8420,pending",
      "1003,South,18620,paid",
      "1004,East,5920,refunded",
    ].join("\n");
    const sampleFile = new File([sampleCsv], "dataforge_sample.csv", { type: "text/csv" });
    setSourceFormat("auto");
    setTargetFormat("json");
    handleUpload(sampleFile, "auto", "json");
  };

  return (
    <>
      <ToastContainer toasts={toasts} />
      <main className="container" data-theme-ready={themeReady}>
        <Header theme={theme} onToggleTheme={handleThemeToggle} />

        <section className="converter-panel" id="formats" aria-label="Dataset converter">
          <div className="converter-panel__header">
            <div>
              <span className="converter-panel__eyebrow">Conversion desk</span>
              <h2>Prepare your file</h2>
            </div>
            <div className="converter-panel__actions">
              <button className="sample-demo-btn" type="button" onClick={handleSampleUpload} disabled={isConverting}>
                Try sample data
              </button>
              <span className="converter-panel__note">Auto-detect available</span>
            </div>
          </div>

          {!jobResult && (
            <FormatSelector 
              formats={formats} 
              source={sourceFormat} 
              target={targetFormat} 
              onSourceChange={setSourceFormat} 
              onTargetChange={setTargetFormat} 
            />
          )}

          {!jobResult && !error && (
            <UploadZone 
              formats={formats} 
              sourceFormat={sourceFormat} 
              targetFormat={targetFormat}
              isConverting={isConverting}
              onUpload={handleUpload}
            />
          )}

          <UploadProgress 
              isConverting={isConverting}
              sourceFormat={sourceFormat}
              targetFormat={targetFormat}
              uploadStatus={uploadStatus}
              progressPct={progressPct}
              formats={formats}
              uploadedFileName={uploadedFileName}
          />

          <ConversionResults 
            job={jobResult} 
            formats={formats} 
            onReset={handleReset} 
          />

          <ErrorPanel 
            error={error} 
            onReset={handleReset} 
          />
        </section>

        <section className="how-it-works" id="preview" aria-label="How DataForge works">
          <div className="section-heading">
            <span>Workflow</span>
            <h2>From upload to clean output in three steps.</h2>
          </div>
          <div className="info-grid">
            <article className="info-card">
              <span className="info-card__step">01</span>
              <h3>Upload</h3>
              <p>Drop in a dataset and let DataForge detect the source format automatically.</p>
            </article>
            <article className="info-card">
              <span className="info-card__step">02</span>
              <h3>Review</h3>
              <p>Preview schema, row counts, columns, and conversion metadata before download.</p>
            </article>
            <article className="info-card">
              <span className="info-card__step">03</span>
              <h3>Export</h3>
              <p>Download a ready-to-use file in your selected output format.</p>
            </article>
          </div>
        </section>

        <section className="trust-panel" aria-label="Privacy and reliability">
          <div>
            <span className="trust-panel__eyebrow">Privacy first</span>
            <h2>Built for practical data handoffs.</h2>
            <p>Files are processed on the server for conversion and automatically removed after the job completes.</p>
          </div>
          <ul>
            <li>Temporary conversion storage</li>
            <li>No account required for local use</li>
            <li>Clear schema and preview output</li>
          </ul>
        </section>

        <section id="export">
          <ConversionHistory 
            history={history} 
            formats={formats} 
            onClearHistory={handleClearHistory} 
          />
        </section>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand-block">
            <div className="footer__brand-row">
              <span className="footer__mark" aria-hidden="true">DF</span>
              <div>
                <p className="footer__brand">DataForge</p>
                <p className="footer__creator">by Hanjala Habib Sadik</p>
              </div>
            </div>
            <p className="footer__description">
              Universal dataset converter for CSV, JSON, Parquet, Excel, XML,
              YAML, SQLite, and more.
            </p>
            <p className="footer__privacy">
              Files are processed on-server and automatically deleted after conversion.
            </p>
          </div>

          <div className="footer__columns">
            <nav className="footer__column" aria-label="Product links">
              <h2>Product</h2>
              <a href="#formats">Formats</a>
              <a href="#preview">Preview</a>
              <a href="#export">Export history</a>
            </nav>

            <nav className="footer__column" aria-label="Creator profiles">
              <h2>Creator</h2>
              <a href="https://github.com/sadikworkbd5622" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/hanjala-habib-sadik/" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href="https://www.hanjalahabibsadik.me/" target="_blank" rel="noreferrer">
                Portfolio
              </a>
            </nav>

            <div className="footer__column footer__column--contact">
              <h2>Contact</h2>
              <a
                className="footer__gmail-btn"
                href="https://mail.google.com/mail/?view=cm&fs=1&to=sadik.work.bd@gmail.com"
                target="_blank"
                rel="noreferrer"
              >
                Gmail
              </a>
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2026 DataForge. All rights reserved.</span>
          <span>Built for fast, practical dataset conversion.</span>
        </div>
      </footer>
    </>
  );
}

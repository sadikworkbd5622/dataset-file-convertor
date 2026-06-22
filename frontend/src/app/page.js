"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FormatSelector from "@/components/FormatSelector";
import UploadZone, { UploadProgress } from "@/components/UploadZone";
import ConversionResults from "@/components/ConversionResults";
import ConversionHistory from "@/components/ConversionHistory";
import ErrorPanel from "@/components/ErrorPanel";
import ToastContainer, { useToast } from "@/components/Toast";
import ParticleCanvas from "@/components/ParticleCanvas";

import { fetchFormats, uploadFile, pollStatus } from "@/lib/api";

export default function Home() {
  const [formats, setFormats] = useState([]);
  const [sourceFormat, setSourceFormat] = useState("auto");
  const [targetFormat, setTargetFormat] = useState("json");
  
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

  const handleUpload = async (file) => {
    setUploadedFileName(file.name);
    setIsConverting(true);
    setJobResult(null);
    setError(null);
    setUploadStatus("Starting conversion...");
    setProgressPct(10);

    try {
      const data = await uploadFile(file, sourceFormat, targetFormat);
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

  return (
    <>
      <ParticleCanvas />
      <ToastContainer toasts={toasts} />
      <main className="container">
        <Header />
        
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

        <ConversionHistory 
          history={history} 
          formats={formats} 
          onClearHistory={handleClearHistory} 
        />
      </main>

      <footer className="footer">
        <p>Files are processed on-server and automatically deleted after conversion.</p>
        <p className="footer__brand">DataForge — Universal Dataset Converter</p>
      </footer>
    </>
  );
}

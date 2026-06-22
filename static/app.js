/**
 * Parquet → JSON Converter — Client Logic
 * Handles drag-and-drop, upload, conversion results display, and download.
 */

(() => {
    "use strict";

    // ──── DOM References ────
    const uploadZone    = document.getElementById("uploadZone");
    const uploadContent = document.getElementById("uploadContent");
    const uploadProgress= document.getElementById("uploadProgress");
    const uploadStatus  = document.getElementById("uploadStatus");
    const progressFill  = document.getElementById("progressBarFill");
    const fileInput     = document.getElementById("fileInput");
    const analyzeCb     = document.getElementById("analyzeCheckbox");

    const resultsEl     = document.getElementById("results");
    const errorPanel    = document.getElementById("errorPanel");
    const errorMessage  = document.getElementById("errorMessage");

    const statRowsVal   = document.getElementById("statRowsValue");
    const statColsVal   = document.getElementById("statColsValue");
    const statPqSize    = document.getElementById("statParquetSizeValue");
    const statJsonSize  = document.getElementById("statJsonSizeValue");

    const schemaBody    = document.getElementById("schemaBody");
    const previewCode   = document.getElementById("previewCode");

    const btnDownload   = document.getElementById("btnDownload");
    const btnDownloadTxt= document.getElementById("btnDownloadText");
    const btnReset      = document.getElementById("btnReset");
    const btnErrorReset = document.getElementById("btnErrorReset");

    let currentJob = null;

    // ──── Helpers ────
    function formatBytes(bytes) {
        if (bytes === 0) return "0 B";
        const units = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + " " + units[i];
    }

    function formatNumber(n) {
        return n.toLocaleString("en-US");
    }

    function syntaxHighlight(json) {
        const str = JSON.stringify(json, null, 2);
        return str.replace(
            /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
            (match) => {
                let cls = "json-number";
                if (/^"/.test(match)) {
                    cls = /:$/.test(match) ? "json-key" : "json-string";
                } else if (/true|false/.test(match)) {
                    cls = "json-boolean";
                } else if (/null/.test(match)) {
                    cls = "json-null";
                }
                return `<span class="${cls}">${match}</span>`;
            }
        );
    }

    function show(el) { el.classList.remove("hidden"); }
    function hide(el) { el.classList.add("hidden"); }

    // ──── Drag & Drop ────
    ["dragenter", "dragover"].forEach(evt => {
        uploadZone.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.classList.add("dragover");
        });
    });
    ["dragleave", "drop"].forEach(evt => {
        uploadZone.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.classList.remove("dragover");
        });
    });

    uploadZone.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0]);
    });

    uploadZone.addEventListener("click", () => fileInput.click());
    uploadZone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInput.click();
        }
    });
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
    });

    // ──── Upload & Convert ────
    async function handleFile(file) {
        if (!file.name.toLowerCase().endsWith(".parquet")) {
            showError("Please select a .parquet file.");
            return;
        }

        // Switch to progress state
        hide(uploadContent);
        show(uploadProgress);
        hide(resultsEl);
        hide(errorPanel);
        uploadZone.style.pointerEvents = "none";

        uploadStatus.textContent = `Uploading ${file.name}…`;
        progressFill.style.width = "0%";

        const formData = new FormData();
        formData.append("file", file);
        if (analyzeCb && analyzeCb.checked) {
            formData.append("analyze", "true");
        }

        try {
            // Upload file to get task ID
            const response = await fetch("/api/convert", {
                method: "POST",
                body: formData
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Upload failed");
            }

            // Start polling
            uploadStatus.textContent = "Processing Parquet to JSON...";
            progressFill.style.width = "50%";
            pollStatus(data.task_id);
            
        } catch (err) {
            showError(err.message);
        }
    }

    async function pollStatus(taskId) {
        try {
            const res = await fetch(`/api/status/${taskId}`);
            const data = await res.json();

            if (data.state === "SUCCESS") {
                progressFill.style.width = "100%";
                currentJob = data.result;
                displayResults(data.result);
            } else if (data.state === "FAILURE") {
                throw new Error(data.error || "Conversion failed");
            } else {
                // PENDING or PROCESSING -> Keep polling
                setTimeout(() => pollStatus(taskId), 1000);
            }
        } catch (err) {
            showError(err.message);
        }
    }

    // ──── Display Results ────
    function displayResults(data) {
        // Reset upload zone
        resetUploadZone();
        hide(uploadZone);

        // Populate stats
        statRowsVal.textContent  = formatNumber(data.rows);
        statColsVal.textContent  = formatNumber(data.columns);
        statPqSize.textContent   = formatBytes(data.parquet_size);
        statJsonSize.textContent = formatBytes(data.json_size);

        // Animate stat values
        document.querySelectorAll(".stat-card").forEach((card, i) => {
            card.style.animation = "none";
            card.offsetHeight; // trigger reflow
            card.style.animation = `fadeInUp .5s ${i * .08}s cubic-bezier(.4,0,.2,1) both`;
        });

        // Populate schema table
        schemaBody.innerHTML = "";
        data.column_names.forEach((col, i) => {
            const type = data.column_types[col] || "string";
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${i + 1}</td>
                <td class="col-name">${escapeHtml(col)}</td>
                <td><span class="type-badge type-badge--${type}">${type}</span></td>
            `;
            schemaBody.appendChild(tr);
        });

        // Populate JSON preview
        previewCode.innerHTML = syntaxHighlight(data.preview);

        // Set download link
        btnDownloadTxt.textContent = `Download ${data.filename}`;
        btnDownload.onclick = () => {
            window.location.href = `/api/download/${data.job_id}?name=${encodeURIComponent(data.filename)}`;
        };

        show(resultsEl);
    }

    // ──── Error ────
    function showError(msg) {
        resetUploadZone();
        hide(resultsEl);
        errorMessage.textContent = msg;
        show(errorPanel);
    }

    // ──── Reset ────
    function resetUploadZone() {
        show(uploadContent);
        hide(uploadProgress);
        uploadZone.style.pointerEvents = "";
        progressFill.style.width = "0%";
        fileInput.value = "";
    }

    function fullReset() {
        resetUploadZone();
        show(uploadZone);
        hide(resultsEl);
        hide(errorPanel);
        currentJob = null;
    }

    btnReset.addEventListener("click", fullReset);
    btnErrorReset.addEventListener("click", fullReset);

    // ──── Utils ────
    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }
})();

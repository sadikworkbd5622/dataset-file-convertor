/**
 * DataForge — Universal Dataset Converter
 * Client-side logic: format selection, upload, conversion, results, history, toasts
 */

(() => {
    "use strict";

    // ═══════════════════════════════════════════
    // DOM References
    // ═══════════════════════════════════════════
    const $ = (sel) => document.getElementById(sel);

    const uploadZone      = $("uploadZone");
    const uploadContent   = $("uploadContent");
    const uploadProgress  = $("uploadProgress");
    const uploadStatus    = $("uploadStatus");
    const progressFill    = $("progressBarFill");
    const fileInput       = $("fileInput");
    const convAnimFrom    = $("convAnimFrom");
    const convAnimTo      = $("convAnimTo");

    const resultsEl       = $("results");
    const errorPanel      = $("errorPanel");
    const errorMessage    = $("errorMessage");

    const statRowsVal     = $("statRowsValue");
    const statColsVal     = $("statColsValue");
    const statInputSize   = $("statInputSizeValue");
    const statOutputSize  = $("statOutputSizeValue");
    const schemaBody      = $("schemaBody");
    const schemaCount     = $("schemaCount");
    const previewCode     = $("previewCode");

    const badgeFrom       = $("badgeFrom");
    const badgeTo         = $("badgeTo");
    const badgeTime       = $("badgeTime");

    const btnDownload     = $("btnDownload");
    const btnDownloadTxt  = $("btnDownloadText");
    const btnReset        = $("btnReset");
    const btnErrorReset   = $("btnErrorReset");

    const historyList     = $("historyList");
    const historyEmpty    = $("historyEmpty");
    const btnClearHistory = $("btnClearHistory");
    const toastContainer  = $("toastContainer");

    // Source/target select elements
    const sourceSelectTrigger = $("sourceSelectTrigger");
    const sourceSelectIcon    = $("sourceSelectIcon");
    const sourceSelectText    = $("sourceSelectText");
    const sourceDropdown      = $("sourceDropdown");
    const sourceFormatSelect  = $("sourceFormatSelect");

    const targetSelectTrigger = $("targetSelectTrigger");
    const targetSelectIcon    = $("targetSelectIcon");
    const targetSelectText    = $("targetSelectText");
    const targetDropdown      = $("targetDropdown");
    const targetFormatSelect  = $("targetFormatSelect");

    // ═══════════════════════════════════════════
    // State
    // ═══════════════════════════════════════════
    let currentJob = null;
    let selectedSource = "auto";
    let selectedTarget = "json";
    let formats = [];
    let conversionHistory = JSON.parse(localStorage.getItem("df_history") || "[]");

    // ═══════════════════════════════════════════
    // Helpers
    // ═══════════════════════════════════════════
    function formatBytes(bytes) {
        if (bytes === 0) return "0 B";
        const units = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + " " + units[i];
    }

    function formatNumber(n) {
        return n.toLocaleString("en-US");
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function show(el) { if (el) el.classList.remove("hidden"); }
    function hide(el) { if (el) el.classList.add("hidden"); }

    function timeAgo(isoString) {
        const diff = Date.now() - new Date(isoString).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
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

    // ═══════════════════════════════════════════
    // Toast Notifications
    // ═══════════════════════════════════════════
    function showToast(message, type = "info") {
        const icons = { success: "✅", error: "❌", info: "ℹ️" };
        const toast = document.createElement("div");
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <span class="toast__icon">${icons[type]}</span>
            <span class="toast__message">${escapeHtml(message)}</span>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("hiding");
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ═══════════════════════════════════════════
    // Format Loading
    // ═══════════════════════════════════════════
    async function loadFormats() {
        try {
            const res = await fetch("/api/formats");
            const data = await res.json();
            formats = data.formats;
            populateFormatDropdowns();
            updateFileInputAccept();
        } catch (err) {
            console.error("Failed to load formats:", err);
        }
    }

    function populateFormatDropdowns() {
        // Source dropdown: keep auto-detect as first option, add all readable formats
        const readableFormats = formats.filter(f => f.can_read);
        readableFormats.forEach(fmt => {
            const btn = createFormatOption(fmt);
            sourceDropdown.appendChild(btn);
        });

        // Target dropdown: all writable formats
        targetDropdown.innerHTML = "";
        const writableFormats = formats.filter(f => f.can_write);
        writableFormats.forEach(fmt => {
            const btn = createFormatOption(fmt);
            if (fmt.id === selectedTarget) btn.classList.add("active");
            targetDropdown.appendChild(btn);
        });
    }

    function createFormatOption(fmt) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `custom-select__option${!fmt.available ? " unavailable" : ""}`;
        btn.dataset.value = fmt.id;
        btn.dataset.icon = fmt.icon;
        btn.innerHTML = `
            <span class="custom-select__option-icon">${fmt.icon}</span>
            <span class="custom-select__option-info">
                <span class="custom-select__option-name">${fmt.name}</span>
                <span class="custom-select__option-desc">${fmt.description}</span>
            </span>
        `;
        return btn;
    }

    function updateFileInputAccept() {
        if (selectedSource === "auto") {
            // Accept all supported extensions
            const allExts = formats.flatMap(f => f.extensions).join(",");
            fileInput.accept = allExts;
        } else {
            const fmt = formats.find(f => f.id === selectedSource);
            if (fmt) fileInput.accept = fmt.extensions.join(",");
        }
    }

    // ═══════════════════════════════════════════
    // Custom Select Logic
    // ═══════════════════════════════════════════
    function setupSelect(selectEl, triggerEl, dropdownEl, iconEl, textEl, onSelect) {
        // Toggle dropdown
        triggerEl.addEventListener("click", (e) => {
            e.stopPropagation();
            // Close other selects
            document.querySelectorAll(".custom-select.open").forEach(s => {
                if (s !== selectEl) s.classList.remove("open");
            });
            selectEl.classList.toggle("open");
        });

        // Handle option click (event delegation)
        dropdownEl.addEventListener("click", (e) => {
            const option = e.target.closest(".custom-select__option");
            if (!option || option.classList.contains("unavailable")) return;

            const value = option.dataset.value;
            const icon = option.dataset.icon;
            const name = option.querySelector(".custom-select__option-name")?.textContent || value;

            // Update visual
            iconEl.textContent = icon;
            textEl.textContent = name;

            // Mark active
            dropdownEl.querySelectorAll(".custom-select__option").forEach(o => o.classList.remove("active"));
            option.classList.add("active");

            selectEl.classList.remove("open");
            onSelect(value);
        });
    }

    // Close dropdowns on outside click
    document.addEventListener("click", () => {
        document.querySelectorAll(".custom-select.open").forEach(s => s.classList.remove("open"));
    });

    // Source select
    setupSelect(sourceFormatSelect, sourceSelectTrigger, sourceDropdown, sourceSelectIcon, sourceSelectText, (val) => {
        selectedSource = val;
        updateFileInputAccept();
    });

    // Target select
    setupSelect(targetFormatSelect, targetSelectTrigger, targetDropdown, targetSelectIcon, targetSelectText, (val) => {
        selectedTarget = val;
    });

    // ═══════════════════════════════════════════
    // Drag & Drop
    // ═══════════════════════════════════════════
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

    // ═══════════════════════════════════════════
    // Upload & Convert
    // ═══════════════════════════════════════════
    async function handleFile(file) {
        // Validate file has an extension we recognize
        const fileName = file.name.toLowerCase();
        const supportedExts = formats.flatMap(f => f.extensions);
        const hasValidExt = supportedExts.some(ext => fileName.endsWith(ext));

        if (!hasValidExt) {
            showError(`Unsupported file format: ${file.name}`);
            showToast(`Unsupported file format`, "error");
            return;
        }

        // Determine source format label
        let sourceLabel = selectedSource.toUpperCase();
        if (selectedSource === "auto") {
            const detected = formats.find(f => f.extensions.some(ext => fileName.endsWith(ext)));
            sourceLabel = detected ? detected.name : "FILE";
        }

        const targetFmt = formats.find(f => f.id === selectedTarget);
        const targetLabel = targetFmt ? targetFmt.name : selectedTarget.toUpperCase();

        // Check source !== target
        if (selectedSource !== "auto") {
            if (selectedSource === selectedTarget) {
                showError("Source and target formats are the same. Please choose different formats.");
                return;
            }
        }

        // Switch to progress state
        hide(uploadContent);
        show(uploadProgress);
        hide(resultsEl);
        hide(errorPanel);
        uploadZone.style.pointerEvents = "none";

        convAnimFrom.textContent = sourceLabel;
        convAnimTo.textContent = targetLabel;
        uploadStatus.textContent = `Converting ${sourceLabel} → ${targetLabel}...`;
        progressFill.style.width = "10%";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("target_format", selectedTarget);
        if (selectedSource !== "auto") {
            formData.append("source_format", selectedSource);
        }

        try {
            const response = await fetch("/api/convert", { method: "POST", body: formData });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Upload failed");
            }

            progressFill.style.width = "40%";
            uploadStatus.textContent = "Processing...";
            pollStatus(data.task_id);

        } catch (err) {
            showError(err.message);
            showToast(err.message, "error");
        }
    }

    async function pollStatus(taskId) {
        try {
            const res = await fetch(`/api/status/${taskId}`);
            const data = await res.json();

            if (data.state === "SUCCESS") {
                progressFill.style.width = "100%";
                setTimeout(() => {
                    currentJob = data.result;
                    displayResults(data.result);
                    addToHistory(data.result);
                    showToast("Conversion completed successfully!", "success");
                }, 300);
            } else if (data.state === "FAILURE") {
                throw new Error(data.error || "Conversion failed");
            } else {
                // PENDING or PROCESSING → Keep polling
                if (data.state === "PROCESSING") {
                    progressFill.style.width = "60%";
                    if (data.status) uploadStatus.textContent = data.status;
                }
                setTimeout(() => pollStatus(taskId), 800);
            }
        } catch (err) {
            showError(err.message);
            showToast("Conversion failed", "error");
        }
    }

    // ═══════════════════════════════════════════
    // Display Results
    // ═══════════════════════════════════════════
    function displayResults(data) {
        resetUploadZone();
        hide(uploadZone);

        // Conversion badge
        const srcFmt = formats.find(f => f.id === data.source_format);
        const tgtFmt = formats.find(f => f.id === data.target_format);
        badgeFrom.textContent = srcFmt ? srcFmt.name : data.source_format.toUpperCase();
        badgeTo.textContent = tgtFmt ? tgtFmt.name : data.target_format.toUpperCase();
        badgeTime.textContent = `${data.elapsed_seconds}s`;

        // Stats
        statRowsVal.textContent  = formatNumber(data.rows);
        statColsVal.textContent  = formatNumber(data.columns);
        statInputSize.textContent = formatBytes(data.input_size);
        statOutputSize.textContent = formatBytes(data.output_size);

        // Animate stat cards
        document.querySelectorAll(".stat-card").forEach((card, i) => {
            card.style.animation = "none";
            card.offsetHeight;
            card.style.animation = `fadeInUp .5s ${i * .08}s cubic-bezier(.4,0,.2,1) both`;
        });

        // Schema table
        schemaBody.innerHTML = "";
        schemaCount.textContent = `${data.columns} columns`;
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

        // JSON preview
        previewCode.innerHTML = syntaxHighlight(data.preview);

        // Download link
        btnDownloadTxt.textContent = `Download ${data.filename}`;
        btnDownload.onclick = () => {
            window.location.href = `/api/download/${data.job_id}?name=${encodeURIComponent(data.filename)}`;
        };

        show(resultsEl);
    }

    // ═══════════════════════════════════════════
    // History
    // ═══════════════════════════════════════════
    function addToHistory(data) {
        const entry = {
            filename: data.filename,
            source_format: data.source_format,
            target_format: data.target_format,
            rows: data.rows,
            columns: data.columns,
            elapsed_seconds: data.elapsed_seconds,
            converted_at: data.converted_at,
        };
        conversionHistory.unshift(entry);
        if (conversionHistory.length > 20) conversionHistory.pop();
        localStorage.setItem("df_history", JSON.stringify(conversionHistory));
        renderHistory();
    }

    function renderHistory() {
        if (conversionHistory.length === 0) {
            historyList.innerHTML = "";
            historyList.appendChild(historyEmpty.cloneNode(true));
            show(historyList.querySelector(".history-empty"));
            return;
        }

        historyList.innerHTML = "";
        conversionHistory.forEach(entry => {
            const srcFmt = formats.find(f => f.id === entry.source_format);
            const tgtFmt = formats.find(f => f.id === entry.target_format);

            const item = document.createElement("div");
            item.className = "history-item";
            item.innerHTML = `
                <div class="history-item__formats">
                    <span class="history-item__format history-item__format--from">${srcFmt ? srcFmt.name : entry.source_format}</span>
                    <span class="history-item__arrow">→</span>
                    <span class="history-item__format history-item__format--to">${tgtFmt ? tgtFmt.name : entry.target_format}</span>
                </div>
                <div class="history-item__info">
                    <div class="history-item__name">${escapeHtml(entry.filename)}</div>
                    <div class="history-item__meta">${formatNumber(entry.rows)} rows · ${formatNumber(entry.columns)} cols · ${entry.elapsed_seconds}s</div>
                </div>
                <div class="history-item__time">${timeAgo(entry.converted_at)}</div>
            `;
            historyList.appendChild(item);
        });
    }

    btnClearHistory.addEventListener("click", () => {
        conversionHistory = [];
        localStorage.removeItem("df_history");
        renderHistory();
        showToast("History cleared", "info");
    });

    // ═══════════════════════════════════════════
    // Error & Reset
    // ═══════════════════════════════════════════
    function showError(msg) {
        resetUploadZone();
        hide(resultsEl);
        errorMessage.textContent = msg;
        show(errorPanel);
    }

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

    // ═══════════════════════════════════════════
    // Keyboard Shortcuts
    // ═══════════════════════════════════════════
    document.addEventListener("keydown", (e) => {
        // Escape → reset
        if (e.key === "Escape") {
            fullReset();
        }
        // Ctrl/Cmd + U → open file picker
        if ((e.ctrlKey || e.metaKey) && e.key === "u") {
            e.preventDefault();
            fileInput.click();
        }
    });

    // ═══════════════════════════════════════════
    // Particle Canvas Background
    // ═══════════════════════════════════════════
    function initParticles() {
        const canvas = document.getElementById("particleCanvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let particles = [];
        let animId;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticles() {
            particles = [];
            const count = Math.floor((canvas.width * canvas.height) / 18000);
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.5 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.3,
                    speedY: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.4 + 0.1,
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(108, 92, 231, ${p.opacity})`;
                ctx.fill();

                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
            });
            animId = requestAnimationFrame(draw);
        }

        resize();
        createParticles();
        draw();

        window.addEventListener("resize", () => {
            resize();
            createParticles();
        });
    }

    // ═══════════════════════════════════════════
    // Init
    // ═══════════════════════════════════════════
    loadFormats().then(() => {
        renderHistory();
    });
    initParticles();

})();

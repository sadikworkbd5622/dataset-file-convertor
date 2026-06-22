export async function fetchFormats() {
    const res = await fetch("/api/formats");
    if (!res.ok) throw new Error("Failed to fetch formats");
    return res.json();
}

export async function uploadFile(file, sourceFormat, targetFormat) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_format", targetFormat);
    if (sourceFormat !== "auto") {
        formData.append("source_format", sourceFormat);
    }
    const res = await fetch("/api/convert", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
    }
    return data;
}

export async function pollStatus(taskId) {
    const res = await fetch(`/api/status/${taskId}`);
    if (!res.ok) throw new Error("Failed to fetch status");
    return res.json();
}

export function getDownloadUrl(jobId, filename) {
    return `/api/download/${jobId}?name=${encodeURIComponent(filename)}`;
}

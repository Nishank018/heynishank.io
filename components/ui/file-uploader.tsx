"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";

export function FileUploader({
  name,
  defaultValue = "",
  label,
  accept = "image/*,application/pdf",
  placeholder = "https://... or /uploads/...",
}: {
  name: string;
  defaultValue?: string;
  label: string;
  accept?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setValue(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const isImage =
    value &&
    (value.endsWith(".png") ||
      value.endsWith(".jpg") ||
      value.endsWith(".jpeg") ||
      value.endsWith(".webp") ||
      value.endsWith(".svg") ||
      value.includes("image") ||
      value.startsWith("/profile"));

  return (
    <div className="file-uploader-wrap">
      <div className="file-uploader-header">
        <label htmlFor={`input-${name}`} className="file-uploader-label">
          {label}
        </label>
        {value && (
          <button
            type="button"
            className="file-uploader-clear"
            onClick={() => setValue("")}
            title="Clear value"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="file-uploader-controls">
        <input
          id={`input-${name}`}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="file-uploader-input"
        />

        <label className={`file-uploader-btn ${isUploading ? "uploading" : ""}`}>
          <Upload size={13} />
          <span>{isUploading ? "Uploading…" : "Upload"}</span>
          <input
            type="file"
            accept={accept}
            onChange={handleUpload}
            disabled={isUploading}
            className="sr-only"
          />
        </label>
      </div>

      {error && <span className="file-uploader-error">{error}</span>}

      {isImage && (
        <div className="file-uploader-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" />
        </div>
      )}
    </div>
  );
}

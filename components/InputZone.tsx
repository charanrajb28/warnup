"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Image, FileText } from "lucide-react";

interface InputZoneProps {
  onTextChange: (text: string) => void;
  onFileChange: (file: File | null) => void;
  acceptedTypes?: Record<string, string[]>;
  placeholder?: string;
  showVoice?: boolean;
}

export default function InputZone({
  onTextChange,
  onFileChange,
  acceptedTypes = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "application/pdf": [".pdf"],
    "text/*": [".txt", ".md"],
  },
  placeholder = "Paste text, drop a file, or upload an image...",
}: InputZoneProps) {
  const [text, setText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "file">("text");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0]);
        onFileChange(acceptedFiles[0]);
        setActiveTab("file");
      }
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxFiles: 1,
  });

  const removeFile = () => {
    setUploadedFile(null);
    onFileChange(null);
    setActiveTab("text");
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <Image size={24} color="#3b82f6" aria-label="Image file icon" role="img" />;
    if (file.type === "application/pdf") return <FileText size={24} color="#8b5cf6" aria-label="PDF file icon" role="img" />;
    return <File size={24} color="#06b6d4" aria-label="Generic file icon" role="img" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--border)",
          marginBottom: 0,
        }}
      >
        {[
          { key: "text", label: "Text Input", icon: FileText },
          { key: "file", label: "File Upload", icon: Upload },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "text" | "file")}
            aria-label={`Switch to ${tab.label}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid var(--accent-blue)" : "2px solid transparent",
              color: activeTab === tab.key ? "var(--text-primary)" : "var(--text-muted)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Text tab */}
      {activeTab === "text" && (
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTextChange(e.target.value);
          }}
          aria-label="Text input area"
          placeholder={placeholder}
          style={{
            width: "100%",
            minHeight: 200,
            background: "rgba(5,8,16,0.5)",
            border: "1px solid var(--border)",
            borderTop: "none",
            borderRadius: "0 0 12px 12px",
            padding: "16px 20px",
            color: "var(--text-primary)",
            fontSize: 14,
            lineHeight: 1.7,
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      )}

      {/* File tab */}
      {activeTab === "file" && (
        <div style={{ borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
          {uploadedFile ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                background: "rgba(59,130,246,0.05)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderTop: "none",
                borderRadius: "0 0 12px 12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {getFileIcon(uploadedFile)}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{uploadedFile.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {formatSize(uploadedFile.size)} · {uploadedFile.type || "Unknown type"}
                  </div>
                </div>
              </div>
              <button
                className="btn-secondary"
                aria-label={`Remove uploaded file ${uploadedFile.name}`}
                onClick={removeFile}
                style={{ padding: "6px 12px", fontSize: 12 }}
              >
                <X size={14} />
                Remove
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={isDragActive ? "dropzone-active" : ""}
              style={{
                padding: "48px 24px",
                background: "rgba(5,8,16,0.5)",
                border: "1px dashed var(--border)",
                borderTop: "none",
                borderRadius: "0 0 12px 12px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              <input {...getInputProps()} aria-label="File upload dropzone" />
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Upload size={24} color="#3b82f6" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
                {isDragActive ? "Drop it here!" : "Drag & drop or click to upload"}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                PDF, PNG, JPG, WEBP, TXT supported
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

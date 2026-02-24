import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/Badge";

export interface FileUploadProps {
    onFileSelect: (file: File) => void;
    maxSizeMB?: number;
    acceptedTypes?: Record<string, string[]>;
}

/**
 * Premium glassmorphic drag-and-drop file upload zone.
 * Includes interactive hover physics and file validation.
 */
export function FileUpload({
    onFileSelect,
    maxSizeMB = 15,
    acceptedTypes = {
        "application/pdf": [".pdf"],
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
    },
}: FileUploadProps) {
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: any[]) => {
            setError(null);

            if (rejectedFiles.length > 0) {
                const rejection = rejectedFiles[0];
                if (rejection.errors[0]?.code === "file-too-large") {
                    setError(`File exceeds the ${maxSizeMB}MB limit.`);
                } else if (rejection.errors[0]?.code === "file-invalid-type") {
                    setError("Invalid file type. Only PDF and images are allowed.");
                } else {
                    setError("Error selecting file.");
                }
                return;
            }

            if (acceptedFiles.length > 0) {
                onFileSelect(acceptedFiles[0]);
            }
        },
        [maxSizeMB, onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: maxSizeMB * 1024 * 1024,
        accept: acceptedTypes,
        multiple: false,
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
          relative w-full p-10 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer
          transition-all duration-300 ease-premium border-2 border-dashed
          ${isDragActive
                        ? "border-[var(--accent-emerald)] bg-[var(--accent-emerald-glow)] scale-[1.02]"
                        : "border-[var(--border-glass)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)]"
                    }
        `}
            >
                <input {...getInputProps()} />

                {/* Animated Icon */}
                <div
                    className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center transition-transform duration-300 relative"
                    style={{
                        background: isDragActive ? "var(--accent-emerald)" : "rgba(255,255,255,0.05)",
                        boxShadow: isDragActive ? "0 0 30px rgba(16, 185, 129, 0.4)" : "none",
                        transform: isDragActive ? "translateY(-8px)" : "none"
                    }}
                >
                    <svg
                        width="32" height="32" viewBox="0 0 24 24" fill="none"
                        stroke={isDragActive ? "white" : "var(--text-secondary)"}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                </div>

                {/* Text Area */}
                <h3 className="text-section-title !text-lg mb-2 text-[var(--text-primary)] transition-colors">
                    {isDragActive ? "Drop the bill here" : "Drag & drop your hospital bill"}
                </h3>
                <p className="text-data-label max-w-sm mb-6">
                    or click to browse from your computer. Your file will be encrypted immediately upon selection.
                </p>

                {/* Supported Types Badges */}
                <div className="flex gap-2 justify-center opacity-80 pointer-events-none">
                    <Badge variant="neutral" size="sm">PDF</Badge>
                    <Badge variant="neutral" size="sm">JPG</Badge>
                    <Badge variant="neutral" size="sm">PNG</Badge>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 flex items-center gap-2 text-red-400 text-sm animate-fade-in-up bg-[rgba(239,68,68,0.1)] p-3 rounded-xl border border-red-500/20">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            )}
        </div>
    );
}

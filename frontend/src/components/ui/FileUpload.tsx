import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/Badge";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export interface FileUploadProps {
    onFileSelect: (file: File) => void;
    maxSizeMB?: number;
    acceptedTypes?: Record<string, string[]>;
}

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
    const containerRef = useRef<HTMLDivElement>(null);

    // Magnetic physics for the icon
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    const iconX = useTransform(x, [-100, 100], [-15, 15]);
    const iconY = useTransform(y, [-100, 100], [-15, 15]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate distance from center, capped for magnetic subtle effect
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;

        mouseX.set(dx);
        mouseY.set(dy);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: any[]) => {
            setError(null);
            mouseX.set(0);
            mouseY.set(0);

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
        [maxSizeMB, onFileSelect, mouseX, mouseY]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: maxSizeMB * 1024 * 1024,
        accept: acceptedTypes,
        multiple: false,
    });

    return (
        <div className="w-full">
            <motion.div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`
                    relative w-full rounded-3xl overflow-hidden group transition-all duration-500
                    ${isDragActive
                        ? "border-black bg-white"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-white"
                    }
                `}
                style={{
                    border: "1px dashed",
                    boxShadow: isDragActive ? "0 0 30px rgba(0, 240, 255, 0.15), inset 0 0 20px rgba(0, 240, 255, 0.05)" : "none"
                }}
            >
                {/* 
                  Dropzone wrapper: Separated from motion.div to prevent React event typing 
                  collisions (specifically onDrag) between Framer Motion and React Dropzone.
                */}
                <div {...getRootProps()} className="w-full h-full p-12 flex flex-col items-center justify-center text-center cursor-pointer relative z-10">
                    {/* Background ambient glow that follows mouse slightly */}
                    <motion.div
                        className="absolute w-64 h-64 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        style={{
                            background: "radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 70%)",
                            x: useTransform(x, [-100, 100], [-50, 50]),
                            y: useTransform(y, [-100, 100], [-50, 50]),
                        }}
                    />

                    <input {...getInputProps()} />

                    {/* Animated Magnetic Icon */}
                    <motion.div
                        className="w-20 h-20 rounded-2xl mb-8 flex items-center justify-center relative z-10"
                        style={{
                            background: isDragActive ? "linear-gradient(135deg, rgba(0,240,255,0.2) 0%, transparent 100%)" : "rgba(255,255,255,0.03)",
                            border: isDragActive ? "1px solid rgba(0,240,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                            boxShadow: isDragActive ? "0 0 20px rgba(0, 240, 255, 0.2)" : "none",
                            x: iconX,
                            y: iconY,
                        }}
                    >
                        <motion.svg
                            width="36" height="36" viewBox="0 0 24 24" fill="none"
                            stroke={isDragActive ? "#000000" : "#8892B0"}
                            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            animate={{
                                scale: isDragActive ? 1.1 : 1,
                                y: isDragActive ? [0, -4, 0] : 0
                            }}
                            transition={{ duration: 1.5, repeat: isDragActive ? Infinity : 0 }}
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </motion.svg>
                    </motion.div>

                    {/* Text Area */}
                    <h3
                        className="text-2xl font-bold mb-3 text-black transition-colors relative z-10"
                        style={{ fontFamily: "'Satoshi', sans-serif", letterSpacing: "-0.01em" }}
                    >
                        {isDragActive ? "Drop to initialize scan" : "Drag & drop to analyze"}
                    </h3>
                    <p className="text-gray-500 text-[15px] font-medium max-w-sm mb-8 relative z-10">
                        Upload your hospital bill securely. AI extraction begins instantly upon submission.
                    </p>

                    {/* Supported Types Badges */}
                    <div className="flex gap-2 justify-center opacity-70 pointer-events-none relative z-10">
                        <div className="px-3 py-1 rounded-md text-xs font-bold text-black bg-white border border-gray-200 uppercase tracking-widest">PDF</div>
                        <div className="px-3 py-1 rounded-md text-xs font-bold text-black bg-white border border-gray-200 uppercase tracking-widest">JPG</div>
                        <div className="px-3 py-1 rounded-md text-xs font-bold text-black bg-white border border-gray-200 uppercase tracking-widest">PNG</div>
                    </div>
                </div>
            </motion.div>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex items-center gap-3 text-red-400 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20 backdrop-blur-md"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </motion.div>
            )}
        </div>
    );
}

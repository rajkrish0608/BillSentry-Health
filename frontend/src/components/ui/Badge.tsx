import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** 
     * Variant options:
     * - success: Emerald — verified, aligned, safe
     * - warning: Amber — elevated risk, variance flagged
     * - caution: Deep Amber — high severity variance (replaces red per design doc)
     * - info: Cool Blue — informational/neutral
     * - neutral: Transparent — default, subdued
     * 
     * ⚠️ Red is PROHIBITED per design doc — amber is used for all warning/risk states.
     */
    variant?: "success" | "warning" | "caution" | "info" | "neutral";
    size?: "sm" | "md";
}

/**
 * Premium Status Badge for displaying risk levels, confidence scores, and statuses.
 * Design spec: No red. Amber replaces red for all elevated-risk states.
 */
export function Badge({
    children,
    className = "",
    variant = "neutral",
    size = "sm",
    ...props
}: BadgeProps) {

    const base = "inline-flex items-center justify-center font-medium rounded-full cursor-default font-[Inter]";

    const variants = {
        success: "badge-success",
        warning: "badge-warning",
        // Caution = deeper amber shade — replaces "danger/red" per design spec
        caution: "bg-[rgba(245,158,11,0.25)] text-[#D97706] border border-[rgba(217,119,6,0.3)]",
        info: "bg-[rgba(59,130,246,0.12)] text-[#60A5FA] border border-[rgba(96,165,250,0.2)]",
        neutral: "bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] border border-[var(--border-glass)]"
    };

    const sizes = {
        sm: "px-2.5 py-0.5 text-[11px] tracking-[0.04em]",
        md: "px-3 py-1 text-xs tracking-[0.02em]"
    };

    return (
        <span
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}

/**
 * Animated Confidence Meter — uses the stroke-dashoffset pattern from the design doc.
 * Color shifts from emerald → amber based on score threshold.
 */
export function ConfidenceMeter({ score }: { score: number }) {
    let color = "var(--accent-emerald)";
    if (score < 50) color = "var(--accent-amber)";
    else if (score < 80) color = "var(--accent-amber)";

    return (
        <div className="flex items-center gap-3">
            <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-1.5 overflow-hidden">
                <div
                    className="h-full rounded-full"
                    style={{
                        width: `${Math.max(0, Math.min(100, score))}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}`,
                        transition: `width 1s var(--ease-premium), background-color 0.5s var(--ease-premium)`
                    }}
                />
            </div>
            <span
                className="text-[11px] font-medium tracking-[0.04em] font-[Inter] tabular-nums whitespace-nowrap"
                style={{ color }}
            >
                {score}%
            </span>
        </div>
    );
}

/**
 * Risk Score Radial Indicator — circular SVG ring from design doc.
 * Uses stroke-dashoffset technique, color shifts from emerald → amber at threshold.
 */
export function RiskRadial({ score, size = 80 }: { score: number; size?: number }) {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score > 60 ? "var(--accent-amber)" : "var(--accent-emerald)";

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="4"
                />
                {/* Active ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="risk-ring"
                    style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                />
            </svg>
            <span
                className="absolute text-[13px] font-medium font-[Inter] tabular-nums"
                style={{ color }}
            >
                {score}
            </span>
        </div>
    );
}

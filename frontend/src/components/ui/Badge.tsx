import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "success" | "warning" | "danger" | "info" | "neutral";
    size?: "sm" | "md";
}

/**
 * Premium Status Badge for displaying risk levels, confidence scores, and statuses.
 */
export function Badge({
    children,
    className = "",
    variant = "neutral",
    size = "sm",
    ...props
}: BadgeProps) {

    const base = "inline-flex items-center justify-center font-medium rounded-full cursor-default transition-colors";

    const variants = {
        success: "badge-success",
        warning: "badge-warning",
        danger: "bg-[rgba(239,68,68,0.15)] text-red-400 border border-red-500/20",
        info: "bg-[rgba(59,130,246,0.15)] text-blue-400 border border-blue-500/20",
        neutral: "bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] border border-[var(--border-glass)]"
    };

    const sizes = {
        sm: "px-2.5 py-0.5 text-xs",
        md: "px-3 py-1 text-sm content-center h-7"
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
 * Animated Confidence Meter for report pages 
 */
export function ConfidenceMeter({ score }: { score: number }) {
    // Determine color based on score
    let color = "var(--accent-emerald)";
    if (score < 50) color = "#EF4444"; // Red
    else if (score < 80) color = "var(--accent-amber)";

    return (
        <div className="flex items-center gap-3">
            <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-1.5 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${Math.max(0, Math.min(100, score))}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}`
                    }}
                />
            </div>
            <span className="text-data-label !text-[12px] tabular-nums whitespace-nowrap" style={{ color }}>
                {score}% Confidence
            </span>
        </div>
    );
}

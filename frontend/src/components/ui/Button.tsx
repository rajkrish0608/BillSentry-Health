import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Variants:
     * - primary:   Emerald gradient CTA
     * - secondary: Transparent with glass border
     * - warning:   Amber accent (design doc prohibits red)
     * - ghost:     No border, text-only
     * - glass:     Glassmorphism panel style
     */
    variant?: "primary" | "secondary" | "warning" | "ghost" | "glass";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    fullWidth?: boolean;
}

/**
 * Premium button component matching the FinTech aesthetic.
 * 
 * Design spec timing:
 * - Hover transitions: 120–200ms with cubic-bezier(0.17, 0.67, 0.83, 0.67)
 * - No bouncy/cartoonish animations — "financial-grade motion"
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", isLoading = false, fullWidth = false, children, disabled, ...props }, ref) => {

        const base = [
            "inline-flex items-center justify-center font-medium font-[Inter]",
            "transition-all ease-[cubic-bezier(0.17,0.67,0.83,0.67)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        ].join(" ");

        const variants: Record<string, string> = {
            primary: "btn-primary focus-visible:ring-[var(--accent-emerald)]",
            secondary: "btn-secondary focus-visible:ring-[var(--text-secondary)]",
            // Amber warning — red is prohibited per design doc
            warning: [
                "bg-[var(--accent-amber-glow)] text-[var(--accent-amber)]",
                "border border-[rgba(245,158,11,0.2)]",
                "hover:bg-[rgba(245,158,11,0.25)]",
                "focus-visible:ring-[var(--accent-amber)]",
            ].join(" "),
            ghost: [
                "bg-transparent text-[var(--text-secondary)]",
                "hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)]",
                "focus-visible:ring-[var(--text-secondary)]",
            ].join(" "),
            glass: [
                "glass-panel hover:bg-[rgba(255,255,255,0.05)]",
                "focus-visible:ring-[var(--text-secondary)]",
            ].join(" "),
        };

        const durations: Record<string, string> = {
            primary: "duration-200",   // CTA: 200ms per spec
            secondary: "duration-[120ms]",
            warning: "duration-[120ms]",
            ghost: "duration-[120ms]",
            glass: "duration-[120ms]",
        };

        const sizes: Record<string, string> = {
            sm: "text-xs px-3 py-1.5 rounded-lg",
            md: "text-sm px-5 py-2.5 rounded-xl",
            lg: "text-base px-8 py-4 rounded-xl",
        };

        const width = fullWidth ? "w-full" : "";

        return (
            <button
                ref={ref}
                className={`${base} ${variants[variant]} ${durations[variant]} ${sizes[size]} ${width} ${className}`}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

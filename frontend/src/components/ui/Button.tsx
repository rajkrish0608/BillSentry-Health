import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "glass";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    fullWidth?: boolean;
}

/**
 * Premium button component matching the FinTech aesthetic.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", isLoading = false, fullWidth = false, children, ...props }, ref) => {

        const base = "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary: "btn-primary focus:ring-[var(--accent-emerald)]",
            secondary: "btn-secondary focus:ring-[var(--text-secondary)]",
            danger: "bg-[rgba(239,68,68,0.1)] text-red-500 border border-red-500/20 hover:bg-[rgba(239,68,68,0.2)] focus:ring-red-500",
            ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] focus:ring-[var(--text-secondary)]",
            glass: "glass-panel hover:bg-[rgba(255,255,255,0.05)] focus:ring-[var(--text-secondary)]"
        };

        const sizes = {
            sm: "text-xs px-3 py-1.5 rounded-lg",
            md: "text-sm px-5 py-2.5 rounded-xl",
            lg: "text-base px-8 py-4 rounded-xl"
        };

        const width = fullWidth ? "w-full" : "";

        return (
            <button
                ref={ref}
                className={`${base} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

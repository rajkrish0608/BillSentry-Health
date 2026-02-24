import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: "glass" | "solid" | "bordered";
    hoverEffect?: boolean;
}

/**
 * Premium glassmorphism card component with deep blur and subtle borders.
 */
export function Card({
    children,
    className = "",
    variant = "glass",
    hoverEffect = false,
    ...props
}: CardProps) {
    const baseStyles = "rounded-2xl transition-all duration-300 ease-out";

    const variants = {
        glass: "glass-panel",
        solid: "bg-[var(--bg-secondary)] shadow-lg border border-[var(--border-glass)]",
        bordered: "bg-transparent border border-[var(--border-glass)]"
    };

    const hoverStyles = hoverEffect
        ? "hover:border-[rgba(255,255,255,0.12)] hover:shadow-2xl hover:-translate-y-1"
        : "";

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`px-6 py-5 border-b border-[var(--border-glass)] flex items-center justify-between ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={`text-section-title text-[var(--text-primary)] ${className}`} {...props}>
            {children}
        </h3>
    );
}

export function CardContent({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`p-6 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`px-6 py-4 border-t border-[var(--border-glass)] bg-[rgba(0,0,0,0.1)] rounded-b-2xl flex items-center ${className}`} {...props}>
            {children}
        </div>
    );
}

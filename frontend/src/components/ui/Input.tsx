import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
}

/**
 * Premium input field with spec-exact timing and visual rules.
 * 
 * Design spec:
 * - Focus border: Emerald (#10B981)
 * - Error border: Amber (NOT red — red is prohibited)
 * - Transition: 120ms cubic-bezier(0.17, 0.67, 0.83, 0.67)
 * - Background: rgba(0,0,0,0.2)
 * - Border: rgba(255,255,255,0.06) matching glass panel spec
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", label, error, hint, icon, rightElement, id, ...props }, ref) => {

        const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

        const baseInput = [
            "w-full bg-[rgba(0,0,0,0.2)]",
            "border border-[var(--border-glass)]",
            "rounded-xl",
            "text-[var(--text-primary)] text-sm font-[Inter]",
            "placeholder-[var(--text-muted)]",
            "transition-all duration-[120ms] ease-[cubic-bezier(0.17,0.67,0.83,0.67)]",
            "focus:outline-none focus:border-[var(--accent-emerald)] focus:ring-1 focus:ring-[var(--accent-emerald)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            icon ? "pl-10" : "pl-4",
            rightElement ? "pr-10" : "pr-4",
            "py-3",
        ].join(" ");

        // Amber error border — red is prohibited per design doc
        const errorStyles = error
            ? "!border-[var(--accent-amber)] focus:!border-[var(--accent-amber)] focus:!ring-[rgba(245,158,11,0.2)]"
            : "";

        return (
            <div className="w-full flex flex-col gap-1.5">
                {label && (
                    <label htmlFor={inputId} className="text-data-label ml-1">
                        {label}
                        {props.required && <span className="text-[var(--accent-amber)] ml-1">*</span>}
                    </label>
                )}

                <div className="relative flex items-center">
                    {icon && (
                        <div className="absolute left-3 text-[var(--text-muted)] pointer-events-none">
                            {icon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={`${baseInput} ${errorStyles} ${className}`}
                        {...props}
                    />

                    {rightElement && (
                        <div className="absolute right-3 text-[var(--text-muted)]">
                            {rightElement}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="text-[11px] font-medium tracking-[0.04em] text-[var(--accent-amber)] ml-1 animate-fade-in-up" style={{ animationDuration: '200ms' }}>
                        {error}
                    </p>
                )}

                {hint && !error && (
                    <p className="text-[11px] font-medium tracking-[0.04em] text-[var(--text-muted)] ml-1">
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

/**
 * Textarea variant with matching spec styling.
 */
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ className = "", label, error, id, ...props }, ref) => {
        const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

        const baseStyles = [
            "w-full bg-[rgba(0,0,0,0.2)]",
            "border border-[var(--border-glass)]",
            "rounded-xl",
            "text-[var(--text-primary)] text-sm font-[Inter]",
            "placeholder-[var(--text-muted)]",
            "transition-all duration-[120ms] ease-[cubic-bezier(0.17,0.67,0.83,0.67)]",
            "focus:outline-none focus:border-[var(--accent-emerald)] focus:ring-1 focus:ring-[var(--accent-emerald)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "px-4 py-3 min-h-[100px] resize-y",
        ].join(" ");

        const errorStyles = error
            ? "!border-[var(--accent-amber)] focus:!border-[var(--accent-amber)] focus:!ring-[rgba(245,158,11,0.2)]"
            : "";

        return (
            <div className="w-full flex flex-col gap-1.5">
                {label && (
                    <label htmlFor={inputId} className="text-data-label ml-1">
                        {label}
                        {props.required && <span className="text-[var(--accent-amber)] ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    className={`${baseStyles} ${errorStyles} ${className}`}
                    {...props}
                />
                {error && (
                    <p className="text-[11px] font-medium tracking-[0.04em] text-[var(--accent-amber)] ml-1 animate-fade-in-up" style={{ animationDuration: '200ms' }}>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
TextArea.displayName = "TextArea";

/**
 * Select dropdown with matching spec styling.
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = "", label, error, options, id, ...props }, ref) => {
        const inputId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

        const baseStyles = [
            "w-full bg-[rgba(0,0,0,0.2)]",
            "border border-[var(--border-glass)]",
            "rounded-xl appearance-none",
            "text-[var(--text-primary)] text-sm font-[Inter]",
            "transition-all duration-[120ms] ease-[cubic-bezier(0.17,0.67,0.83,0.67)]",
            "focus:outline-none focus:border-[var(--accent-emerald)] focus:ring-1 focus:ring-[var(--accent-emerald)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "px-4 py-3 pr-10",
        ].join(" ");

        return (
            <div className="w-full flex flex-col gap-1.5">
                {label && (
                    <label htmlFor={inputId} className="text-data-label ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={inputId}
                        className={`${baseStyles} ${className}`}
                        {...props}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[var(--bg-secondary)]">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {/* Chevron icon */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>
                {error && (
                    <p className="text-[11px] font-medium tracking-[0.04em] text-[var(--accent-amber)] ml-1">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
Select.displayName = "Select";

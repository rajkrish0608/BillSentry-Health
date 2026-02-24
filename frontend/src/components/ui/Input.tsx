import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
}

/**
 * Premium input field with subtle glass borders, focus glow, and error states.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", label, error, icon, rightElement, id, ...props }, ref) => {

        // Auto-generate ID if none provided but label exists
        const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

        const baseInput = `
      w-full bg-[rgba(0,0,0,0.2)] border border-[var(--border-glass)] rounded-xl 
      text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)]
      transition-all duration-200 ease-out
      focus:outline-none focus:border-[var(--accent-emerald)] focus:ring-1 focus:ring-[var(--accent-emerald)]
      disabled:opacity-50 disabled:cursor-not-allowed
      ${icon ? 'pl-10' : 'pl-4'} 
      ${rightElement ? 'pr-10' : 'pr-4'} 
      py-3
    `;

        const errorInput = error
            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
            : "";

        return (
            <div className="w-full flex flex-col gap-1.5">
                {label && (
                    <label htmlFor={inputId} className="text-data-label ml-1">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
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
                        className={`${baseInput} ${errorInput} ${className}`}
                        {...props}
                    />

                    {rightElement && (
                        <div className="absolute right-3 text-[var(--text-muted)]">
                            {rightElement}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="text-xs text-red-500 ml-1 animate-fade-in-up" style={{ animationDuration: '200ms' }}>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

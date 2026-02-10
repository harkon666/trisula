import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for merging tailwind classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: "bg-gradient-to-r from-trisula-500 to-trisula-600 text-midnight-950 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] border-transparent",
            secondary: "bg-white/10 text-white hover:bg-white/20 border-white/5",
            outline: "bg-transparent border-trisula-500 text-trisula-500 hover:bg-trisula-500/10",
            ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 border-transparent shadow-none",
            danger: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
        };

        const sizes = {
            sm: "px-3 py-1.5 text-xs",
            md: "px-6 py-3 text-sm",
            lg: "px-8 py-4 text-lg"
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    "relative inline-flex items-center justify-center font-bold rounded-full transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-trisula-500/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
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

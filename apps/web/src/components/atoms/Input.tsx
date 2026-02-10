import { InputHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-trisula-500/50 focus:border-trisula-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                    error && "border-red-500/50 focus:ring-red-500/50",
                    className
                )}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

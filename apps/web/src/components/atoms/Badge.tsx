import { HTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "default", children, ...props }, ref) => {
        const variants = {
            default: "bg-zinc-800 text-zinc-300 border-zinc-700",
            success: "bg-green-500/10 text-green-400 border-green-500/20",
            warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            error: "bg-red-500/10 text-red-400 border-red-500/20",
            info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            outline: "bg-transparent border-white/10 text-zinc-400"
        };

        return (
            <span
                ref={ref}
                className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors",
                    variants[variant],
                    className
                )}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = "Badge";

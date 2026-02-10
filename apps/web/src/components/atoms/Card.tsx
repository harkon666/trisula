import { HTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "glass" | "solid" | "outline";
    glow?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "glass", glow = false, children, ...props }, ref) => {
        const variants = {
            glass: "bg-white/5 border border-white/10 backdrop-blur-xl",
            solid: "bg-midnight-900 border border-white/5",
            outline: "bg-transparent border border-zinc-800"
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-3xl p-6 relative overflow-hidden transition-all duration-300",
                    variants[variant],
                    glow && "hover:shadow-[0_0_30px_rgba(234,179,8,0.1)] hover:border-trisula-500/30",
                    className
                )}
                {...props}
            >
                {/* Optional inner glow for glass cards */}
                {variant === "glass" && (
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                )}
                <div className="relative z-10">{children}</div>
            </div>
        );
    }
);

Card.displayName = "Card";

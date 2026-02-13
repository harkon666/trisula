"use client";

import React, { useRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    shimmerColor?: string;
    shimmerSize?: string;
    borderRadius?: string;
    shimmerDuration?: number; // In seconds for GSAP
    background?: string;
    className?: string;
    children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
    (
        {
            shimmerColor = "#EAB308",
            shimmerSize = "0.1em",
            shimmerDuration = 3,
            borderRadius = "100px",
            background = "rgba(0, 0, 0, 1)",
            className,
            children,
            ...props
        },
        ref,
    ) => {
        const sparkRef = useRef<HTMLDivElement>(null);
        const containerRef = useRef<HTMLButtonElement>(null);

        useGSAP(() => {
            if (!sparkRef.current) return;

            gsap.to(sparkRef.current, {
                rotate: 360,
                duration: shimmerDuration,
                repeat: -1,
                ease: "none"
            });
        }, { scope: containerRef });

        return (
            <button
                ref={containerRef}
                style={
                    {
                        "--shimmer-color": shimmerColor,
                        "--radius": borderRadius,
                        "--cut": shimmerSize,
                        "--bg": background,
                    } as React.CSSProperties
                }
                className={cn(
                    "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3 text-white [border-radius:var(--radius)] bg-transparent",
                    "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
                    className,
                )}
                {...props}
            >
                {/* spark container */}
                <div
                    className={cn(
                        "-z-30",
                        "absolute inset-0 overflow-visible [container-type:size]",
                    )}
                >
                    {/* spark */}
                    <div
                        ref={sparkRef}
                        className="absolute inset-[-100%] h-auto aspect-square [background:conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_180deg,var(--shimmer-color)_215deg,transparent_255deg,transparent_360deg)]"
                    />
                </div>

                {/* Content Overlay */}
                <span className="relative z-10">{children}</span>

                {/* Highlight */}
                <div
                    className={cn(
                        "insert-0 absolute size-full",
                        "px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]",
                        "transform-gpu transition-all duration-300 ease-in-out",
                        "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",
                        "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]",
                        "[border-radius:var(--radius)]",
                    )}
                />

                {/* backdrop / Center Content */}
                <div
                    className={cn(
                        "absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]",
                    )}
                />
            </button>
        );
    },
);

ShimmerButton.displayName = "ShimmerButton";

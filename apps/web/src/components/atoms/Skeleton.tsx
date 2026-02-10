import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-white/5", className)}
            {...props}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="rounded-3xl p-6 bg-white/5 border border-white/10 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-4 w-full" />
        </div>
    )
}

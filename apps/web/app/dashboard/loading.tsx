import { SkeletonCard, Skeleton } from "@/src/components/atoms";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-midnight-950 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-12">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-24 rounded-full" />
                        <Skeleton className="h-10 w-24 rounded-full" />
                    </div>
                </div>

                {/* Balance Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>

                {/* Status/Action Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>

                {/* Activity Skeleton */}
                <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
        </div>
    );
}

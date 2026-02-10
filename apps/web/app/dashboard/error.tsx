"use client";

import { useEffect } from "react";
import { Button, Card } from "@/src/components/atoms";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-midnight-950 flex items-center justify-center p-6">
            <Card variant="solid" className="max-w-md w-full text-center space-y-6 border-red-500/20 bg-red-900/10">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 text-3xl">
                    !
                </div>

                <div>
                    <h2 className="text-xl font-bold text-white">Something went wrong!</h2>
                    <p className="text-zinc-400 mt-2 text-sm">
                        We encountered an error while loading your dashboard. Please try again.
                    </p>
                </div>

                <div className="flex gap-3 justify-center">
                    <Button variant="ghost" onClick={() => window.location.reload()}>
                        Reload Page
                    </Button>
                    <Button variant="danger" onClick={() => reset()}>
                        Try Again
                    </Button>
                </div>
            </Card>
        </div>
    );
}

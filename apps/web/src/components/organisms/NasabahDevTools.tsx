"use client";

import { Card, Button, Badge } from "@/src/components/atoms";
import { RefreshCw, Terminal, Sparkles, Command } from "lucide-react";
import { useNasabahDashboard } from "@/src/hooks/useNasabahDashboard";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

export function NasabahDevTools() {
    const { claimDailyBonus, isDailyPending } = useNasabahDashboard();
    const queryClient = useQueryClient();
    const [isVisible, setIsVisible] = useState(true);

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["nasabahProfile"] });
        queryClient.invalidateQueries({ queryKey: ["nasabahActivity"] });
        toast.info("Cache invalidated & data refreshed");
    };

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 w-10 h-10 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors z-[100]"
            >
                <Command className="w-4 h-4" />
            </button>
        );
    }

    return (
        <Card variant="outline" className="border-white/5 bg-white/[0.02] p-6 mt-12 relative overflow-hidden group">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                <Terminal className="w-24 h-24" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-trisula-500" />
                        <p className="text-[10px] text-trisula-500/80 font-black uppercase tracking-[0.2em]">
                            Development Environment
                        </p>
                        <Badge variant="outline" className="bg-trisula-500/10 text-[9px] py-0 border-trisula-500/20">
                            v2.0-nasabah
                        </Badge>
                    </div>
                    <p className="text-zinc-500 text-xs font-medium">
                        Simulasi aksi nasabah untuk pengujian sistem poin.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => claimDailyBonus()}
                        isLoading={isDailyPending}
                        className="gap-2 bg-white/5 border-white/5 hover:bg-white/10"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-gold-metallic" />
                        Simulate Daily Check-in
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        className="gap-2 text-zinc-400 hover:text-white"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Force Sync Data
                    </Button>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-[10px] text-zinc-600 hover:text-zinc-400 font-bold uppercase tracking-widest pl-2"
                    >
                        Hide Tools
                    </button>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-trisula-500/20 to-transparent" />
        </Card>
    );
}

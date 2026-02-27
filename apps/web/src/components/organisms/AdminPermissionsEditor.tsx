"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/src/components/atoms";
import { Loader2, ShieldAlert } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AdminPermissionsEditorProps {
    userId: string;
    initialMetadata: Record<string, any>;
    onSuccess?: () => void;
}

const MODULES = [
    { id: "fulfillment", label: "Redeem Queue" },
    { id: "users", label: "User Base" },
    { id: "products", label: "Product Catalog" },
    { id: "watchdog", label: "Watchdog Monitor" },
    { id: "polis", label: "Polis Entry" },
    { id: "codes", label: "Agent Codes" },
    { id: "rewards", label: "Voucher Catalog" },
    { id: "announcements", label: "Announcements" },
    { id: "security", label: "Login History" },
    { id: "performance", label: "Agent Performance" },
];

export function AdminPermissionsEditor({ userId, initialMetadata, onSuccess }: AdminPermissionsEditorProps) {
    const queryClient = useQueryClient();

    // Deep copy the initial permissions
    const [permissions, setPermissions] = useState<Record<string, string[]>>(() => {
        const initialPerms = initialMetadata?.permissions || {};
        return JSON.parse(JSON.stringify(initialPerms));
    });

    const updateMetadataMutation = useMutation({
        mutationFn: async (newMetadata: any) => {
            const res = await api.patch(`/v1/admin/users/${userId}/metadata`, {
                metadata: newMetadata,
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Permissions updated successfully", {
                className: "bg-charcoal-900 text-gold-metallic border-gold-metallic/20",
            });
            queryClient.invalidateQueries({ queryKey: ["admin_users"] });
            queryClient.invalidateQueries({ queryKey: ["admin_user_detail", userId] });
            onSuccess?.();

            // Reload window to apply changes immediately to the nav if it's the current user
            // However, this is editing another user, so no reload needed unless editing self
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update permissions", {
                className: "bg-charcoal-900 border-red-500/20 text-red-500",
            });
        },
    });

    const handleToggle = (moduleId: string, perm: "read" | "write") => {
        setPermissions(prev => {
            const modulePerms = [...(prev[moduleId] || [])];
            const hasPerm = modulePerms.includes(perm);

            if (hasPerm) {
                // Remove
                const updated = modulePerms.filter(p => p !== perm);
                return { ...prev, [moduleId]: updated };
            } else {
                // Add
                return { ...prev, [moduleId]: [...modulePerms, perm] };
            }
        });
    };

    const handleSave = () => {
        const newMetadata = { ...initialMetadata, permissions };
        updateMetadataMutation.mutate(newMetadata);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gold-metallic/5 border border-gold-metallic/20">
                <ShieldAlert className="w-5 h-5 text-gold-metallic shrink-0" />
                <p className="text-xs text-gold-metallic font-medium">
                    Konfigurasi akses per modul untuk admin ini. Izin akses dinamis akan mengesampingkan batasan default berdasarkan Role.
                </p>
            </div>

            <div className="space-y-4">
                {MODULES.map((module) => {
                    const hasRead = permissions[module.id]?.includes("read");
                    const hasWrite = permissions[module.id]?.includes("write");

                    return (
                        <div key={module.id} className="flex items-center justify-between p-4 rounded-xl bg-charcoal-800/50 border border-white/5 hover:border-white/10 transition-colors">
                            <span className="text-sm font-bold text-white">{module.label} <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase block mt-1">{module.id}</span></span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleToggle(module.id, "read")}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                                        hasRead
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            : "bg-charcoal-900 text-zinc-600 border border-white/5 hover:text-zinc-400"
                                    )}
                                >
                                    Read
                                </button>
                                <button
                                    onClick={() => handleToggle(module.id, "write")}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                                        hasWrite
                                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                            : "bg-charcoal-900 text-zinc-600 border border-white/5 hover:text-zinc-400"
                                    )}
                                >
                                    Write
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
                <Button
                    onClick={handleSave}
                    disabled={updateMetadataMutation.isPending}
                    className="w-full sm:w-auto px-8 rounded-xl bg-gold-metallic text-charcoal-950 hover:bg-gold-500 active:scale-95 transition-all outline-none font-bold uppercase tracking-widest"
                >
                    {updateMetadataMutation.isPending ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                        </div>
                    ) : (
                        "Save Permissions"
                    )}
                </Button>
            </div>
        </div>
    );
}

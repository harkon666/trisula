"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { toast } from "sonner";

export interface AdminRedeemRequest {
    id: string;
    userName: string;
    itemName: string;
    pointsUsed: number;
    whatsapp: string;
    status: "pending" | "processing" | "ready" | "completed" | "cancelled" | "rejected";
    createdAt: string;
}

export function useAdminRedeem() {
    const queryClient = useQueryClient();

    // Fetch pending/active requests
    const { data: requests, isLoading } = useQuery<AdminRedeemRequest[]>({
        queryKey: ["admin", "redeem", "pending"],
        queryFn: async () => {
            const res = await api.get("/v1/admin/redeem/pending");
            return res.data.data;
        },
    });

    // Update Request Status
    const updateMutation = useMutation({
        mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
            const res = await api.patch(`/v1/admin/redeem/${id}`, { status, reason });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Status berhasil diperbarui", {
                style: {
                    background: "#002366",
                    border: "1px solid #D4AF37",
                    color: "#D4AF37",
                },
            });
            // Invalidate admin queue
            queryClient.invalidateQueries({ queryKey: ["admin", "redeem"] });
            // Invalidate user balance/activity globally to stay consistent
            queryClient.invalidateQueries({ queryKey: ["nasabahProfile"] });
            queryClient.invalidateQueries({ queryKey: ["nasabahActivity"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Gagal memperbarui status");
        },
    });

    return {
        requests,
        isLoading,
        updateStatus: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
    };
}

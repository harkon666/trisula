"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// --- Types ---
export interface Reward {
    id: number;
    title: string;
    description: string | null;
    requiredPoints: number;
    isActive: boolean;
}

interface RedeemResponse {
    success: boolean;
    message: string;
    data?: {
        requestId: string;
        status: string;
    };
}

// --- Hook ---
export function useRewardsCatalog() {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    // Fetch active rewards catalog
    const catalogQuery = useQuery({
        queryKey: ["rewardsCatalog"],
        queryFn: async () => {
            const res = await api.get("/v1/redeem/catalog");
            return res.data.data as Reward[];
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5,
    });

    // Redeem mutation
    const redeemMutation = useMutation({
        mutationFn: async (rewardId: number) => {
            const res = await api.post("/v1/redeem", { rewardId });
            return res.data as RedeemResponse;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Penukaran berhasil!");
            // Atomic update: refresh balance and activity immediately
            queryClient.invalidateQueries({ queryKey: ["nasabahProfile"] });
            queryClient.invalidateQueries({ queryKey: ["nasabahActivity"] });
            queryClient.invalidateQueries({ queryKey: ["rewardsCatalog"] });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Gagal menukar poin.";
            toast.error(message);
        },
    });

    return {
        // Catalog
        rewards: catalogQuery.data,
        isRewardsLoading: catalogQuery.isLoading,

        // Redeem
        redeemReward: redeemMutation.mutate,
        redeemRewardAsync: redeemMutation.mutateAsync,
        isRedeemPending: redeemMutation.isPending,
        redeemResult: redeemMutation.data,
        resetRedeem: redeemMutation.reset,
    };
}

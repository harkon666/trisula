"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { toast } from "sonner";

export interface Reward {
    id: number;
    title: string;
    description: string | null;
    requiredPoints: number;
    isActive: boolean;
}

export interface CreateRewardInput {
    title: string;
    description?: string;
    requiredPoints: number;
    isActive?: boolean;
}

export function useAdminRewards() {
    const queryClient = useQueryClient();

    // Fetch all rewards (admin view)
    const { data: rewards, isLoading } = useQuery<Reward[]>({
        queryKey: ["admin", "rewards"],
        queryFn: async () => {
            const res = await api.get("/v1/admin/rewards");
            return res.data.data;
        },
    });

    // Create Reward
    const createMutation = useMutation({
        mutationFn: async (data: CreateRewardInput) => {
            const res = await api.post("/v1/admin/rewards", data);
            return res.data.data;
        },
        onSuccess: () => {
            toast.success("Reward baru berhasil ditambahkan!");
            queryClient.invalidateQueries({ queryKey: ["admin", "rewards"] });
            queryClient.invalidateQueries({ queryKey: ["rewardsCatalog"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menambah reward");
        }
    });

    // Update Reward
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<CreateRewardInput> }) => {
            const res = await api.patch(`/v1/admin/rewards/${id}`, data);
            return res.data.data;
        },
        onSuccess: () => {
            toast.success("Reward berhasil diperbarui");
            queryClient.invalidateQueries({ queryKey: ["admin", "rewards"] });
            queryClient.invalidateQueries({ queryKey: ["rewardsCatalog"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal memperbarui reward");
        }
    });

    // Delete Reward
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await api.delete(`/v1/admin/rewards/${id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Reward berhasil dihapus");
            queryClient.invalidateQueries({ queryKey: ["admin", "rewards"] });
            queryClient.invalidateQueries({ queryKey: ["rewardsCatalog"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menghapus reward. Mungkin reward ini sudah pernah ditransaksikan.");
        }
    });

    return {
        rewards,
        isLoading,
        createReward: createMutation.mutate,
        isCreating: createMutation.isPending,
        updateReward: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deleteReward: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { toast } from "sonner";

export interface AgentCode {
    id: number;
    code: string;
    isUsed: boolean;
    generatedByName: string;
    usedByName: string | null;
    createdAt: string;
}

export function useAdminCodes() {
    const queryClient = useQueryClient();

    // Fetch all codes
    const { data: codes, isLoading } = useQuery<AgentCode[]>({
        queryKey: ["admin", "codes"],
        queryFn: async () => {
            const res = await api.get("/v1/admin/codes");
            return res.data.data;
        },
    });

    // Generate New Code
    const generateMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post("/v1/admin/codes");
            return res.data.data;
        },
        onSuccess: () => {
            toast.success("Kode Aktivasi Agen berhasil dibuat!", {
                style: {
                    background: "#002366",
                    border: "1px solid #D4AF37",
                    color: "#D4AF37",
                },
            });
            queryClient.invalidateQueries({ queryKey: ["admin", "codes"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Gagal membuat kode");
        },
    });

    // Delete Unused Code
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await api.delete(`/v1/admin/codes/${id}`);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Kode berhasil dihapus");
            queryClient.invalidateQueries({ queryKey: ["admin", "codes"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Gagal menghapus kode");
        },
    });

    return {
        codes,
        isLoading,
        generateCode: generateMutation.mutate,
        isGenerating: generateMutation.isPending,
        deleteCode: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
}

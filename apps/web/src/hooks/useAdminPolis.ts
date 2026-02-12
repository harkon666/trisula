"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { toast } from "sonner";

export interface PolisInput {
    polisNumber: string;
    nasabahId: string;
    agentId: string;
    premiumAmount: number;
}

export function useAdminPolis() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: PolisInput) => {
            const res = await api.post("/v1/polis", data);
            return res.data.data;
        },
        onSuccess: () => {
            toast.success("Data Polis berhasil disimpan. Poin telah ditambahkan ke Nasabah.", {
                style: {
                    background: "#002366",
                    border: "1px solid #D4AF37",
                    color: "#D4AF37",
                },
            });
            // Refetch relevant lists if needed
            queryClient.invalidateQueries({ queryKey: ["admin", "polis"] });
            queryClient.invalidateQueries({ queryKey: ["nasabahProfile"] });
            queryClient.invalidateQueries({ queryKey: ["nasabahActivity"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Gagal menyimpan data polis");
        },
    });

    return {
        submitPolis: mutation.mutate,
        isSubmitting: mutation.isPending,
        isSuccess: mutation.isSuccess,
    };
}

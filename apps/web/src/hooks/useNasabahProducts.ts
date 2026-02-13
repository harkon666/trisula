"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { toast } from "sonner";

export interface Product {
    id: number;
    name: string;
    description: string | null;
    pointsReward: number;
    mediaUrl: string | null;
    isActive: boolean;
}

export function useNasabahProducts() {
    // Fetch active products
    const { data: products, isLoading } = useQuery<Product[]>({
        queryKey: ["products"],
        queryFn: async () => {
            const res = await api.get("/v1/products");
            return res.data.data;
        },
    });

    // Log WA Interaction and get Redirect URL
    const logWaMutation = useMutation({
        mutationFn: async ({ productId, productName }: { productId: number; productName: string }) => {
            const res = await api.post("/v1/interactions/wa", { productId, productName });
            return res.data.data;
        },
        onSuccess: (data) => {
            // Success feedback happens before redirect
            if (data.waUrl) {
                window.open(data.waUrl, "_blank");
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menghubungkan ke agen. Silakan coba lagi.");
        }
    });

    return {
        products,
        isLoading,
        initiatePurchase: logWaMutation.mutate,
        isLogging: logWaMutation.isPending
    };
}

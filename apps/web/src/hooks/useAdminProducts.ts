"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export interface CreateProductInput {
    name: string;
    description?: string;
    pointsReward: number;
    mediaUrl?: string;
    isActive?: boolean;
}

export function useAdminProducts() {
    const queryClient = useQueryClient();

    // Fetch all products (admin view)
    const { data: products, isLoading } = useQuery<Product[]>({
        queryKey: ["admin", "products"],
        queryFn: async () => {
            const res = await api.get("/v1/products", { params: { all: true } });
            return res.data.data;
        },
    });

    // Create Product
    const createMutation = useMutation({
        mutationFn: async (data: CreateProductInput) => {
            const res = await api.post("/v1/products", data);
            return res.data.data;
        },
        onSuccess: () => {
            toast.success("Produk baru berhasil ditambahkan!");
            queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menambah produk");
        }
    });

    // Update Product
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<CreateProductInput> }) => {
            const res = await api.patch(`/v1/products/${id}`, data);
            return res.data.data;
        },
        onSuccess: () => {
            toast.success("Produk berhasil diperbarui");
            queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal memperbarui produk");
        }
    });

    // Delete Product (Soft Delete)
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await api.delete(`/v1/products/${id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Produk berhasil dinonaktifkan!");
            queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menghapus produk");
        }
    });

    return {
        products,
        isLoading,
        createProduct: createMutation.mutate,
        isCreating: createMutation.isPending,
        updateProduct: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deleteProduct: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
}

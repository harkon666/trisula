"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { toast } from "sonner";

export interface AdminUserListItem {
    id: string;
    userId: string;
    fullName: string | null;
    role: string;
}

export interface AdminUserDetail extends AdminUserListItem {
    additionalMetadata: Record<string, any>;
    pointsBalance: number;
    whatsapp?: string;
}

export interface UserPointTransaction {
    id: number;
    userId: string;
    amount: number;
    source: string;
    description: string | null;
    createdAt: string;
}

export function useAdminUsers(role?: string) {
    return useQuery<AdminUserListItem[]>({
        queryKey: ["admin", "users", role],
        queryFn: async () => {
            const url = role ? `/v1/admin/users?role=${role}` : "/v1/admin/users";
            const res = await api.get(url);
            return res.data.data;
        },
    });
}

export function useAdminUserDetail(id: string | null) {
    return useQuery<AdminUserDetail>({
        queryKey: ["admin", "user", id],
        queryFn: async () => {
            const res = await api.get(`/v1/admin/users/${id}`);
            return res.data.data;
        },
        enabled: !!id,
    });
}

export function useAdminUserPointHistory(id: string | null) {
    return useQuery<UserPointTransaction[]>({
        queryKey: ["admin", "user-points", id],
        queryFn: async () => {
            const res = await api.get(`/v1/admin/users/${id}/points`);
            return res.data.data;
        },
        enabled: !!id,
    });
}

export function useAdminUserMetadata() {
    const queryClient = useQueryClient();

    const updateMetadata = useMutation({
        mutationFn: async ({ id, metadata }: { id: string; metadata: Record<string, any> }) => {
            const res = await api.patch(`/v1/admin/users/${id}/metadata`, { metadata });
            return res.data;
        },
        onSuccess: (_, variables) => {
            toast.success("Metadata user berhasil diperbarui");
            queryClient.invalidateQueries({ queryKey: ["admin", "user", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Gagal memperbarui metadata");
        }
    });

    return {
        updateMetadata: updateMetadata.mutate,
        isUpdating: updateMetadata.isPending
    };
}

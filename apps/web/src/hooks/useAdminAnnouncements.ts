"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { toast } from "sonner";

export interface Announcement {
    id: number;
    title: string | null;
    videoUrl: string | null;
    content: string | null;
    ctaUrl: string | null;
    isActive: boolean | null;
    createdAt: string | null;
    totalViews: number;
}

export interface CreateAnnouncementInput {
    title: string;
    content?: string;
    videoUrl?: string;
    ctaUrl?: string;
    isActive?: boolean;
}

export function useAdminAnnouncements() {
    const queryClient = useQueryClient();

    // Fetch all announcements with view counts
    const { data: announcements, isLoading } = useQuery<Announcement[]>({
        queryKey: ["admin", "announcements"],
        queryFn: async () => {
            const res = await api.get("/v1/admin/announcements");
            return res.data.data;
        },
    });

    // Create Announcement
    const createMutation = useMutation({
        mutationFn: async (data: CreateAnnouncementInput) => {
            const res = await api.post("/v1/admin/announcements", data);
            return res.data.data;
        },
        onSuccess: () => {
            toast.success("Pengumuman berhasil dipublikasikan!");
            queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal membuat pengumuman");
        }
    });

    // Update Announcement
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<CreateAnnouncementInput> }) => {
            const res = await api.patch(`/v1/admin/announcements/${id}`, data);
            return res.data.data;
        },
        onSuccess: () => {
            toast.success("Pengumuman berhasil diperbarui");
            queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal memperbarui pengumuman");
        }
    });

    // Toggle isActive (Optimistic Update)
    const toggleMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
            const res = await api.patch(`/v1/admin/announcements/${id}`, { isActive });
            return res.data.data;
        },
        onMutate: async ({ id, isActive }) => {
            await queryClient.cancelQueries({ queryKey: ["admin", "announcements"] });
            const previous = queryClient.getQueryData<Announcement[]>(["admin", "announcements"]);
            queryClient.setQueryData<Announcement[]>(["admin", "announcements"], (old) =>
                old?.map(a => a.id === id ? { ...a, isActive } : a) ?? []
            );
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(["admin", "announcements"], context.previous);
            }
            toast.error("Gagal mengubah status pengumuman");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
        },
    });

    // Delete Announcement
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await api.delete(`/v1/admin/announcements/${id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Pengumuman berhasil dihapus");
            queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menghapus pengumuman");
        }
    });

    return {
        announcements,
        isLoading,
        createAnnouncement: createMutation.mutate,
        isCreating: createMutation.isPending,
        updateAnnouncement: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        toggleAnnouncement: toggleMutation.mutate,
        isToggling: toggleMutation.isPending,
        deleteAnnouncement: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
}

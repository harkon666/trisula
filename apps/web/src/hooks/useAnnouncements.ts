"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { Announcement } from "@/src/store/useTrisulaStore";
import { useAuth } from "@/src/hooks/useAuth";

export function useAnnouncements() {
    const queryClient = useQueryClient();
    const { isAuthenticated, user } = useAuth();

    // Fetch latest unviewed announcement
    const { data: latestAnnouncement, isLoading } = useQuery<Announcement | null>({
        queryKey: ["announcements", "latest", user?.userId], // Scope by user to prevent stale cache between logins
        queryFn: async () => {
            if (!isAuthenticated) return null;
            const res = await api.get("/v1/content/announcements/latest");
            return res.data.data;
        },
        enabled: isAuthenticated && !!user?.userId && user?.role !== 'admin',
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Record view
    const recordViewMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await api.post(`/v1/content/announcements/${id}/view`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["announcements", "latest"] });
        },
    });

    return {
        latestAnnouncement,
        isLoading,
        recordView: recordViewMutation.mutate,
        isRecordingView: recordViewMutation.isPending,
    };
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { Announcement } from "@/src/store/useTrisulaStore";

export function useAnnouncements() {
    const queryClient = useQueryClient();

    // Fetch latest unviewed announcement
    const { data: latestAnnouncement, isLoading } = useQuery<Announcement | null>({
        queryKey: ["announcements", "latest"],
        queryFn: async () => {
            const res = await api.get("/v1/content/announcements/latest");
            return res.data.data;
        },
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

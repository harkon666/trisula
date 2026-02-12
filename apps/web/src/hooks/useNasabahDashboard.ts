"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// --- Types ---
export interface NasabahProfile {
    id: string;
    userId: string;
    fullName: string | null;
    email: string | null;
    whatsapp: string | null;
    role: string;
    status: boolean;
    points: number;
    isDailyClaimed: boolean;
}

export interface ActivityLog {
    id: string;
    amount: number;
    description: string;
    source: string;
    createdAt: string;
}

interface DailyCheckInResponse {
    success: boolean;
    awarded: boolean;
    points: number;
    message: string;
}

// --- Hook ---
export function useNasabahDashboard() {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    // Profile & Balance
    const profileQuery = useQuery({
        queryKey: ["nasabahProfile"],
        queryFn: async () => {
            const res = await api.get("/v1/user/profile");
            return res.data.data as NasabahProfile;
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5,
    });

    // Points Ledger / Activity
    const activityQuery = useQuery({
        queryKey: ["nasabahActivity"],
        queryFn: async () => {
            const res = await api.get("/v1/user/activity");
            return res.data.data as ActivityLog[];
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 2,
    });

    // Daily Check-In Mutation
    const dailyCheckInMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post("/v1/user/daily-checkin");
            return res.data as DailyCheckInResponse;
        },
        onSuccess: (data) => {
            if (data.awarded) {
                toast.success(data.message);
            } else {
                toast.info(data.message);
            }
            // Invalidate both profile and activity to reflect new balance + ledger entry
            queryClient.invalidateQueries({ queryKey: ["nasabahProfile"] });
            queryClient.invalidateQueries({ queryKey: ["nasabahActivity"] });
        },
        onError: () => {
            toast.error("Gagal melakukan check-in harian");
        },
    });

    // Dev Tools Reset Mutation
    const devResetMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post("/v1/user/dev-reset-daily");
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["nasabahProfile"] });
        },
    });

    return {
        // Profile
        profile: profileQuery.data,
        isProfileLoading: profileQuery.isLoading,

        // Activity
        activity: activityQuery.data,
        isActivityLoading: activityQuery.isLoading,

        // Daily Check-In
        claimDailyBonus: dailyCheckInMutation.mutate,
        isDailyPending: dailyCheckInMutation.isPending,
        dailyResult: dailyCheckInMutation.data,

        // Dev Utilities
        devResetDaily: devResetMutation.mutateAsync,
        isDevResetPending: devResetMutation.isPending,
    };
}

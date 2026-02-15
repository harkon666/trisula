"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api-client";

export interface AgentStats {
    totalReferrals: number;
    totalCommission: number;
    totalInteractions: number;
}

export interface NasabahReferral {
    id: string;
    fullName: string;
    userId: string;
    pointsBalance: number;
    whatsapp: string;
    joinedAt: string;
    polisCount: number;
}

export interface GrowthData {
    name: string;
    value: number;
}

export function useAgentStats() {
    return useQuery<AgentStats>({
        queryKey: ["agent", "stats"],
        queryFn: async () => {
            const res = await api.get("/v1/agent/stats");
            return res.data.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useAgentReferrals() {
    return useQuery<NasabahReferral[]>({
        queryKey: ["agent", "referrals"],
        queryFn: async () => {
            const res = await api.get("/v1/agent/referrals");
            return res.data.data;
        },
        staleTime: 1000 * 60 * 5,
    });
}

export function useAgentGrowthChart() {
    return useQuery<GrowthData[]>({
        queryKey: ["agent", "chart", "growth"],
        queryFn: async () => {
            const res = await api.get("/v1/agent/chart/growth");
            return res.data.data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAgentWatchdog() {
    return useQuery({
        queryKey: ["agent", "watchdog"],
        queryFn: async () => {
            const res = await api.get("/v1/agent/watchdog");
            return res.data;
        },
        refetchInterval: 1000 * 60, // Check every minute
    });
}

export interface ReferralDetail {
    profile: {
        id: string;
        fullName: string;
        userId: string;
        pointsBalance: number;
        whatsapp: string;
        email: string | null;
        joinedAt: string;
    };
    polis: any[];
    points: any[];
    interactions: any[];
}

export function useAgentReferralDetail(id: string) {
    return useQuery<ReferralDetail>({
        queryKey: ["agent", "referrals", id],
        queryFn: async () => {
            const res = await api.get(`/v1/agent/referrals/${id}`);
            return res.data.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 1, // 1 minute
    });
}

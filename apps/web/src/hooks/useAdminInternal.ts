"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { useAuth } from "@/src/hooks/useAuth";

export interface NasabahRecord {
    nasabahId: string;
    nasabahUserId: string;
    nasabahName: string;
    agentUserId: string | null;
    agent: {
        id: string;
        userId: string;
        fullName: string;
    } | null;
}

export interface AgentRecord {
    id: string;
    userId: string;
    fullName: string;
}

export function useAdminInternal() {
    const { isAuthenticated, user } = useAuth();

    // Fetch Nasabah-Agent Mapping
    const { data: nasabahAgents, isLoading: isLoadingNasabahAgents } = useQuery<NasabahRecord[]>({
        queryKey: ["admin", "internal", "nasabah-agents"],
        queryFn: async () => {
            const res = await api.get("/v1/admin/internal/nasabah-agents");
            return res.data.data;
        },
        enabled: isAuthenticated && (user?.role === 'super_admin' || user?.role === 'admin'),
    });

    // Fetch plain Agents list (for fallback/manual selection)
    const { data: agents, isLoading: isLoadingAgents } = useQuery<AgentRecord[]>({
        queryKey: ["admin", "internal", "agents"],
        queryFn: async () => {
            const res = await api.get("/v1/admin/internal/agents");
            return res.data.data;
        },
        enabled: isAuthenticated && (user?.role === 'super_admin' || user?.role === 'admin'),
    });

    return {
        nasabahAgents,
        isLoadingNasabahAgents,
        agents,
        isLoadingAgents
    };
}

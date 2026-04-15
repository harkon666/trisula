import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api-client";

export interface PolisReminder {
    id: number;
    polisNumber: string;
    nasabahName: string;
    agentName: string;
    daysLeft: number;
    type: 'h7' | 'monthly';
    message: string;
    premiumAmount: number;
    productName: string | null;
}

export function useAdminPolisReminders() {
    return useQuery<PolisReminder[]>({
        queryKey: ["admin", "polis", "reminders"],
        queryFn: async () => {
            const res = await api.get("/v1/admin/internal/polis/reminders");
            return res.data.data;
        },
        refetchInterval: 300000, // Poll every 5 minutes
    });
}
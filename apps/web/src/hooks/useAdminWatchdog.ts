import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api-client";
import { toast } from "sonner";

export interface WatchdogAlert {
    id: number;
    clickedAt: string;
    nasabah: {
        id: string;
        name: string;
        whatsapp: string;
    };
    agent: {
        id: string;
        name: string;
    };
}

export function useWatchdogAlerts() {
    return useQuery<WatchdogAlert[]>({
        queryKey: ["admin", "watchdog", "alerts"],
        queryFn: async () => {
            const res = await api.get("/v1/admin/internal/watchdog/alerts");
            return res.data.data;
        },
        refetchInterval: 60000, // Poll every 1 minute
    });
}

export function useResolveWatchdog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await api.patch(`/v1/admin/internal/watchdog/resolve/${id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Alert resolved successfully");
            queryClient.invalidateQueries({ queryKey: ["admin", "watchdog", "alerts"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to resolve alert");
        },
    });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api-client";

export interface AdminUserListItem {
    id: string;
    userId: string;
    fullName: string | null;
    role: string;
}

export function useAdminUsers(role?: string) {
    return useQuery<AdminUserListItem[]>({
        queryKey: ["admin", "users", role],
        queryFn: async () => {
            const url = role ? `/v1/admin/users?role=${role}` : "/api/v1/admin/users";
            const res = await api.get(url);
            return res.data.data;
        },
    });
}

import { useQuery } from '@tanstack/react-query';
import api from '../lib/api-client';

export interface LeaderboardAgent {
    id: string;
    userId: string;
    fullName: string | null;
    whatsapp: string | null;
    totalReferrals: number;
}

export function useAdminLeaderboard() {
    return useQuery({
        queryKey: ['admin-leaderboard'],
        queryFn: async (): Promise<LeaderboardAgent[]> => {
            const response = await api.get('/v1/admin/performance/leaderboard');
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to fetch leaderboard');
            }
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
}

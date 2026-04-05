import { useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api-client';

export interface BirthdayNasabah {
    id: string;
    userId?: string;
    agentUserId?: string;
    fullName: string;
    whatsapp: string;
    dateOfBirth: string;
    age: number;
    birthdayWhen: 'today' | 'tomorrow';
}

export function useAgentBirthdays() {
    return useQuery({
        queryKey: ['agent-birthdays'],
        queryFn: async () => {
            const response = await api.get('/v1/agent/birthdays');
            return response.data.data as BirthdayNasabah[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
}

export function useAdminBirthdays() {
    return useQuery({
        queryKey: ['admin-birthdays'],
        queryFn: async () => {
            const response = await api.get('/v1/admin/internal/birthdays');
            return response.data.data as BirthdayNasabah[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
}

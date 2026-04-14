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
            const response = await api.get('/v1/admin/birthdays');
            return response.data.data as BirthdayNasabah[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
}

/**
 * Unified hook that calls the correct birthday endpoint based on role.
 * Use this instead of separate hooks in components that support both roles.
 */
export function useBirthdays(role: 'agent' | 'admin') {
    return useQuery({
        queryKey: ['birthdays', role],
        queryFn: async () => {
            const endpoint = role === 'agent' ? '/v1/agent/birthdays' : '/v1/admin/birthdays';
            const response = await api.get(endpoint);
            return response.data.data as BirthdayNasabah[];
        },
        staleTime: 5 * 60 * 1000,
    });
}

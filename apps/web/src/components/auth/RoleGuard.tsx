"use client";

import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            if (user && !allowedRoles.includes(user.role)) {
                toast.error("Akses Ditolak: Anda tidak memiliki wewenang");
                // Redirect logic based on role (optional, or just kick to home/dashboard basic)
                if (user.role === 'nasabah') router.push('/dashboard/nasabah');
                else if (user.role === 'agent') router.push('/dashboard/agent');
                else if (['admin', 'super_admin'].includes(user.role)) router.push('/dashboard/admin');
                else router.push('/');
            }
        }
    }, [user, isAuthenticated, isLoading, router, allowedRoles]);

    if (isLoading || !isAuthenticated || (user && !allowedRoles.includes(user.role))) {
        return null; // Or a loading spinner
    }

    return <>{children}</>;
}

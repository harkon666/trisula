"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import api from '@/src/lib/api-client';
import { toast } from 'sonner';
import gsap from 'gsap';
import { GoldCard } from '@/src/components/ui/GoldCard';

const loginSchema = z.object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    });

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".animate-down", {
                y: -50,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power4.out"
            });

            gsap.from(".animate-up", {
                y: 50,
                opacity: 0,
                duration: 1,
                delay: 0.5,
                ease: "power4.out"
            });

            gsap.to(".glow", {
                opacity: 0.8,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        try {
            const response = await api.post('/v1/auth/login', data);

            if (response.data.success) {
                toast.success("Login Berhasil! Selamat datang di Trisula.");
                login(response.data.token, response.data.user);

                // Redirect logic based on role
                const role = response.data.user.role;
                if (role === 'admin' || role === 'super_admin') {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            } else {
                toast.error(response.data.message || "Email atau password salah");
            }
        } catch (error: any) {
            const message = error.response?.data?.message || "Terjadi kesalahan sistem. Silakan coba lagi.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Premium Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-midnight-950 via-midnight-900 to-midnight-950 pointer-events-none" />
            <div className="glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-trisula-500/10 blur-[150px] rounded-full pointer-events-none opacity-0" />

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-10">
                    <h1 className="animate-down text-5xl font-black text-white mb-3 tracking-tighter">
                        Trisula<span className="text-trisula-500">.</span>
                    </h1>
                    <p className="animate-down text-zinc-400 font-medium">Elevate Your Wealth with Precision.</p>
                </div>

                <div className="animate-up">
                    <GoldCard className="p-1">
                        <div className="bg-midnight-900/90 backdrop-blur-xl rounded-[28px] p-8 md:p-10 border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <h2 className="text-2xl font-bold text-white mb-8">Sign In</h2>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                                    <input
                                        {...register("email")}
                                        type="email"
                                        placeholder="name@example.com"
                                        className={`w-full bg-deep-blue/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 text-white placeholder:text-zinc-600 focus:border-trisula-500/50 focus:outline-none transition-all`}
                                    />
                                    {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.email.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Password</label>
                                        <button type="button" className="text-[10px] font-black uppercase text-trisula-500/70 hover:text-trisula-500 transition-colors">Forgot?</button>
                                    </div>
                                    <input
                                        {...register("password")}
                                        type="password"
                                        placeholder="••••••••"
                                        className={`w-full bg-deep-blue/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 text-white placeholder:text-zinc-600 focus:border-trisula-500/50 focus:outline-none transition-all`}
                                    />
                                    {errors.password && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.password.message}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-trisula-500 to-trisula-600 hover:from-trisula-400 hover:to-trisula-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:opacity-50 text-midnight-950 font-black uppercase tracking-widest py-5 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] active:scale-95 transition-all text-sm mt-4 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-midnight-950/20 border-t-midnight-950 rounded-full animate-spin" />
                                    ) : (
                                        <>Sign In Now <span className="opacity-50">→</span></>
                                    )}
                                </button>
                            </form>

                            <div className="mt-10 pt-8 border-t border-white/5 text-center">
                                <p className="text-zinc-500 text-sm">
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => router.push('/auth/register')}
                                        className="text-trisula-500 font-bold hover:underline underline-offset-4"
                                    >
                                        Create Membership
                                    </button>
                                </p>
                            </div>
                        </div>
                    </GoldCard>
                </div>

                <div className="mt-12 animate-up text-center opacity-30 hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => router.push('/')}
                        className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                    >
                        <span>←</span> Back to Home
                    </button>
                </div>
            </div>

            {/* Decorative Bottom Left Element */}
            <div className="absolute bottom-10 left-10 opacity-10 flex flex-col gap-1">
                <div className="w-12 h-1 bg-trisula-500" />
                <div className="w-8 h-1 bg-trisula-500" />
            </div>

            <p className="absolute bottom-6 right-10 text-[10px] font-black uppercase text-midnight-800 tracking-[1em] pointer-events-none">
                TRISULA PRIORITY
            </p>
        </div>
    );
}

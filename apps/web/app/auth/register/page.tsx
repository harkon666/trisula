"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterUserSchema } from "@repo/shared";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { toast } from "sonner";
import { GoldCard } from "@/src/components/ui/GoldCard";

// Infer type from schema
type RegisterFormData = z.infer<typeof RegisterUserSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(RegisterUserSchema),
        defaultValues: {
            walletAddress: "0x0000000000000000000000000000000000000000",
        }
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Gagal mendaftar");
            }

            if (result.success && result.data.token) {
                login(result.data.token, result.data.user);
            }

            toast.success("Registrasi Berhasil! Selamat datang di Trisula.");
            router.push("/dashboard");

        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-midnight-950 text-white flex items-center justify-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-b from-midnight-950 via-midnight-900 to-midnight-950 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-trisula-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10">
                <GoldCard className="p-1">
                    <div className="bg-midnight-900/90 border border-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[28px] shadow-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight">
                                Complete Your Profile
                            </h1>
                            <p className="text-zinc-400 font-medium">Final step to activate your <span className="text-trisula-400">Premium Account</span>.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Full Name</label>
                                    <input
                                        {...register("name")}
                                        className="w-full bg-midnight-950/50 border border-white/10 rounded-2xl px-5 py-4 focus:border-trisula-500/50 outline-none transition-all placeholder:text-zinc-700 text-white"
                                        placeholder="John Doe"
                                    />
                                    {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                                    <input
                                        {...register("email")}
                                        type="email"
                                        className="w-full bg-midnight-950/50 border border-white/10 rounded-2xl px-5 py-4 focus:border-trisula-500/50 outline-none transition-all placeholder:text-zinc-700 text-white"
                                        placeholder="sultan@mail.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.email.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Phone Number</label>
                                    <input
                                        {...register("phone")}
                                        className="w-full bg-midnight-950/50 border border-white/10 rounded-2xl px-5 py-4 focus:border-trisula-500/50 outline-none transition-all placeholder:text-zinc-700 text-white"
                                        placeholder="628123456789"
                                    />
                                    {errors.phone && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.phone.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">City</label>
                                    <input
                                        {...register("city")}
                                        className="w-full bg-midnight-950/50 border border-white/10 rounded-2xl px-5 py-4 focus:border-trisula-500/50 outline-none transition-all placeholder:text-zinc-700 text-white"
                                        placeholder="Jakarta Selatan"
                                    />
                                    {errors.city && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.city.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Referral Code (Optional)</label>
                                <input
                                    {...register("referralCode")}
                                    className="w-full bg-midnight-950/50 border border-white/10 rounded-2xl px-5 py-4 focus:border-trisula-500/50 outline-none transition-all placeholder:text-zinc-700 text-white text-center font-mono tracking-widest text-lg uppercase"
                                    placeholder="SULTAN01"
                                />
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-trisula-500 to-trisula-600 hover:from-trisula-400 hover:to-trisula-500 text-midnight-950 font-black uppercase tracking-widest py-5 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Processing..." : "Complete Registration"}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <button onClick={() => router.push('/login')} className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
                                Already have an account? Sign In
                            </button>
                        </div>
                    </div>
                </GoldCard>
            </div>
        </div>
    );
}

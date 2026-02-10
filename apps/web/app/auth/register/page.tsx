"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterUserSchema } from "@repo/shared";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

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
            walletAddress: "0x0000000000000000000000000000000000000000", // Placeholder for backend compatibility if needed
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

            // Automically login after registration
            if (result.success && result.data.token) {
                login(result.data.token, result.data.user);
            }

            alert("Registrasi Berhasil! Selamat datang di Trisula.");
            router.push("/dashboard");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-zinc-950 text-white flex items-center justify-center">
            <div className="w-full max-w-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Complete Profile</h1>
                <p className="mb-8 text-zinc-400">Final step to activate your Premium Account.</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Full Name</label>
                            <input {...register("name")} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-600" placeholder="John Doe" />
                            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Email Address</label>
                            <input
                                {...register("email")}
                                type="email"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-600"
                                placeholder="sultan@mail.com"
                            />
                            {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Phone Number</label>
                            <input {...register("phone")} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-600" placeholder="628123456789" />
                            {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">City</label>
                            <input {...register("city")} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-600" placeholder="Jakarta Selatan" />
                            {errors.city && <p className="text-red-400 text-xs">{errors.city.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Referral Code (Optional)</label>
                        <input {...register("referralCode")} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-600" placeholder="SULTAN01" />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Processing..." : "Complete Registration"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

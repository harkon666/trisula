"use client";

import { useActiveAccount } from "thirdweb/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterUserSchema } from "@repo/shared";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConnectWallet from "../../../components/ConnectWallet";

// Infer type from schema
type RegisterFormData = z.infer<typeof RegisterUserSchema>;

export default function RegisterPage() {
    const account = useActiveAccount();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(RegisterUserSchema),
        defaultValues: {
            // Pre-fill wallet address if available (will be overwritten by useEffect/submit)
            walletAddress: account?.address || "",
        }
    });

    // Update wallet address when account changes
    if (account && account.address) {
        setValue("walletAddress", account.address);
    }

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
                body: JSON.stringify({
                    ...data,
                    walletAddress: account?.address, // Force use of connected wallet
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Gagal mendaftar");
            }

            // Redirect ke Dashboard (nanti)
            alert("Registrasi Berhasil! Selamat datang Sultan.");
            router.push("/dashboard");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!account) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white selection:bg-amber-500/30">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />
                <h1 className="relative z-10 text-5xl font-bold mb-8 bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
                    TRISULA
                </h1>
                <div className="relative z-10">
                    <ConnectWallet />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-zinc-950 text-white flex items-center justify-center">
            <div className="w-full max-w-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Pendaftaran Sultan</h1>
                <p className="mb-6 text-zinc-400">Lengkapi data diri Anda untuk mengaktifkan akses eksklusif.</p>

                <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-lg">
                        ₿
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs text-amber-200 uppercase tracking-wider font-semibold">Connected Wallet</p>
                        <p className="text-sm font-mono truncate text-amber-100">{account.address}</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Nama Lengkap</label>
                            <input {...register("name")} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-600" placeholder="Jhon Doe" />
                            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Email</label>
                            <input {...register("email")} type="email" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-600" placeholder="sultan@mail.com" />
                            {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Password</label>
                            <input {...register("password")} type="password" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-600" placeholder="••••••••" />
                            {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Nomor HP</label>
                            <input {...register("phone")} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-600" placeholder="628123456789" />
                            {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Kota Domisili</label>
                            <input {...register("city")} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-600" placeholder="Jakarta Selatan" />
                            {errors.city && <p className="text-red-400 text-xs">{errors.city.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Kode Referral (Opsional)</label>
                            <input {...register("referralCode")} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-600" placeholder="SULTAN01" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Memproses..." : "Aktifkan Akun Sultan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

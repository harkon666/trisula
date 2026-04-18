"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GoldCard } from "@/src/components/ui/GoldCard";
import { motion } from "framer-motion";
import api from "@/src/lib/api-client";

type VerifyStatus = 'loading' | 'success' | 'error' | 'expired';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<VerifyStatus>('loading');
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage("Token verifikasi tidak ditemukan.");
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await api.get(`/v1/auth/verify-email?token=${token}`);
                if (response.data.success) {
                    setStatus('success');
                    setTimeout(() => {
                        router.push("/login?verified=true");
                    }, 3000);
                } else {
                    setStatus('error');
                    setErrorMessage(response.data.message || "Verifikasi gagal.");
                }
            } catch (err: any) {
                const message = err.response?.data?.message || "Terjadi kesalahan saat verifikasi.";
                if (message.includes("kadaluarsa")) {
                    setStatus('expired');
                } else {
                    setStatus('error');
                }
                setErrorMessage(message);
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <div className="min-h-screen p-4 md:p-8 bg-midnight-950 text-white flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-midnight-950 via-midnight-900 to-midnight-950 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-trisula-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-lg relative z-10">
                <GoldCard className="p-1">
                    <div className="bg-midnight-900/90 border border-white/5 backdrop-blur-xl p-8 rounded-[28px] shadow-2xl">
                        {/* Status Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className={`mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center ${
                                status === 'success' ? 'bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30' :
                                status === 'error' || status === 'expired' ? 'bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30' :
                                'bg-gradient-to-br from-trisula-500/20 to-trisula-500/5 border border-trisula-500/30'
                            }`}
                        >
                            {status === 'loading' ? (
                                <svg className="animate-spin w-10 h-10 text-trisula-500" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : status === 'success' ? (
                                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <h1 className={`text-2xl font-black mb-3 ${
                                status === 'success' ? 'bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent' :
                                status === 'expired' ? 'bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent' :
                                'bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent'
                            }`}>
                                {status === 'loading' ? 'Memverifikasi Email...' :
                                 status === 'success' ? 'Email Terverifikasi!' :
                                 status === 'expired' ? 'Token Kadaluarsa' :
                                 'Verifikasi Gagal'}
                            </h1>

                            <p className="text-zinc-400 text-sm mb-6">
                                {status === 'loading' && "Mohon tunggu sebentar..."}
                                {status === 'success' && "Email Anda berhasil diverifikasi. Mengalihkan ke halaman login..."}
                                {status === 'expired' && "Link verifikasi sudah tidak berlaku. Silakan minta link baru."}
                                {status === 'error' && errorMessage}
                            </p>
                        </motion.div>

                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex justify-center"
                            >
                                <div className="flex items-center gap-1 text-trisula-400 text-sm">
                                    <span>Melanjutkan ke login dalam</span>
                                    <span className="font-bold">3</span>
                                    <span>detik...</span>
                                </div>
                            </motion.div>
                        )}

                        {status === 'expired' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-3"
                            >
                                <a
                                    href="/auth/verification-sent"
                                    className="block w-full text-center bg-trisula-500 hover:bg-trisula-400 text-midnight-950 font-bold py-3 rounded-xl transition-all"
                                >
                                    Minta Link Verifikasi Baru
                                </a>
                                <button
                                    onClick={() => router.push("/login")}
                                    className="w-full text-zinc-500 hover:text-white text-sm font-medium py-2 transition-colors"
                                >
                                    Kembali ke Login
                                </button>
                            </motion.div>
                        )}

                        {status === 'error' && !errorMessage.includes("Token") && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-3"
                            >
                                <button
                                    onClick={() => router.push("/auth/register")}
                                    className="w-full bg-trisula-500 hover:bg-trisula-400 text-midnight-950 font-bold py-3 rounded-xl transition-all"
                                >
                                    Daftar Ulang
                                </button>
                                <button
                                    onClick={() => router.push("/login")}
                                    className="w-full text-zinc-500 hover:text-white text-sm font-medium py-2 transition-colors"
                                >
                                    Kembali ke Login
                                </button>
                            </motion.div>
                        )}
                    </div>
                </GoldCard>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen p-4 md:p-8 bg-midnight-950 text-white flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-trisula-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}

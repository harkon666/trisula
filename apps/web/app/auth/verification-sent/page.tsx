"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoldCard } from "@/src/components/ui/GoldCard";
import { motion } from "framer-motion";
import api from "@/src/lib/api-client";

export default function VerificationSentPage() {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState<string | null>(null);

    useEffect(() => {
        // Get email from session storage
        const storedEmail = sessionStorage.getItem('pendingVerificationEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    const handleResend = async () => {
        if (!email) return;

        setIsResending(true);
        setResendMessage(null);

        try {
            const response = await api.post('/v1/auth/resend-verification', { email });
            if (response.data.success) {
                setResendMessage("Link verifikasi telah dikirim ulang ke email Anda.");
            } else {
                setResendMessage(response.data.message || "Gagal mengirim ulang email.");
            }
        } catch (err: any) {
            setResendMessage(err.response?.data?.message || "Terjadi kesalahan saat mengirim ulang.");
        } finally {
            setIsResending(false);
        }
    };

    const handleBackToLogin = () => {
        sessionStorage.removeItem('pendingVerificationEmail');
        router.push("/login");
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-midnight-950 text-white flex items-center justify-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-b from-midnight-950 via-midnight-900 to-midnight-950 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-trisula-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-lg relative z-10">
                <GoldCard className="p-1">
                    <div className="bg-midnight-900/90 border border-white/5 backdrop-blur-xl p-8 rounded-[28px] shadow-2xl">
                        {/* Success Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-trisula-500/20 to-trisula-500/5 border border-trisula-500/30 flex items-center justify-center"
                        >
                            <svg className="w-10 h-10 text-trisula-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <h1 className="text-2xl font-black mb-3 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                                Cek Email Anda
                            </h1>
                            <p className="text-zinc-400 text-sm mb-2">
                                Kami telah mengirim link verifikasi ke:
                            </p>
                            <p className="text-trisula-400 font-bold text-lg mb-6">
                                {email || "email@example.com"}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-midnight-950/50 border border-white/5 rounded-2xl p-5 mb-6"
                        >
                            <h3 className="text-sm font-bold text-zinc-300 mb-3 uppercase tracking-wider">Langkah selanjutnya:</h3>
                            <ul className="space-y-3 text-sm text-zinc-400">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-trisula-500/20 text-trisula-400 text-xs font-bold flex items-center justify-center">1</span>
                                    <span>Buka email dan klik tombol <span className="text-white font-semibold">Verifikasi Email</span></span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-trisula-500/20 text-trisula-400 text-xs font-bold flex items-center justify-center">2</span>
                                    <span>Setelah verifikasi, Anda akan diarahkan ke dashboard</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-trisula-500/20 text-trisula-400 text-xs font-bold flex items-center justify-center">3</span>
                                    <span>Login dengan <span className="text-white font-semibold">Agent ID</span> dan password Anda</span>
                                </li>
                            </ul>
                        </motion.div>

                        {resendMessage && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`mb-6 p-4 rounded-xl text-sm text-center ${resendMessage.includes("telah dikirim") ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}
                            >
                                {resendMessage}
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-3"
                        >
                            <button
                                onClick={handleResend}
                                disabled={isResending || !email}
                                className="w-full bg-midnight-950/50 border border-white/10 hover:border-trisula-500/50 text-zinc-300 hover:text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isResending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Mengirim...
                                    </span>
                                ) : (
                                    "Kirim Ulang Email Verifikasi"
                                )}
                            </button>

                            <button
                                onClick={handleBackToLogin}
                                className="w-full text-zinc-500 hover:text-white text-sm font-medium py-2 transition-colors"
                            >
                                Kembali ke Login
                            </button>
                        </motion.div>
                    </div>
                </GoldCard>

                <p className="text-center text-zinc-600 text-xs mt-6">
                    Tidak menerima email? Cek folder Spam atau klik "Kirim Ulang"
                </p>
            </div>
        </div>
    );
}

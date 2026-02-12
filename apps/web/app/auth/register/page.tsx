"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import api from "@/src/lib/api-client";
import { toast } from "sonner";
import { GoldCard } from "@/src/components/ui/GoldCard";
import { motion, AnimatePresence } from "framer-motion";

// --- Schemas ---

const NasabahSchema = z.object({
    fullName: z.string().min(2, "Nama terlalu pendek"),
    userId: z.string().min(4, "User ID minimal 4 karakter"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    whatsapp: z.string().min(10, "Nomor WhatsApp tidak valid"),
    referredByAgentId: z.string().min(4, "ID Agent Referral wajib diisi"),
});

const AgentSchema = z.object({
    fullName: z.string().min(2, "Nama terlalu pendek"),
    userId: z.string().min(4, "User ID minimal 4 karakter"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    whatsapp: z.string().min(10, "Nomor WhatsApp tidak valid"),
    activationCode: z.string().min(5, "Kode Aktivasi wajib diisi"),
});

type NasabahFormData = z.infer<typeof NasabahSchema>;
type AgentFormData = z.infer<typeof AgentSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { login, isAuthenticated, user } = useAuth();
    const [activeTab, setActiveTab] = useState<'nasabah' | 'agent'>('nasabah');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            if (['admin', 'super_admin', 'admin_input', 'admin_view'].includes(user.role)) {
                router.push('/admin');
            } else {
                router.push('/dashboard/nasabah');
            }
        }
    }, [isAuthenticated, user, router]);

    // Forms
    const nasabahForm = useForm<NasabahFormData>({
        resolver: zodResolver(NasabahSchema),
    });

    const agentForm = useForm<AgentFormData>({
        resolver: zodResolver(AgentSchema),
    });

    const onNasabahSubmit = async (data: NasabahFormData) => {
        setIsSubmitting(true);
        try {
            const response = await api.post('/v1/auth/register/nasabah', data);
            if (response.data.success && response.data.token) {
                login(response.data.token, response.data.user);
                toast.success("Registrasi Member Berhasil!");
                router.push("/dashboard/nasabah");
            } else {
                toast.error(response.data.message || "Gagal mendaftar");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onAgentSubmit = async (data: AgentFormData) => {
        setIsSubmitting(true);
        try {
            const response = await api.post('/v1/auth/register/agent', data);
            if (response.data.success && response.data.token) {
                login(response.data.token, response.data.user);
                toast.success("Registrasi Partner Berhasil!");
                router.push("/dashboard/agent");
            } else {
                toast.error(response.data.message || "Gagal mendaftar");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-midnight-950 text-white flex items-center justify-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-b from-midnight-950 via-midnight-900 to-midnight-950 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-trisula-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-lg relative z-10">
                <GoldCard className="p-1">
                    <div className="bg-midnight-900/90 border border-white/5 backdrop-blur-xl p-8 rounded-[28px] shadow-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight">
                                Join Trisula
                            </h1>
                            <p className="text-zinc-400 font-medium text-sm">Select your role to start your journey.</p>
                        </div>

                        {/* Role Selection Tabs */}
                        <div className="flex p-1 bg-midnight-950/50 rounded-xl mb-8 border border-white/5 relative">
                            <button
                                onClick={() => setActiveTab('nasabah')}
                                className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-lg transition-all relative z-10 ${activeTab === 'nasabah' ? 'text-midnight-950' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Member
                            </button>
                            <button
                                onClick={() => setActiveTab('agent')}
                                className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-lg transition-all relative z-10 ${activeTab === 'agent' ? 'text-midnight-950' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Partner
                            </button>

                            {/* Animated Background for Active Tab */}
                            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-trisula-500 rounded-lg transition-all duration-300 ease-spring ${activeTab === 'nasabah' ? 'left-1' : 'left-[calc(50%+4px)]'}`} />
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'nasabah' ? (
                                <motion.form
                                    key="nasabah"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={nasabahForm.handleSubmit(onNasabahSubmit)}
                                    className="space-y-5"
                                >
                                    <InputField label="Full Name" name="fullName" register={nasabahForm.register} error={nasabahForm.formState.errors.fullName} placeholder="John Doe" />
                                    <InputField label="User ID" name="userId" register={nasabahForm.register} error={nasabahForm.formState.errors.userId} placeholder="JOHN01" />
                                    <InputField label="Password" name="password" type="password" register={nasabahForm.register} error={nasabahForm.formState.errors.password} placeholder="••••••••" />
                                    <InputField label="WhatsApp" name="whatsapp" register={nasabahForm.register} error={nasabahForm.formState.errors.whatsapp} placeholder="628123456789" />
                                    <InputField label="Referral Agent ID (Required)" name="referredByAgentId" register={nasabahForm.register} error={nasabahForm.formState.errors.referredByAgentId} placeholder="SULTAN01" className="bg-trisula-500/10 border-trisula-500/30 focus:border-trisula-500/50 placeholder:text-trisula-500/30 text-trisula-200" />

                                    <SubmitButton isSubmitting={isSubmitting} label="Register as Member" />
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="agent"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={agentForm.handleSubmit(onAgentSubmit)}
                                    className="space-y-5"
                                >
                                    <InputField label="Full Name" name="fullName" register={agentForm.register} error={agentForm.formState.errors.fullName} placeholder="Agent Smith" />
                                    <InputField label="User ID" name="userId" register={agentForm.register} error={agentForm.formState.errors.userId} placeholder="AGENT01" />
                                    <InputField label="Password" name="password" type="password" register={agentForm.register} error={agentForm.formState.errors.password} placeholder="••••••••" />
                                    <InputField label="WhatsApp" name="whatsapp" register={agentForm.register} error={agentForm.formState.errors.whatsapp} placeholder="628123456789" />
                                    <InputField label="Activation Code (Required)" name="activationCode" register={agentForm.register} error={agentForm.formState.errors.activationCode} placeholder="CODE-12345" className="bg-ice-500/10 border-ice-500/30 focus:border-ice-500/50 placeholder:text-ice-500/30 text-ice-200" />

                                    <SubmitButton isSubmitting={isSubmitting} label="Register as Partner" />
                                </motion.form>
                            )}
                        </AnimatePresence>

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

// --- Components ---

function InputField({ label, name, type = "text", register, error, placeholder, className = "" }: any) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">{label}</label>
            <input
                {...register(name)}
                type={type}
                className={`w-full bg-midnight-950/50 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 focus:outline-none transition-all placeholder:text-zinc-700 text-white ${className}`}
                placeholder={placeholder}
            />
            {error && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{error.message}</p>}
        </div>
    );
}

function SubmitButton({ isSubmitting, label }: { isSubmitting: boolean, label: string }) {
    return (
        <div className="pt-4">
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-trisula-500 to-trisula-600 hover:from-trisula-400 hover:to-trisula-500 text-midnight-950 font-black uppercase tracking-widest py-4 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? "Processing..." : label}
            </button>
        </div>
    );
}

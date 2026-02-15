"use client";

import { useAgentReferralDetail } from "@/src/hooks/useAgentDashboard";
import { useParams, useRouter } from "next/navigation";
import { PageEntrance } from "@/src/components/ui/GsapContext";
import RoleGuard from "@/src/components/auth/RoleGuard";
import { ArrowLeft, User, Phone, Mail, ShieldCheck, Ticket, AlertCircle, History, Calendar } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function ReferralDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: detail, isLoading, isError } = useAgentReferralDetail(params.id as string);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!isLoading && detail) {
            gsap.from(".stagger-card", {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power3.out",
                delay: 0.2
            });
        }
    }, { scope: containerRef, dependencies: [isLoading, detail] });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-midnight-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold-metallic/30 border-t-gold-metallic rounded-full animate-spin" />
                    <p className="text-zinc-500 text-sm animate-pulse">Memuat Data Nasabah...</p>
                </div>
            </div>
        );
    }

    if (isError || !detail) {
        return (
            <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center gap-4 text-center">
                <div className="p-4 rounded-full bg-red-500/10 text-red-500">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white">Akses Ditolak</h2>
                <p className="text-zinc-400 max-w-md">
                    Nasabah ini tidak ditemukan dalam jaringan Anda atau Anda tidak memiliki izin untuk melihat data ini.
                </p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
                >
                    Kembali
                </button>
            </div>
        );
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <RoleGuard allowedRoles={['agent']}>
            <PageEntrance className="min-h-screen bg-midnight-950 text-white pb-20">
                <div ref={containerRef} className="max-w-7xl mx-auto px-6 pt-8 space-y-8">

                    {/* Header */}
                    <div className="stagger-card flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <button
                            onClick={() => router.back()}
                            className="w-fit flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Kembali ke Dashboard</span>
                        </button>
                    </div>

                    {/* Profile Card */}
                    <div className="stagger-card bg-charcoal-900/50 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-gold-metallic/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold-metallic/10 transition-colors duration-700" />

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-metallic via-gold-dark to-yellow-900 flex items-center justify-center shadow-lg shadow-gold-metallic/20">
                                <User className="w-8 h-8 text-white" />
                            </div>

                            <div className="flex-1 space-y-2">
                                <h1 className="text-3xl font-bold">{detail.profile.fullName}</h1>
                                <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
                                            <Phone className="w-3.5 h-3.5" />
                                        </div>
                                        {detail.profile.whatsapp}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                        </div>
                                        Bergabung tgl {new Date(detail.profile.joinedAt).toLocaleDateString("id-ID")}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                                            <Mail className="w-3.5 h-3.5" />
                                        </div>
                                        {detail.profile.email || "Email belum didaftarkan"}
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 rounded-2xl bg-charcoal-800/50 border border-white/5 text-center min-w-[200px]">
                                <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-1">Total Poin</p>
                                <p className="text-3xl font-black text-gold-metallic">{detail.profile.pointsBalance.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* 1. Polis Data */}
                        <div className="stagger-card space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-gold-metallic" />
                                Daftar Polis
                            </h2>
                            <div className="space-y-3">
                                {detail.polis.length > 0 ? (
                                    detail.polis.map((p: any) => (
                                        <div key={p.id} className="p-4 rounded-2xl bg-charcoal-800/50 border border-white/5 hover:border-gold-metallic/30 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded">
                                                    #{p.polisNumber}
                                                </span>
                                                <span className="text-sm font-bold text-gold-metallic">
                                                    {formatCurrency(p.premiumAmount)}
                                                </span>
                                            </div>
                                            <p className="text-zinc-400 text-sm">Terdaftar pada {formatDate(p.createdAt)}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center border-dashed">
                                        <p className="text-zinc-500">Belum ada data polis.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Watchdog (Interactions) */}
                        <div className="stagger-card space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <History className="w-5 h-5 text-blue-400" />
                                Aktivitas WhatsApp
                            </h2>
                            <div className="space-y-3">
                                {detail.interactions.length > 0 ? (
                                    detail.interactions.map((log: any) => {
                                        const isOld = (Date.now() - new Date(log.clickedAt).getTime()) > 5 * 60 * 1000;
                                        // Assume !isAdminNotified means not yet handled by office
                                        const needsAttention = isOld && !log.isAdminNotified;

                                        return (
                                            <div key={log.id} className="group relative p-4 rounded-2xl bg-charcoal-800/50 border border-white/5 hover:bg-white/5 transition-colors">
                                                <div className="flex justify-between items-center relative z-10">
                                                    <div>
                                                        <p className="font-bold text-sm">Klik Tombol WhatsApp</p>
                                                        <p className="text-xs text-zinc-500 mt-1">{formatDate(log.clickedAt)}</p>
                                                    </div>
                                                    {needsAttention && (
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold animate-pulse">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>Needs Attention</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center border-dashed">
                                        <p className="text-zinc-500">Belum ada interaksi tercatat.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* 3. Points History (Full Width) */}
                    <div className="stagger-card space-y-4 pb-12">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-green-400" />
                            Riwayat Poin
                        </h2>
                        <div className="overflow-hidden rounded-2xl border border-white/5 bg-charcoal-800/30">
                            <table className="w-full text-left text-sm text-zinc-400">
                                <thead className="bg-white/5 text-zinc-300 uppercase text-xs font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Tanggal</th>
                                        <th className="px-6 py-4">Sumber</th>
                                        <th className="px-6 py-4">Keterangan</th>
                                        <th className="px-6 py-4 text-right">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {detail.points.length > 0 ? (
                                        detail.points.map((pt: any) => (
                                            <tr key={pt.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">{formatDate(pt.createdAt)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold capitalize
                                                        ${pt.amount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}
                                                    `}>
                                                        {pt.source}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 max-w-xs truncate">{pt.description || "-"}</td>
                                                <td className={`px-6 py-4 text-right font-bold ${pt.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {pt.amount > 0 ? '+' : ''}{pt.amount}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-zinc-600 italic">
                                                Belum ada riwayat transaksi poin.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </PageEntrance>
        </RoleGuard>
    );
}

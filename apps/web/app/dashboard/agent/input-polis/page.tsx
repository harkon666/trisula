"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { AgentNavbar } from "@/src/components/organisms/AgentNavbar";
import { AgentPolisInputForm } from "@/src/components/molecules/AgentPolisInputForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import RoleGuard from "@/src/components/auth/RoleGuard";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/atoms";

export default function AgentPolisInputPage() {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <RoleGuard allowedRoles={['agent']}>
            <div className="min-h-screen bg-midnight-950 text-white pb-20">
                <AgentNavbar />

                <main className="pt-28 max-w-4xl mx-auto px-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/agent">
                                <Button variant="ghost" className="p-3 rounded-xl bg-charcoal-800/50 border border-white/5 hover:bg-charcoal-700">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">
                                    Input <span className="text-trisula-500">Polis Sold</span>
                                </h1>
                                <p className="text-zinc-400 mt-1">Catat penjualan polis yang sudah deal di luar sistem</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <AgentPolisInputForm />

                    {/* Info */}
                    <div className="mt-8 p-6 rounded-2xl bg-charcoal-900/40 border border-white/5">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-trisula-500/10 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-trisula-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-2">Informasi Penting</h3>
                                <ul className="text-sm text-zinc-400 space-y-2">
                                    <li>• Polis yang diinput akan berstatus <span className="text-amber-400 font-bold">pending</span> dan menunggu persetujuan admin</li>
                                    <li>• Pastikan nomor polis valid dan sesuai dengan dokumen resmi</li>
                                    <li>• Setelah disetujui, point akan otomatis masuk ke rekening城乡居民</li>
                                    <li>• Admin dapat menolak dengan menyertakan alasan</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </RoleGuard>
    );
}
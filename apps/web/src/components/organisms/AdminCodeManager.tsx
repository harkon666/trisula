"use client";

import { useState } from "react";
import { useAdminCodes, AgentCode } from "@/src/hooks/useAdminCodes";
import {
    Plus,
    Copy,
    Trash2,
    CheckCircle2,
    History,
    Hash,
    User,
    Calendar,
    Loader2,
    ShieldAlert,
    Keyboard,
} from "lucide-react";
import { Button, Input } from "@/src/components/atoms";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

export function AdminCodeManager() {
    const { codes, isLoading, registerCode, isRegistering, deleteCode, isDeleting } = useAdminCodes();
    const [newCode, setNewCode] = useState("");

    const handleAddCode = () => {
        if (!newCode.trim()) {
            toast.error("Silakan masukkan kode agen");
            return;
        }
        registerCode(newCode, {
            onSuccess: () => {
                setNewCode("");
            }
        });
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Kode disalin ke clipboard", {
            icon: <CheckCircle2 className="w-4 h-4 text-gold-metallic" />,
            style: {
                background: "#002366",
                border: "1px solid #D4AF37",
                color: "#D4AF37",
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Header / Registration Form */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl border border-white/10 bg-charcoal-900/40 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-metallic/5 blur-3xl rounded-full" />

                <div className="space-y-1 relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        Agent Activation Codes
                    </h2>
                    <p className="text-sm text-zinc-500">Daftarkan kode agen resmi dari kantor pusat secara manual.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto relative z-10">
                    <Input
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleAddCode()}
                        placeholder="INPUT KODE AGEN (E.G. JKT-001)"
                        className="min-w-[240px] h-14 bg-charcoal-800/50 border-white/5 rounded-2xl font-mono text-white placeholder:text-zinc-600 focus:border-gold-metallic/50 focus:ring-1 focus:ring-gold-metallic/20 transition-all uppercase pl-12"
                        icon={<Keyboard className="w-5 h-5 text-zinc-500 group-focus-within:text-gold-metallic" />}
                    />
                    <Button
                        onClick={handleAddCode}
                        isLoading={isRegistering}
                        disabled={!newCode.trim()}
                        className="px-8 h-14 bg-gold-metallic text-charcoal-950 font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-gold-metallic/20 border-transparent whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        <span>TAMBAH KODE</span>
                    </Button>
                </div>
            </div>

            {/* List Table */}
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-charcoal-900/40 backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Aktivasi Kode</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Dibuat Oleh</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Waktu Buat</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-7">
                                            <div className="h-4 bg-white/5 rounded w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : codes?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-zinc-600 italic">
                                        Belum ada kode yang di-generate.
                                    </td>
                                </tr>
                            ) : (
                                codes?.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                    <Hash className="w-4 h-4 text-gold-metallic/50" />
                                                </div>
                                                <span className="font-mono font-bold text-gold-metallic tracking-wider">
                                                    {item.code}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                                <User className="w-4 h-4 text-zinc-500" />
                                                {item.generatedByName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(item.createdAt), "dd MMM yyyy", { locale: id })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.isUsed ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-tighter border border-emerald-500/20">
                                                    Sudah Terpakai
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-tighter border border-blue-500/20">
                                                    Siap Digunakan
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(item.code)}
                                                    className="p-2.5 rounded-xl bg-white/5 text-zinc-400 hover:text-gold-metallic hover:bg-gold-metallic/10 transition-all border border-transparent hover:border-gold-metallic/20 h-auto"
                                                    title="Salin Kode"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>

                                                {!item.isUsed && (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => deleteCode(item.id)}
                                                        isLoading={isDeleting}
                                                        className="p-2.5 rounded-xl bg-red-500/5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 h-auto"
                                                        title="Hapus Kode"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Warning for Super Admin */}
            {!isLoading && codes?.some(c => !c.isUsed) && (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
                    <ShieldAlert className="w-5 h-5 text-red-500/60 mt-0.5" />
                    <p className="text-xs text-red-500/60 font-medium leading-relaxed">
                        Hanya Super Admin yang dapat menghapus kode aktivasi yang belum digunakan. Kode yang sudah terpakai oleh agen tidak dapat dihapus demi integritas audit history sistem.
                    </p>
                </div>
            )}
        </div>
    );
}

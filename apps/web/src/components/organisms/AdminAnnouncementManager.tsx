"use client";

import { useState } from "react";
import { useAdminAnnouncements, Announcement, CreateAnnouncementInput } from "@/src/hooks/useAdminAnnouncements";
import {
    Megaphone,
    Plus,
    Trash2,
    Edit2,
    Eye,
    EyeOff,
    Video,
    Link as LinkIcon,
    Save,
    Loader2,
    X,
    ExternalLink,
    ToggleLeft,
    ToggleRight,
    FileText,
    Sparkles,
} from "lucide-react";
import { Button, Input, Card, Badge } from "@/src/components/atoms";
import { toast } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function AdminAnnouncementManager() {
    const {
        announcements,
        isLoading,
        createAnnouncement,
        isCreating,
        updateAnnouncement,
        isUpdating,
        toggleAnnouncement,
        deleteAnnouncement,
        isDeleting,
    } = useAdminAnnouncements();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<CreateAnnouncementInput>({
        title: "",
        content: "",
        videoUrl: "",
        ctaUrl: "",
        isActive: true,
    });

    const resetForm = () => {
        setFormData({ title: "", content: "", videoUrl: "", ctaUrl: "", isActive: true });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleOpenAdd = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const handleOpenEdit = (a: Announcement) => {
        setEditingId(a.id);
        setFormData({
            title: a.title || "",
            content: a.content || "",
            videoUrl: a.videoUrl || "",
            ctaUrl: a.ctaUrl || "",
            isActive: a.isActive ?? true,
        });
        setIsFormOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.title.trim()) {
            toast.error("Judul pengumuman wajib diisi");
            return;
        }

        if (editingId) {
            updateAnnouncement({ id: editingId, data: formData }, {
                onSuccess: () => resetForm(),
            });
        } else {
            createAnnouncement(formData, {
                onSuccess: () => resetForm(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm("Hapus pengumuman ini? Semua data view terkait juga akan dihapus.")) return;
        deleteAnnouncement(id);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl border border-white/10 bg-charcoal-900/40 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-metallic/5 blur-3xl rounded-full" />

                <div className="space-y-1 relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <Megaphone className="w-6 h-6 text-gold-metallic" />
                        Announcement Manager
                    </h2>
                    <p className="text-sm text-zinc-500">Kelola pengumuman pop-up, video promo, dan CTA untuk nasabah TRISULA.</p>
                </div>

                <Button
                    onClick={handleOpenAdd}
                    className="bg-gold-metallic text-charcoal-950 hover:bg-gold-metallic/90 font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl border-transparent shadow-lg shadow-gold-metallic/20 gap-2 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Buat Pengumuman
                </Button>
            </div>

            {/* Form Panel */}
            {isFormOpen && (
                <div className="rounded-3xl border border-gold-metallic/20 bg-charcoal-900/60 backdrop-blur-md overflow-hidden animate-in slide-in-from-top-4 fade-in duration-500">
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-gold-metallic" />
                                {editingId ? "Edit Pengumuman" : "Pengumuman Baru"}
                            </h3>
                            <button onClick={resetForm} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left: Form Fields */}
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gold-metallic/70 uppercase tracking-widest">Judul Pengumuman</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Contoh: Promo Spesial Akhir Tahun"
                                        className="bg-charcoal-800/50 border-white/5 rounded-2xl text-sm focus:border-gold-metallic/50 h-14"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gold-metallic/70 uppercase tracking-widest">Konten / Deskripsi</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Tulis konten pengumuman..."
                                        rows={4}
                                        className="w-full bg-charcoal-800/50 border border-white/5 rounded-2xl text-sm text-white p-4 focus:border-gold-metallic/50 focus:outline-none focus:ring-1 focus:ring-gold-metallic/30 resize-none placeholder:text-zinc-600"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gold-metallic/70 uppercase tracking-widest flex items-center gap-1.5">
                                        <Video className="w-3 h-3" /> URL Video Promo
                                    </label>
                                    <Input
                                        value={formData.videoUrl}
                                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="bg-charcoal-800/50 border-white/5 rounded-2xl text-sm focus:border-gold-metallic/50 h-14"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gold-metallic/70 uppercase tracking-widest flex items-center gap-1.5">
                                        <LinkIcon className="w-3 h-3" /> Link Tujuan (CTA)
                                    </label>
                                    <Input
                                        value={formData.ctaUrl}
                                        onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                                        placeholder="https://wa.me/628..."
                                        className="bg-charcoal-800/50 border-white/5 rounded-2xl text-sm focus:border-gold-metallic/50 h-14"
                                    />
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div>
                                        <p className="text-xs font-bold text-white">Status Publikasi</p>
                                        <p className="text-[10px] text-zinc-500">Aktifkan untuk langsung ditampilkan ke nasabah</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                        className={cn(
                                            "transition-colors",
                                            formData.isActive ? "text-emerald-400" : "text-zinc-600"
                                        )}
                                    >
                                        {formData.isActive
                                            ? <ToggleRight className="w-10 h-10" />
                                            : <ToggleLeft className="w-10 h-10" />
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Right: Live Preview */}
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black text-gold-metallic/70 uppercase tracking-widest mb-2">Pratinjau Langsung</label>
                                <div className="flex-1 rounded-2xl border border-dashed border-gold-metallic/20 bg-midnight-950/80 p-6 flex flex-col min-h-[300px]">
                                    {formData.title ? (
                                        <div className="flex flex-col h-full animate-in fade-in duration-300">
                                            {/* Preview Header */}
                                            <div className="mb-4">
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 mb-3",
                                                    formData.isActive
                                                        ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                                                        : "text-zinc-500 border-zinc-700 bg-zinc-800/50"
                                                )}>
                                                    {formData.isActive ? "LIVE" : "DRAFT"}
                                                </Badge>
                                                <h4 className="text-lg font-black text-white tracking-tight">{formData.title}</h4>
                                            </div>

                                            {/* Video Preview */}
                                            {formData.videoUrl && (
                                                <div className="rounded-xl bg-charcoal-900/80 border border-white/5 p-4 mb-4 flex items-center gap-3">
                                                    <Video className="w-5 h-5 text-gold-metallic shrink-0" />
                                                    <span className="text-xs text-zinc-400 truncate">{formData.videoUrl}</span>
                                                </div>
                                            )}

                                            {/* Content Preview */}
                                            {formData.content && (
                                                <p className="text-sm text-zinc-400 leading-relaxed mb-4 flex-1">{formData.content}</p>
                                            )}

                                            {/* CTA Preview */}
                                            {formData.ctaUrl && (
                                                <div className="mt-auto">
                                                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gold-metallic/10 border border-gold-metallic/20 rounded-xl text-gold-metallic text-xs font-bold">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        Buka Link
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                                            <Eye className="w-8 h-8 text-gold-metallic/50 mb-3" />
                                            <p className="text-sm text-zinc-500 italic">Pratinjau pengumuman akan ditampilkan di sini saat Anda mengisi form.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end mt-8">
                            <Button
                                onClick={handleSubmit}
                                disabled={isCreating || isUpdating}
                                className="bg-gold-metallic text-charcoal-950 hover:bg-gold-metallic/90 font-black uppercase tracking-widest text-xs px-10 py-4 rounded-2xl border-transparent shadow-lg shadow-gold-metallic/20 gap-2"
                            >
                                {(isCreating || isUpdating) ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {editingId ? "Simpan Perubahan" : "Publikasikan Sekarang"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Announcements Table */}
            <Card variant="outline" className="overflow-hidden border-white/5 bg-charcoal-900/40 backdrop-blur-sm rounded-3xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pengumuman</th>
                                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Media</th>
                                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">
                                    <span className="flex items-center gap-1 justify-center"><Eye className="w-3 h-3" />Views</span>
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-8">
                                            <div className="h-6 bg-white/5 rounded-xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : !announcements?.length ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <Megaphone className="w-10 h-10 text-gold-metallic/30" />
                                            <p className="text-sm text-zinc-500 italic">Belum ada pengumuman. Buat pengumuman pertama Anda!</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                announcements.map((a) => (
                                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-metallic/10 to-transparent border border-gold-metallic/10 flex items-center justify-center text-gold-metallic/50 shrink-0 mt-0.5">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-white group-hover:text-gold-metallic transition-colors truncate max-w-[250px]">
                                                        {a.title || "Tanpa Judul"}
                                                    </p>
                                                    {a.content && (
                                                        <p className="text-xs text-zinc-500 truncate max-w-[250px] mt-0.5">{a.content}</p>
                                                    )}
                                                    {a.createdAt && (
                                                        <p className="text-[10px] text-zinc-600 mt-1">
                                                            {new Date(a.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                {a.videoUrl && (
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-blue-400 border-blue-500/20 bg-blue-500/5 gap-1">
                                                        <Video className="w-3 h-3" /> Video
                                                    </Badge>
                                                )}
                                                {a.ctaUrl && (
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-amber-400 border-amber-500/20 bg-amber-500/5 gap-1">
                                                        <LinkIcon className="w-3 h-3" /> CTA
                                                    </Badge>
                                                )}
                                                {!a.videoUrl && !a.ctaUrl && (
                                                    <span className="text-xs text-zinc-600 italic">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <button
                                                onClick={() => toggleAnnouncement({ id: a.id, isActive: !a.isActive })}
                                                className="inline-block"
                                            >
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all hover:scale-105",
                                                    a.isActive
                                                        ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                                                        : "text-zinc-500 border-zinc-700 bg-zinc-800/50"
                                                )}>
                                                    {a.isActive ? (
                                                        <><Eye className="w-3 h-3 mr-1" />Aktif</>
                                                    ) : (
                                                        <><EyeOff className="w-3 h-3 mr-1" />Nonaktif</>
                                                    )}
                                                </Badge>
                                            </button>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="text-sm font-black text-white">{a.totalViews.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenEdit(a)}
                                                    className="text-zinc-400 hover:text-gold-metallic hover:bg-gold-metallic/5 rounded-xl border-transparent p-2 h-auto"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(a.id)}
                                                    disabled={isDeleting}
                                                    className="text-zinc-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl border-transparent p-2 h-auto"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

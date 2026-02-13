"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAdminUsers, useAdminUserDetail, AdminUserListItem } from "@/src/hooks/useAdminUsers";
import {
    Users,
    Search,
    Settings2,
    X,
    UserCircle2,
    ShieldCheck,
    UserCheck,
    Coins,
    Loader2,
    Database,
    History
} from "lucide-react";
import { Button, Input, Card, Badge } from "@/src/components/atoms";
import { MetadataEditor } from "./MetadataEditor";
import { AdminUserPointHistory } from "./AdminUserPointHistory";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function AdminUserManager() {
    const { data: users, isLoading } = useAdminUsers();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"metadata" | "history">("metadata");
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { data: userDetail, isLoading: isLoadingDetail } = useAdminUserDetail(selectedUserId);

    // Modal Scroll Lock Pattern
    useEffect(() => {
        if (selectedUserId) {
            const scrollY = window.scrollY;
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        } else {
            const scrollY = document.body.style.top;
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.paddingRight = "";
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || "0") * -1);
            }
        }
        return () => {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.paddingRight = "";
        };
    }, [selectedUserId]);

    const handleOverlayWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop += e.deltaY;
        }
    };

    const modalContent = selectedUserId && (
        <div
            onWheel={handleOverlayWheel}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
        >
            <div className="relative w-full max-w-2xl bg-charcoal-900 border border-gold-metallic/20 rounded-3xl shadow-2xl shadow-gold-metallic/5 max-h-[90vh] flex flex-col overflow-hidden">
                {/* Sticky Header Container */}
                <div className="p-6 sm:p-8 pb-0 shrink-0 z-10 bg-charcoal-900 border-b border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-black text-white italic tracking-tight uppercase">Control Panel User</h3>
                            {userDetail && (
                                <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">
                                    Managing: <span className="text-gold-metallic">{userDetail.fullName || userDetail.userId}</span>
                                </p>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUserId(null)}
                            className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 h-auto border-transparent"
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex bg-charcoal-800/50 p-1.5 rounded-2xl border border-white/5 mb-8 w-fit overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab("metadata")}
                            className={cn(
                                "flex items-center gap-2.5 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                activeTab === "metadata"
                                    ? "bg-gold-metallic text-charcoal-950 shadow-lg shadow-gold-metallic/20"
                                    : "text-zinc-500 hover:text-white"
                            )}
                        >
                            <Database className="w-4 h-4" />
                            Metadata
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={cn(
                                "flex items-center gap-2.5 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                activeTab === "history"
                                    ? "bg-gold-metallic text-charcoal-950 shadow-lg shadow-gold-metallic/20"
                                    : "text-zinc-500 hover:text-white"
                            )}
                        >
                            <History className="w-4 h-4" />
                            Point History
                        </button>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div
                    ref={scrollContainerRef}
                    className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar overscroll-contain min-h-0"
                >
                    {isLoadingDetail ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="w-10 h-10 text-gold-metallic animate-spin" />
                            <span className="text-xs font-black text-gold-metallic uppercase tracking-widest">Initializing Control Hub...</span>
                        </div>
                    ) : userDetail ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {activeTab === "metadata" ? (
                                <div className="space-y-8">
                                    {/* User Stats in Modal */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                                            <div className="flex items-center gap-1.5 text-gold-metallic/50">
                                                <Coins className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Points Balance</span>
                                            </div>
                                            <p className="text-lg sm:text-xl font-black text-white tracking-tight">{userDetail.pointsBalance.toLocaleString()} <span className="text-[10px] text-zinc-500">PTS</span></p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                                            <div className="flex items-center gap-1.5 text-blue-400/50">
                                                <UserCircle2 className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">User Role</span>
                                            </div>
                                            <p className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">{userDetail.role.replace('_', ' ')}</p>
                                        </div>
                                    </div>

                                    <MetadataEditor
                                        userId={userDetail.id}
                                        initialMetadata={userDetail.additionalMetadata || {}}
                                        onSuccess={() => setSelectedUserId(null)}
                                    />
                                </div>
                            ) : (
                                <AdminUserPointHistory userId={userDetail.id} />
                            )}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-red-500 font-bold uppercase tracking-widest">
                            Critical Error: Failed to link to user data.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const filteredUsers = users?.filter(user =>
        user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'super_admin': return <ShieldCheck className="w-3.5 h-3.5" />;
            case 'admin_input': return <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />;
            case 'agent': return <UserCheck className="w-3.5 h-3.5 text-emerald-400" />;
            default: return <UserCircle2 className="w-3.5 h-3.5" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl border border-white/10 bg-charcoal-900/40 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-royal-blue/5 blur-3xl rounded-full" />

                <div className="space-y-1 relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        User Base Management
                    </h2>
                    <p className="text-sm text-zinc-500">Kelola profil user, role, dan metadata dinamis TRISULA.</p>
                </div>

                <Input
                    placeholder="Cari ID atau Nama User..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-charcoal-800/50 border-white/5 rounded-2xl text-sm w-full md:w-80 focus:border-gold-metallic/50 pl-12 h-14"
                    icon={<Search className="w-5 h-5 text-zinc-500 group-focus-within:text-gold-metallic" />}
                />
            </div>

            {/* User List Table */}
            <Card variant="outline" className="overflow-hidden border-white/5 bg-charcoal-900/40 backdrop-blur-sm rounded-3xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Identitas User</th>
                                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={3} className="px-8 py-8">
                                            <div className="h-6 bg-white/5 rounded-xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-20 text-center opacity-50 italic text-zinc-500">
                                        Data user tidak ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-charcoal-800 to-black border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-gold-metallic group-hover:border-gold-metallic/30 transition-all">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white group-hover:text-gold-metallic transition-colors">
                                                        {user.fullName || "N/A"}
                                                    </span>
                                                    <span className="text-xs text-zinc-500 font-mono tracking-tighter">{user.userId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "gap-1.5 px-3 py-1 bg-white/[0.02] border-white/10 text-[10px] font-black uppercase tracking-widest",
                                                    user.role === 'super_admin' && "text-gold-metallic border-gold-metallic/20 bg-gold-metallic/5",
                                                    user.role === 'agent' && "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
                                                    user.role === 'nasabah' && "text-blue-400 border-blue-500/20 bg-blue-500/5"
                                                )}
                                            >
                                                {getRoleIcon(user.role)}
                                                {user.role.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUserId(user.id);
                                                    setActiveTab("metadata");
                                                }}
                                                className="gap-2 text-zinc-400 hover:text-gold-metallic hover:bg-gold-metallic/5 rounded-xl border-transparent"
                                            >
                                                <Settings2 className="w-4 h-4" />
                                                Manage User
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Portal to Body for Modal */}
            {selectedUserId && typeof document !== "undefined" && createPortal(modalContent, document.body)}
        </div>
    );
}

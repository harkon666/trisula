"use client";

import { useState } from "react";
import RoleGuard from "@/src/components/auth/RoleGuard";
import { PageEntrance } from "@/src/components/ui/GsapContext";
import { AdminRedeemTable, AdminPolisForm, AdminCodeManager, AdminRewardManager, AdminProductManager, AdminUserManager, AdminAnnouncementManager } from "@/src/components/organisms";
import { Activity, ShieldPlus, UserPlus, LayoutDashboard, LogOut, Ticket, Package, Users, Megaphone } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState<"fulfillment" | "polis" | "codes" | "rewards" | "products" | "users" | "announcements">("fulfillment");

    const sections = [
        { id: "fulfillment", label: "Redeem Queue", icon: Activity, component: <AdminRedeemTable />, allowedRoles: ['admin', 'super_admin', 'admin_view', 'admin_input'] },
        { id: "users", label: "User Base", icon: Users, component: <AdminUserManager />, allowedRoles: ['super_admin', 'admin_input'] },
        { id: "products", label: "Product Catalog", icon: Package, component: <AdminProductManager />, allowedRoles: ['super_admin', 'admin_input'] },
        { id: "polis", label: "Polis Entry", icon: ShieldPlus, component: <AdminPolisForm />, allowedRoles: ['admin', 'super_admin', 'admin_input'] },
        { id: "codes", label: "Agent Codes", icon: UserPlus, component: <AdminCodeManager />, allowedRoles: ['admin', 'super_admin', 'admin_input'] },
        { id: "rewards", label: "Voucher Catalog", icon: Ticket, component: <AdminRewardManager />, allowedRoles: ['super_admin'] },
        { id: "announcements", label: "Announcements", icon: Megaphone, component: <AdminAnnouncementManager />, allowedRoles: ['super_admin', 'admin_input'] },
    ];

    const visibleSections = sections.filter(s => s.allowedRoles.includes(user?.role || ""));

    return (
        <RoleGuard allowedRoles={['admin', 'super_admin', 'admin_input', 'admin_view']}>
            <PageEntrance className="min-h-screen bg-midnight-950 text-white selection:bg-gold-metallic/30 pb-20">
                {/* Header Section */}
                <div className="bg-charcoal-900/50 border-b border-white/5 backdrop-blur-md sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center justify-between w-full md:w-auto">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gold-metallic">
                                    <LayoutDashboard className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-[0.3em]">Command Center</span>
                                </div>
                                <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">
                                    Operational Dashboard
                                </h1>
                            </div>

                            {/* Mobile Logout */}
                            <button
                                onClick={logout}
                                className="md:hidden p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 active:scale-95 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Navigation and Desktop Actions */}
                        <div className="flex items-center gap-4">
                            <nav className="flex items-center gap-1 p-1 bg-charcoal-800/50 rounded-2xl border border-white/5">
                                {visibleSections.map(section => (
                                    <button
                                        key={section.id}
                                        //@ts-ignore
                                        onClick={() => setActiveSection(section.id)}
                                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                                            ${activeSection === section.id
                                                ? "bg-gold-metallic text-charcoal-950 shadow-lg shadow-gold-metallic/20"
                                                : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                                    >
                                        <section.icon className={`w-4 h-4 ${activeSection === section.id ? "" : "text-zinc-500"}`} />
                                        <span className="hidden sm:inline">{section.label}</span>
                                    </button>
                                ))}
                            </nav>

                            <button
                                onClick={logout}
                                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 group"
                            >
                                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>

                <main className="max-w-7xl mx-auto px-6 mt-12">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {visibleSections.find(s => s.id === activeSection)?.component}
                    </div>
                </main>
            </PageEntrance>
        </RoleGuard>
    );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation"; // Added navigation hooks
import RoleGuard from "@/src/components/auth/RoleGuard";
import { PageEntrance } from "@/src/components/ui/GsapContext";
import { AdminRedeemTable, AdminPolisForm, AdminCodeManager, AdminRewardManager, AdminProductManager, AdminUserManager, AdminAnnouncementManager, AdminLoginHistory, AdminWatchdogTable, GlobalWatchdogAlert } from "@/src/components/organisms";
import { Activity, ShieldPlus, UserPlus, LayoutDashboard, LogOut, Ticket, Package, Users, Megaphone, History as HistoryIcon, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

export default function AdminDashboard() {
    const { user, logout } = useAuth();

    // URL-based Navigation State
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Default to 'fulfillment' if no tab param exists
    const activeSection = searchParams.get('tab') || 'fulfillment';

    const setActiveSection = (tab: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', tab);
        router.push(`${pathname}?${params.toString()}`);
    };

    // Scroll Logic
    const scrollContainerRef = useRef<HTMLElement>(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftScroll(scrollLeft > 0);
            setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    const scrollNav = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const timeout = setTimeout(checkScroll, 100); // Delay check to ensure render
        window.addEventListener('resize', checkScroll);
        return () => {
            window.removeEventListener('resize', checkScroll);
            clearTimeout(timeout);
        };
    }, []); // Check on mount

    const sections = [
        { id: "fulfillment", label: "Redeem Queue", icon: Activity, component: <AdminRedeemTable />, allowedRoles: ['admin', 'super_admin', 'admin_view'] },
        { id: "users", label: "User Base", icon: Users, component: <AdminUserManager />, allowedRoles: ['super_admin'] },
        { id: "products", label: "Product Catalog", icon: Package, component: <AdminProductManager />, allowedRoles: ['super_admin'] },
        { id: "watchdog", label: "Watchdog Monitor", icon: ShieldAlert, component: <AdminWatchdogTable />, allowedRoles: ['super_admin', 'admin_view', 'admin_input'] },
        { id: "polis", label: "Polis Entry", icon: ShieldPlus, component: <AdminPolisForm />, allowedRoles: ['admin', 'super_admin', 'admin_input'] },
        { id: "codes", label: "Agent Codes", icon: UserPlus, component: <AdminCodeManager />, allowedRoles: ['admin', 'super_admin'] },
        { id: "rewards", label: "Voucher Catalog", icon: Ticket, component: <AdminRewardManager />, allowedRoles: ['super_admin'] },
        { id: "announcements", label: "Announcements", icon: Megaphone, component: <AdminAnnouncementManager />, allowedRoles: ['super_admin', 'admin_input'] },
        { id: "security", label: "Login History", icon: HistoryIcon, component: <AdminLoginHistory />, allowedRoles: ['super_admin', 'admin_view'] },
    ];

    const visibleSections = sections.filter(s => s.allowedRoles.includes(user?.role || ""));

    return (
        <RoleGuard allowedRoles={['admin', 'super_admin', 'admin_input', 'admin_view']}>
            <PageEntrance className="min-h-screen bg-midnight-950 text-white selection:bg-gold-metallic/30 pb-20">
                {/* Header Section */}
                <div className="bg-charcoal-900/50 border-b border-white/5 backdrop-blur-md sticky top-0 z-40">
                    <div className="max-w-[1400px] mx-auto p-4 md:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">

                        {/* 1. Branding & Mobile Actions */}
                        <div className="flex items-center justify-between shrink-0">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gold-metallic">
                                    <LayoutDashboard className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-[0.3em]">Command Center</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">
                                    Operational Dashboard
                                </h1>
                            </div>

                            {/* Mobile Logout (Visible only on small screens) */}
                            <button
                                onClick={logout}
                                className="xl:hidden p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 active:scale-95 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>

                        {/* 2. Navigation & Desktop Actions */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 min-w-0">

                            {/* Scrollable Nav Container with Indicators */}
                            <div className="flex-1 min-w-0 relative flex items-center group/nav">
                                {/* Left Scroll Button */}
                                <div className={`absolute left-0 z-50 transition-opacity duration-300 ${showLeftScroll ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                    <button
                                        onClick={() => scrollNav('left')}
                                        className="p-1.5 rounded-full bg-charcoal-800 border border-white/10 text-gold-metallic shadow-lg hover:scale-110 transition-transform -translate-x-2 md:translate-x-[-50%]"
                                        aria-label="Scroll left"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                </div>

                                <nav
                                    ref={scrollContainerRef}
                                    onScroll={checkScroll}
                                    className="flex-1 overflow-x-auto no-scrollbar mask-linear-fade scroll-smooth relative z-10"
                                >
                                    <div className="flex items-center gap-1 p-1 bg-charcoal-800/50 rounded-2xl border border-white/5 min-w-max">
                                        {visibleSections.map(section => (
                                            <button
                                                key={section.id}
                                                //@ts-ignore
                                                onClick={() => setActiveSection(section.id)}
                                                className={`flex items-center gap-2.5 px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                                                    ${activeSection === section.id
                                                        ? "bg-gold-metallic text-charcoal-950 shadow-lg shadow-gold-metallic/20"
                                                        : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                                            >
                                                <section.icon className={`w-4 h-4 ${activeSection === section.id ? "" : "text-zinc-500"}`} />
                                                <span>{section.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </nav>

                                {/* Right Scroll Button */}
                                <div className={`absolute right-0 z-50 transition-opacity duration-300 ${showRightScroll ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                    <button
                                        onClick={() => scrollNav('right')}
                                        className="p-1.5 rounded-full bg-charcoal-800 border border-white/10 text-gold-metallic shadow-lg hover:scale-110 transition-transform translate-x-2 md:translate-x-[50%]"
                                        aria-label="Scroll right"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Desktop Logout (Fixed on right) */}
                            <button
                                onClick={logout}
                                className="hidden xl:flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 group shrink-0"
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

            {/* Only show Alert if NOT on Watchdog tab */}
            {activeSection !== 'watchdog' && (
                <GlobalWatchdogAlert onFocus={() => setActiveSection('watchdog')} />
            )}

        </RoleGuard>
    );
}

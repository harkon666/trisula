"use client";

import { useAgentBirthdays, useAdminBirthdays, BirthdayNasabah } from "@/src/hooks/useBirthdays";
import { Gift, CalendarDays, ExternalLink } from "lucide-react";

interface BirthdayWidgetProps {
    role: 'agent' | 'admin';
}

export function BirthdayWidget({ role }: BirthdayWidgetProps) {
    const { data: agentData, isLoading: agentLoading } = useAgentBirthdays();
    const { data: adminData, isLoading: adminLoading } = useAdminBirthdays();

    // In agent role, use agent hook, else use admin hook (if the user has permission; the hook handles throwing auth errors if not).
    // Note: the component assumes the parent only mounts it if the user is authorized.
    const isLoading = role === 'agent' ? agentLoading : adminLoading;
    const data = role === 'agent' ? agentData : adminData;

    if (isLoading) {
        return (
            <div className="p-6 rounded-[2rem] bg-midnight-900/50 border border-white/5 backdrop-blur-sm animate-pulse h-[200px]">
                <div className="w-1/3 h-6 bg-white/10 rounded-md mb-4" />
                <div className="w-full h-12 bg-white/5 rounded-xl mb-2" />
                <div className="w-full h-12 bg-white/5 rounded-xl block" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        // Option 1: Render empty state OR Option 2: Render nothing
        // Rendering a subtle empty state is better for dashboard consistency
        return (
            <div className="p-6 rounded-[2rem] bg-midnight-900/50 border border-white/5 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Gift className="w-16 h-16 text-trisula-500 grayscale" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-zinc-500" />
                    Ulang Tahun Nasabah
                </h3>
                <p className="text-sm text-zinc-400">Tidak ada jadwal ulang tahun hari ini atau besok.</p>
            </div>
        );
    }

    const todayList = data.filter(d => d.birthdayWhen === 'today');
    const tomorrowList = data.filter(d => d.birthdayWhen === 'tomorrow');

    const handleWhatsApp = (nasabah: BirthdayNasabah) => {
        // Strip out any non-numeric characters for WA Link
        let waNumber = nasabah.whatsapp.replace(/\D/g, '');
        // If it starts with 0 (Indonesian local), replace with 62
        if (waNumber.startsWith('0')) {
            waNumber = '62' + waNumber.substring(1);
        }

        const message = `Halo Bapak/Ibu ${nasabah.fullName}, selamat ulang tahun yang ke-${nasabah.age}! Semoga panjang umur, sehat selalu, dan semakin sukses. Salam hangat dari tim TRISULA.`;
        const encodedMessage = encodeURIComponent(message);

        window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');
    };

    return (
        <div className="p-6 rounded-[2rem] bg-gradient-to-br from-midnight-900/80 to-midnight-950 border border-trisula-500/20 backdrop-blur-sm relative overflow-hidden group shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:border-trisula-500/40 transition-colors">
            {/* Glowing background effect */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-trisula-500/10 blur-[50px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
                    <Gift className="w-6 h-6 text-trisula-500 animate-bounce" />
                    Ulang Tahun (<span className="text-trisula-400">{data.length}</span>)
                </h3>
            </div>

            <div className="space-y-4 relative z-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {todayList.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-trisula-500">Hari Ini</p>
                        {todayList.map(n => (
                            <BirthdayCard key={n.id} nasabah={n} onSendWa={() => handleWhatsApp(n)} role={role} />
                        ))}
                    </div>
                )}

                {tomorrowList.length > 0 && (
                    <div className="space-y-3 mt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Besok</p>
                        {tomorrowList.map(n => (
                            <BirthdayCard key={n.id} nasabah={n} onSendWa={() => handleWhatsApp(n)} role={role} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function BirthdayCard({ nasabah, onSendWa, role }: { nasabah: BirthdayNasabah, onSendWa: () => void, role: string }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/10 transition-colors">
            <div>
                <p className="text-sm font-bold text-white leading-tight">{nasabah.fullName}</p>
                <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-zinc-400 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        Ke-{nasabah.age}
                    </p>
                    {role === 'admin' && nasabah.agentUserId && (
                        <p className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full outline outline-1 outline-white/10">
                            Ref: {nasabah.agentUserId}
                        </p>
                    )}
                </div>
            </div>

            <button
                onClick={onSendWa}
                className="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors border border-[#25D366]/20"
            >
                Kirim Ucapan (WA)
                <ExternalLink className="w-3 h-3" />
            </button>
        </div>
    );
}

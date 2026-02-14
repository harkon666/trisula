"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useAgentReferrals } from "@/src/hooks/useAgentDashboard";
import { Phone, User, Award, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/src/components/atoms";

export const ReferralTable = () => {
    const { data: referrals, isLoading } = useAgentReferrals();
    const tableRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!isLoading && referrals && referrals.length > 0) {
            gsap.from(".referral-row", {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: tableRef.current,
                    start: "top 80%",
                },
            });
        }
    }, { dependencies: [isLoading, referrals], scope: tableRef });

    if (isLoading) {
        return (
            <div className="w-full h-64 bg-white/5 rounded-3xl animate-pulse flex items-center justify-center">
                <span className="text-zinc-500 font-medium">Loading Nasabah Data...</span>
            </div>
        );
    }

    if (!referrals || referrals.length === 0) {
        return (
            <div className="w-full p-8 text-center border border-white/5 rounded-3xl bg-white/5">
                <p className="text-zinc-400">No referrals found yet. Start inviting Nasabah!</p>
            </div>
        );
    }

    return (
        <div ref={tableRef} className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-trisula-400" />
                    Nasabah Directory
                </h3>
                <span className="text-xs font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                    TOTAL: {referrals.length}
                </span>
            </div>

            <div className="overflow-x-auto custom-scrollbar rounded-3xl border border-white/5 bg-midnight-900/50 backdrop-blur-sm">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-midnight-950/80 text-white uppercase text-xs font-bold tracking-wider border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4">Nasabah Name</th>
                            <th className="px-6 py-4 text-center">Joined</th>
                            <th className="px-6 py-4 text-center">Polis Status</th>
                            <th className="px-6 py-4 text-center">Points</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {referrals.map((user) => (
                            <tr key={user.id} className="referral-row group hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-trisula-600 to-trisula-900 flex items-center justify-center text-xs font-bold border border-white/10">
                                        {user.fullName.charAt(0)}
                                    </div>
                                    {user.fullName}
                                </td>
                                <td className="px-6 py-4 text-center font-mono text-xs">
                                    {new Date(user.joinedAt).toLocaleDateString("id-ID", {
                                        day: "numeric", month: "short", year: "numeric"
                                    })}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        {user.polisCount > 0 ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                                                <ShieldCheck className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                                                <ShieldAlert className="w-3 h-3" /> None
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-trisula-400 font-bold flex items-center justify-center gap-1">
                                        <Award className="w-3 h-3" />
                                        {user.pointsBalance.toLocaleString("id-ID")}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Button
                                        variant="outline" // Assuming outline variant exists, otherwise secondary
                                        size="sm"
                                        className="h-8 px-3 text-[10px] border-white/10 hover:border-green-500/50 hover:bg-green-500/10 hover:text-green-400"
                                        onClick={() => window.open(`https://wa.me/${user.whatsapp}`, "_blank")}
                                    >
                                        <Phone className="w-3 h-3 mr-1.5" />
                                        WhatsApp
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

"use client";

import { WealthOverview, NasabahProductGrid, NasabahNavbar, DailyCheckInModal } from "@/src/components/organisms";
import { Button } from "@/src/components/atoms";
import { useRouter } from "next/navigation";
import RoleGuard from "@/src/components/auth/RoleGuard";
import { PageEntrance } from "@/src/components/ui/GsapContext";

export default function ProductsPage() {
    const router = useRouter();

    return (
        <RoleGuard allowedRoles={["nasabah"]}>
            <div className="min-h-screen bg-charcoal-deep text-white relative overflow-hidden">
                {/* Background ambient glow */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-royal-blue/8 blur-[150px] rounded-full" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-gold-metallic/5 blur-[120px] rounded-full" />
                </div>

                {/* Navbar */}
                <div className="relative z-50">
                    <NasabahNavbar />
                </div>

                <DailyCheckInModal>
                    <div className="max-w-6xl mx-auto relative z-10 px-6 pt-28 pb-16 space-y-16">
                        <PageEntrance>
                            <header className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/nasabah')} className="text-zinc-500 hover:text-white -ml-4">
                                        ← Kembali ke Dashboard
                                    </Button>
                                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-metallic/5 border border-gold-metallic/10 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gold-metallic animate-pulse" />
                                        <span className="text-[10px] font-black text-gold-metallic uppercase tracking-widest">Premium Catalog</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                                        Product <span className="bg-gradient-to-r from-gold-metallic via-gold-light to-gold-metallic bg-clip-text text-transparent">Catalog</span>
                                    </h1>
                                    <p className="text-zinc-500 font-medium max-w-xl text-lg leading-relaxed">
                                        Temukan produk asuransi dan investasi eksklusif yang dirancang khusus untuk melindungi dan menumbuhkan aset Anda di masa depan.
                                    </p>
                                </div>
                            </header>

                            <div className="mt-16 space-y-20">
                                <WealthOverview />

                                <div className="pt-10 border-t border-white/5">
                                    <NasabahProductGrid />
                                </div>
                            </div>
                        </PageEntrance>
                    </div>
                </DailyCheckInModal>
            </div>
        </RoleGuard>
    );
}

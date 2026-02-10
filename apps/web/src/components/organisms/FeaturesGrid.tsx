import { Card } from "@/src/components/atoms";
import { Gem, TrendingUp, ShieldCheck } from "lucide-react";

export function FeaturesGrid() {
    const features = [
        {
            title: "Unified Asset View",
            desc: "Monitor your entire rewards portfolio and loyalty progress all in one premium interface.",
            color: "from-trisula-500/20 to-trisula-900/0",
            icon: Gem
        },
        {
            title: "Tiered Point Yield",
            desc: "Earn points instantly from referrals and receive periodic point yields based on your engagement.",
            color: "from-ice-500/20 to-ice-900/0",
            icon: TrendingUp
        },
        {
            title: "Bank-Grade Security",
            desc: "Built with institutional-grade security for safe and seamless account management.",
            color: "from-purple-500/20 to-purple-900/0",
            icon: ShieldCheck
        }
    ];

    return (
        <section id="benefits" className="py-32 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
                    <div>
                        <h2 className="text-trisula-500 font-bold tracking-widest uppercase text-sm mb-3">Why Trisula</h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Designed for the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ice-500 to-white">Modern Elite</span>
                        </h3>
                    </div>
                    <p className="text-zinc-400 max-w-sm leading-relaxed">
                        We separate the noise from the value. Trisula offers a sanctuary for wealth growth and premium lifestyle management.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <Card
                            key={i}
                            variant="solid"
                            className="relative group hover:-translate-y-2 !bg-midnight-900 !rounded-[2rem]"
                        >
                            {/* Gradient Blob */}
                            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${feature.color} blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none`} />

                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="w-8 h-8 text-trisula-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-trisula-300 transition-colors">{feature.title}</h3>
                                <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300">{feature.desc}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

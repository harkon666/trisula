"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar, HeroSection, FeaturesGrid } from "@/src/components/organisms";

export default function Home() {
  return (
    <div className="min-h-screen bg-midnight-950 text-white selection:bg-trisula-500/30 font-sans">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep Ocean Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight-950 via-midnight-900 to-midnight-950" />

        {/* 'Trisula' Gold Glow (Top Center) */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-trisula-600/10 blur-[130px] rounded-full opacity-60 mix-blend-screen" />

        {/* 'Water' Blue Glow (Bottom Right) */}
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-ice-500/10 blur-[150px] rounded-full opacity-40 mix-blend-screen" />

        {/* Grid Overlay for structure */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
      </div>

      <Navbar />

      <HeroSection />

      {/* Stats / Social Proof - Glassmorphic Strip */}
      <section className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm z-10 relative">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Active Members", value: "2.5K+" },
            { label: "Total Asset Value", value: "$4.1M" },
            { label: "Rewards Distributed", value: "850K" },
            { label: "Partner Brands", value: "120+" }
          ].map((stat, i) => (
            <div key={i} className="text-center group cursor-default">
              <p className="text-3xl font-bold text-white mb-1 group-hover:text-trisula-400 transition-colors">{stat.value}</p>
              <p className="text-xs uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <FeaturesGrid />

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative rounded-[3rem] bg-gradient-to-b from-midnight-800 to-midnight-950 border border-white/10 p-12 md:p-20 text-center overflow-hidden">
            {/* Ambient Glows */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-trisula-500 to-transparent opacity-50" />
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-ice-500 to-transparent opacity-30" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Ready to Ascend?
              </h2>
              <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of members who are maximizing their digital lifestyle with Trisula.
              </p>

              <Link href="/auth/register" className="inline-block px-10 py-5 bg-white text-midnight-950 font-bold text-lg rounded-full hover:bg-trisula-400 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] transform hover:-translate-y-1">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-midnight-950 text-center text-zinc-600 text-sm relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all">
          <Image src="/icon.png" alt="Trisula" width={24} height={24} />
          <span className="font-bold text-white">TRISULA</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Trisula Platform. Built for the future.</p>
      </footer>

    </div>
  );
}

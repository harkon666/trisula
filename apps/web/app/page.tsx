"use client";

import Link from "next/link";
import ConnectWallet from "../components/ConnectWallet";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-amber-500/30">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 relative">
              <Image src="/icon.png" alt="Trisula" fill className="object-contain" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
              TRISULA
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="#features" className="hover:text-amber-400 transition-colors">Benefits</Link>
            <Link href="#how-it-works" className="hover:text-amber-400 transition-colors">How it Works</Link>
            <Link href="/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
          </div>
          <div className="scale-90 md:scale-100">
            <ConnectWallet />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">

        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-500/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-900/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-300 text-xs md:text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Premium Rewards for Dedicated Users
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6">
            Unlock Your <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-2xl">
              Premium Experience
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join the most rewarding referral and loyalty platform on Base.
            Earn crypto rewards, unlock premium perks, and experience seamless growth on-chain.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)]">
              Join Waitlist
            </Link>
            <Link href="/dashboard" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-semibold">
              Member Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-zinc-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Gasless Transactions", desc: "Experience Web3 without the hassle. We cover the gas fees for all active members.", icon: "⛽" },
              { title: "Instant Rewards", desc: "Refer friends and earn points instantly. Convert points to exclusive tokens and benefits.", icon: "💎" },
              { title: "Secure & Private", desc: "Built on Base Network with account abstraction for maximum security and ease.", icon: "🛡️" }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-zinc-600 text-sm">
        <p>© 2026 Trisula Platform. Built on Base.</p>
      </footer>

    </div>
  );
}

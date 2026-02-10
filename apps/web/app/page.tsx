"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import gsap from "gsap";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Simple entrance animation
    gsap.from(".hero-content", {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power4.out"
    });
  }, []);

  return (
    <div className="min-h-screen bg-midnight-950 text-white selection:bg-trisula-500/30 font-sans">

      {/* Background Ambience - Water & Deep Ocean Theme */}
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

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-midnight-950/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 relative transition-transform duration-500 group-hover:rotate-12">
              <Image src="/icon.png" alt="Trisula" fill className="object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-trisula-400 transition-colors">
              TRISULA
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-zinc-400">
            {["Benefits", "How it Works", "Testimonials"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                className="relative hover:text-white transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-trisula-500 hover:after:w-full after:transition-all"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard" className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 hover:border-trisula-500/50 transition-all flex items-center gap-2 group">
                Dashboard
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            ) : (
              <Link href="/login" className="px-6 py-3 bg-trisula-500 text-midnight-950 rounded-full text-sm font-bold hover:bg-trisula-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 md:pt-56 md:pb-40 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <div className="hero-content inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-trisula-500 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-trisula-300">The New Standard of Wealth</span>
          </div>

          <h1 className="hero-content text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
            Unlock Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-trisula-200 via-trisula-400 to-trisula-600 drop-shadow-sm filter">
              Premium Legacy
            </span>
          </h1>

          <p className="hero-content text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Join the most exclusive referral and loyalty ecosystem.
            Accumulate <span className="text-white font-semibold">Trisula Points</span>, unlock tiered rewards, and build your digital empire.
          </p>

          <div className="hero-content flex flex-col md:flex-row items-center justify-center gap-6">
            {isLoading ? (
              <div className="h-14 px-8 rounded-full bg-white/5 animate-pulse w-48" />
            ) : isAuthenticated ? (
              <Link href="/dashboard" className="group relative px-8 py-4 bg-gradient-to-r from-trisula-500 to-trisula-600 text-midnight-950 font-bold text-lg rounded-full transition-all shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:shadow-[0_0_60px_rgba(234,179,8,0.6)] hover:scale-105 active:scale-95 overflow-hidden">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10">Enter Dashboard</span>
              </Link>
            ) : (
              <>
                <Link href="/auth/register" className="group relative px-8 py-4 bg-gradient-to-r from-trisula-500 to-trisula-600 text-midnight-950 font-bold text-lg rounded-full transition-all shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:shadow-[0_0_60px_rgba(234,179,8,0.6)] hover:scale-105 active:scale-95 overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10">Start Your Legacy</span>
                </Link>
                <Link href="#how-it-works" className="px-8 py-4 bg-transparent border border-white/10 text-white font-medium text-lg rounded-full hover:bg-white/5 hover:border-white/20 transition-all">
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

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

      {/* Features Grid with Water Motifs */}
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
            {[
              {
                title: "Unified Asset View",
                desc: "Monitor your entire rewards portfolio and loyalty progress all in one premium interface.",
                color: "from-trisula-500/20 to-trisula-900/0",
                icon: "💎"
              },
              {
                title: "Tiered Point Yield",
                desc: "Earn points instantly from referrals and receive periodic point yields based on your engagement.",
                color: "from-ice-500/20 to-ice-900/0",
                icon: "📈"
              },
              {
                title: "Bank-Grade Security",
                desc: "Built with institutional-grade security for safe and seamless account management.",
                color: "from-purple-500/20 to-purple-900/0",
                icon: "🛡️"
              }
            ].map((feature, i) => (
              <div key={i} className="relative p-10 rounded-[2rem] bg-midnight-900 border border-white/5 overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
                {/* Gradient Blob */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${feature.color} blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none`} />

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-trisula-300 transition-colors">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

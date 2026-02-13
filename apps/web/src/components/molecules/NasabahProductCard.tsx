"use client";

import React from "react";
import { Product } from "@/src/hooks/useNasabahProducts";
import { ShimmerButton } from "@/src/components/atoms/ShimmerButton";
import { Sparkles, ShieldCheck, ArrowUpRight, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NasabahProductCardProps {
    product: Product;
    onBuy: (productId: number, productName: string) => void;
    isBuying: boolean;
}

export function NasabahProductCard({ product, onBuy, isBuying }: NasabahProductCardProps) {
    return (
        <div className="group relative bg-charcoal-900/40 backdrop-blur-md border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-gold-metallic/50 transition-all duration-500 hover:shadow-2xl hover:shadow-gold-metallic/10">
            {/* Visual Indicator Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-metallic/5 blur-[80px] rounded-full group-hover:bg-gold-metallic/10 transition-colors" />

            {/* Media Area */}
            <div className="relative h-48 w-full overflow-hidden border-b border-white/5 bg-black/20">
                {product.mediaUrl ? (
                    <img
                        src={product.mediaUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400/0d0d0d/D4AF37?text=TRISULA+EXCLUSIVE";
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-charcoal-900 to-black">
                        <ShieldCheck className="w-16 h-16 text-gold-metallic/20" />
                    </div>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-4 left-4">
                    <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-metallic animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Exclusive</span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8 space-y-6">
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-white tracking-tight group-hover:text-gold-metallic transition-colors duration-300">
                        {product.name}
                    </h3>
                    <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">
                        {product.description || "Dapatkan perlindungan dan imbal hasil maksimal untuk masa depan Anda."}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Rewards Potential</span>
                        <div className="flex items-center gap-2 text-gold-metallic">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-2xl font-black italic">
                                +{product.pointsReward.toLocaleString('id-ID')}
                                <span className="text-xs ml-1 font-bold not-italic text-gold-metallic/60 underline decoration-gold-metallic/20 underline-offset-4">PTS</span>
                            </span>
                        </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 group-hover:text-gold-metallic transition-all duration-500 group-hover:rotate-12">
                        <ArrowUpRight className="w-5 h-5" />
                    </div>
                </div>

                <ShimmerButton
                    className="w-full font-black italic tracking-tight"
                    onClick={() => onBuy(product.id, product.name)}
                    disabled={isBuying}
                >
                    <div className="flex items-center justify-center gap-2">
                        {isBuying ? (
                            <Loader2 className="w-5 h-5 animate-spin text-gold-metallic" />
                        ) : (
                            "BELI SEKARANG"
                        )}
                    </div>
                </ShimmerButton>
            </div>
        </div>
    );
}

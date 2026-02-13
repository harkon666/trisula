"use client";

import React, { useRef, useLayoutEffect } from "react";
import { useNasabahProducts } from "@/src/hooks/useNasabahProducts";
import { NasabahProductCard } from "@/src/components/molecules/NasabahProductCard";
import { Sparkles, LayoutGrid } from "lucide-react";
import gsap from "gsap";

export function NasabahProductGrid() {
    const { products, isLoading, initiatePurchase, isLogging } = useNasabahProducts();
    const gridRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!isLoading && products && products.length > 0) {
            const cards = gridRef.current?.querySelectorAll(".product-card-anim");
            if (cards && cards.length > 0) {
                gsap.fromTo(
                    cards,
                    {
                        opacity: 0,
                        y: 50,
                        filter: "blur(10px)"
                    },
                    {
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                        duration: 1,
                        stagger: 0.15,
                        ease: "power4.out",
                    }
                );
            }
        }
    }, [isLoading, products]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-[500px] rounded-[2.5rem] bg-white/5 border border-white/10 animate-pulse relative overflow-hidden"
                    >
                        <div className="absolute inset-x-0 top-0 h-48 bg-white/5" />
                        <div className="p-8 mt-48 space-y-4">
                            <div className="h-8 w-3/4 bg-white/5 rounded-lg" />
                            <div className="h-4 w-full bg-white/5 rounded-lg" />
                            <div className="h-4 w-5/6 bg-white/5 rounded-lg" />
                            <div className="flex justify-between items-center mt-8">
                                <div className="h-12 w-24 bg-white/5 rounded-lg" />
                                <div className="h-10 w-10 bg-white/5 rounded-xl" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-charcoal-900/20 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-3xl bg-white/5 text-zinc-600">
                        <LayoutGrid className="w-12 h-12" />
                    </div>
                    <h3 className="text-xl font-black text-white italic">KATALOG KOSONG</h3>
                    <p className="text-zinc-500 max-w-xs mx-auto">
                        Belum ada produk eksklusif yang tersedia saat ini. Silakan kembali lagi nanti.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">

            {/* Grid Container */}
            <div
                ref={gridRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {products.map((product) => (
                    <div key={product.id} className="product-card-anim">
                        <NasabahProductCard
                            product={product}
                            onBuy={(id, name) => initiatePurchase({ productId: id, productName: name })}
                            isBuying={isLogging}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

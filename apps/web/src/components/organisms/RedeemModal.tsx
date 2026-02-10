"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Card, Button, Badge, Skeleton, AnimatedCounter } from "@/src/components/atoms";
import api from "@/src/lib/api-client";
import { toast } from "sonner";
import { X, Check, AlertCircle, Gift, CircleCheck, ShieldAlert } from "lucide-react";

// --- Types ---
interface Product {
    id: string;
    name: string;
    description: string;
    pointsCost: number;
    stock: number;
    image?: string;
}

interface RedeemContextType {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    view: 'catalog' | 'confirm' | 'success' | 'error';
    selectedProduct: Product | null;
    selectProduct: (product: Product) => void;
    confirmRedeem: () => void;
    reset: () => void;
    isProcessing: boolean;
}

// --- Context ---
const RedeemContext = createContext<RedeemContextType | null>(null);

function useRedeem() {
    const context = useContext(RedeemContext);
    if (!context) throw new Error("useRedeem must be used within a RedeemModal");
    return context;
}

// --- Icons ---
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>;
const GiftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" /></svg>;

// --- Components ---

export function RedeemModal({
    item,
    userPoints,
    onSuccess,
    children
}: {
    item?: Product;
    userPoints?: number;
    onSuccess?: () => void;
    children: ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'catalog' | 'confirm' | 'success' | 'error'>('catalog');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(item || null);

    useEffect(() => {
        if (item) {
            setSelectedProduct(item);
            setView('confirm');
        }
    }, [item]);

    // Query Client for invalidation
    const queryClient = useQueryClient();

    // Mutations
    const redeemMutation = useMutation({
        mutationFn: async (productId: string) => {
            return api.post('/v1/redeem', { productId });
        },
        onSuccess: () => {
            setView('success');
            queryClient.invalidateQueries({ queryKey: ['userProfile'] }); // Refresh points
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            console.error("Redeem error", error);
            setView('error');
            toast.error(error.response?.data?.message || "Gagal menukar poin.");
        }
    });

    const open = () => setIsOpen(true);
    const close = () => {
        setIsOpen(false);
        // Reset state after transition
        setTimeout(() => reset(), 300);
    };

    const reset = () => {
        setView(item ? 'confirm' : 'catalog');
        setSelectedProduct(item || null);
        redeemMutation.reset();
    };

    const selectProduct = (product: Product) => {
        setSelectedProduct(product);
        setView('confirm');
    };

    const confirmRedeem = () => {
        if (selectedProduct) {
            redeemMutation.mutate(selectedProduct.id);
        }
    };

    return (
        <RedeemContext.Provider value={{
            isOpen, open, close, view,
            selectedProduct, selectProduct, confirmRedeem, reset,
            isProcessing: redeemMutation.isPending
        }}>
            {children}
        </RedeemContext.Provider>
    );
}

// 1. Trigger
RedeemModal.Trigger = function Trigger({ children, className, asChild }: { children: ReactNode, className?: string, asChild?: boolean }) {
    const { open } = useRedeem();

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
                const child = children as React.ReactElement<any>;
                if (child.props.onClick) child.props.onClick(e);
                open();
            },
            className: `${(children as React.ReactElement<any>).props.className || ''} ${className || ''}`.trim()
        });
    }

    return (
        <div onClick={open} className={className}>
            {children}
        </div>
    );
};

// 2. Content (The Modal Overlay & Box)
RedeemModal.Content = function Content({ className }: { className?: string }) {
    const { isOpen, close, view, selectedProduct, confirmRedeem, isProcessing, reset } = useRedeem();
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setPortalContainer(document.body);
    }, []);

    if (!isOpen || !portalContainer) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-midnight-950/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <GiftIcon />
                        {view === 'catalog' ? 'Reward Catalog' : view === 'confirm' ? 'Konfirmasi' : 'Status'}
                    </h2>
                    <button onClick={close} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <CloseIcon />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {view === 'catalog' && <RedeemModal.CatalogList />}

                    {view === 'confirm' && selectedProduct && (
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500/20 to-amber-600/5 rounded-2xl flex items-center justify-center border border-amber-500/30">
                                <span className="text-4xl">🎁</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">{selectedProduct.name}</h3>
                                <p className="text-zinc-400 mt-2">{selectedProduct.description}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-sm text-zinc-500 uppercase font-bold tracking-wider">Harga Tukar</p>
                                <p className="text-3xl font-bold text-amber-500 mt-1">
                                    {selectedProduct.pointsCost.toLocaleString()} <span className="text-sm text-amber-500/50">PTS</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {view === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 animate-bounce">
                                <CircleCheck className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Berhasil!</h3>
                            <p className="text-zinc-400">Permintaan penukaran reward Anda sedang diproses. Cek status di dashboard.</p>
                        </div>
                    )}

                    {view === 'error' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <ShieldAlert className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Gagal!</h3>
                            <p className="text-zinc-400">Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end gap-3">
                    {view === 'catalog' && (
                        <Button variant="ghost" onClick={close}>Tutup</Button>
                    )}

                    {view === 'confirm' && (
                        <>
                            <Button variant="ghost" onClick={reset} disabled={isProcessing}>Kembali</Button>
                            <Button variant="primary" onClick={confirmRedeem} isLoading={isProcessing}>
                                Tukar Sekarang
                            </Button>
                        </>
                    )}

                    {(view === 'success' || view === 'error') && (
                        <Button variant="primary" onClick={close}>Selesai</Button>
                    )}
                </div>
            </div>
        </div>,
        portalContainer
    );
};

// Internal Component: Catalog List
RedeemModal.CatalogList = function CatalogList() {
    const { selectProduct } = useRedeem();

    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get('/v1/products');
            return res.data.data as Product[];
        }
    });

    if (isLoading) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
    );

    if (!products || products.length === 0) return (
        <div className="text-center py-10 text-zinc-500">Belum ada reward tersedia.</div>
    );

    return (
        <div className="space-y-3">
            {products.map(product => (
                <div
                    key={product.id}
                    onClick={() => selectProduct(product)}
                    className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all active:scale-[0.98]"
                >
                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex-shrink-0 flex items-center justify-center text-xl">
                        🎁
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-white group-hover:text-amber-400 transition-colors">{product.name}</h4>
                        <p className="text-xs text-zinc-500 line-clamp-1">{product.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-amber-500">{product.pointsCost} PTS</div>
                        <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">Stok: {product.stock}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

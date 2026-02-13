"use client";

import { useState } from "react";
import { useAdminProducts, Product, CreateProductInput } from "@/src/hooks/useAdminProducts";
import {
    Plus,
    Layers,
    Trash2,
    Edit2,
    Eye,
    EyeOff,
    Sparkles,
    Loader2,
    X,
    CheckCircle2,
    Image as ImageIcon
} from "lucide-react";
import { Button, Input } from "@/src/components/atoms";
import { toast } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function AdminProductManager() {
    const {
        products,
        isLoading,
        createProduct,
        isCreating,
        updateProduct,
        isUpdating,
        deleteProduct,
        isDeleting
    } = useAdminProducts();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productFormData, setProductFormData] = useState<CreateProductInput>({
        name: "",
        description: "",
        pointsReward: 0,
        mediaUrl: "",
        isActive: true
    });

    const handleOpenAdd = () => {
        setProductFormData({ name: "", description: "", pointsReward: 0, mediaUrl: "", isActive: true });
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (product: Product) => {
        setEditingProduct(product);
        setProductFormData({
            name: product.name,
            description: product.description || "",
            pointsReward: product.pointsReward,
            mediaUrl: product.mediaUrl || "",
            isActive: product.isActive
        });
    };

    const handleSubmit = () => {
        if (!productFormData.name.trim() || productFormData.pointsReward < 0) {
            toast.error("Nama produk dan Poin Reward harus diisi dengan benar");
            return;
        }

        if (editingProduct) {
            updateProduct({ id: editingProduct.id, data: productFormData }, {
                onSuccess: () => {
                    setEditingProduct(null);
                    toast.success("Produk berhasil diperbarui!");
                }
            });
        } else {
            createProduct(productFormData, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    toast.success("Produk baru telah ditambahkan ke katalog!");
                }
            });
        }
    };

    const toggleStatus = (product: Product) => {
        updateProduct({ id: product.id, data: { isActive: !product.isActive } });
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Apakah Anda yakin ingin menonaktifkan produk ini? (Soft Delete)")) {
            deleteProduct(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl border border-white/10 bg-charcoal-900/40 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-metallic/5 blur-3xl rounded-full" />

                <div className="space-y-1 relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        Product Catalog Management
                    </h2>
                    <p className="text-sm text-zinc-500">Kelola daftar produk asuransi yang memberikan Reward Poin kepada Nasabah.</p>
                </div>

                <Button
                    onClick={handleOpenAdd}
                    className="relative px-8 py-4 bg-gold-metallic text-charcoal-950 font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-gold-metallic/20 border-transparent h-auto"
                >
                    <Plus className="w-5 h-5" />
                    <span>TAMBAH PRODUK BARU</span>
                </Button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
                    ))
                ) : products?.length === 0 ? (
                    <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                        <p className="text-zinc-500 italic">Katalog produk kosong.</p>
                    </div>
                ) : (
                    products?.map((product) => (
                        <div
                            key={product.id}
                            className={cn(
                                "group relative p-6 rounded-3xl border transition-all duration-300",
                                product.isActive
                                    ? "bg-charcoal-900/40 border-white/10 hover:border-gold-metallic/30"
                                    : "bg-black/40 border-white/5 opacity-70 grayscale-[0.5]"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "p-3 rounded-2xl",
                                    product.isActive ? "bg-gold-metallic/10 text-gold-metallic" : "bg-white/5 text-zinc-500"
                                )}>
                                    <Layers className="w-6 h-6" />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenEdit(product)}
                                        className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white transition-colors h-auto"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-500/50 hover:text-red-500 transition-colors h-auto border-red-500/20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Image Preview in Card */}
                            {product.mediaUrl && (
                                <div className="mb-4 relative h-32 w-full rounded-2xl overflow-hidden border border-white/5 bg-black/20">
                                    <img
                                        src={product.mediaUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400/1a1a1a/gold?text=Invalid+Image";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white group-hover:text-gold-metallic transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-zinc-500 line-clamp-2 h-10">
                                    {product.description || "Tidak ada deskripsi."}
                                </p>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Reward Points</span>
                                    <div className="flex items-center gap-1.5 text-gold-metallic">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span className="text-lg font-black italic">
                                            +{product.pointsReward.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleStatus(product)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all h-auto",
                                        product.isActive
                                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                                            : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:bg-zinc-700"
                                    )}
                                >
                                    {product.isActive ? (
                                        <><Eye className="w-3" /> ACTIVE</>
                                    ) : (
                                        <><EyeOff className="w-3" /> INACTIVE</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Overlay */}
            {(isAddModalOpen || editingProduct) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg p-8 rounded-3xl bg-charcoal-900 border border-gold-metallic/30 shadow-2xl shadow-gold-metallic/10 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-metallic to-transparent" />

                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-white italic">
                                {editingProduct ? "EDIT PRODUK" : "TAMBAH PRODUK BARU"}
                            </h3>
                            <Button
                                onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                                variant="ghost"
                                size="sm"
                                className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all h-auto"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Nama Produk</label>
                                <Input
                                    placeholder="Contoh: Asuransi Jiwa Sultan"
                                    value={productFormData.name}
                                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                                    className="h-14 rounded-2xl bg-charcoal-800/50 border-white/5 text-white placeholder:text-zinc-600 focus:border-gold-metallic/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Deskripsi Produk</label>
                                <textarea
                                    placeholder="Berikan detail produk..."
                                    value={productFormData.description}
                                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                                    className="w-full bg-charcoal-800/50 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold-metallic/50 transition-all min-h-[80px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Poin Reward</label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={productFormData.pointsReward || ""}
                                        onChange={(e) => setProductFormData({ ...productFormData, pointsReward: parseInt(e.target.value) || 0 })}
                                        className="h-14 rounded-2xl bg-charcoal-800/50 border-white/5 text-white placeholder:text-zinc-600 focus:border-gold-metallic/50 pl-12"
                                        icon={<Sparkles className="w-4 h-4 text-gold-metallic" />}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Visibility Status</label>
                                    <Button
                                        variant="ghost"
                                        size="md"
                                        onClick={() => setProductFormData({ ...productFormData, isActive: !productFormData.isActive })}
                                        className={cn(
                                            "w-full h-14 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-2",
                                            productFormData.isActive
                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                                                : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:bg-zinc-700"
                                        )}
                                    >
                                        {productFormData.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        {productFormData.isActive ? "ACTIVE" : "INACTIVE"}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Media URL (Opsional)</label>
                                <div className="flex gap-4">
                                    <Input
                                        placeholder="https://..."
                                        value={productFormData.mediaUrl}
                                        onChange={(e) => setProductFormData({ ...productFormData, mediaUrl: e.target.value })}
                                        className="h-14 rounded-2xl bg-charcoal-800/50 border-white/5 text-white placeholder:text-zinc-600 focus:border-gold-metallic/50 pl-12 text-xs font-mono"
                                        icon={<ImageIcon className="w-4 h-4 text-zinc-500" />}
                                    />

                                    {productFormData.mediaUrl && (
                                        <div className="w-14 h-14 rounded-2xl border border-white/5 bg-charcoal-800/50 overflow-hidden flex-shrink-0 relative group">
                                            <img
                                                src={productFormData.mediaUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://placehold.co/100x100/1a1a1a/gold?text=Error";
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                isLoading={isCreating || isUpdating}
                                className="w-full h-16 bg-gold-metallic text-charcoal-950 font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-gold-metallic/20 mt-4 border-transparent"
                            >
                                <CheckCircle2 className="w-6 h-6" />
                                <span>{editingProduct ? "SIMPAN PERUBAHAN" : "SIMPAN PRODUK"}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

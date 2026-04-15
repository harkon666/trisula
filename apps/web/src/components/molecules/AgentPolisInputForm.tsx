"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAgentReferrals } from "@/src/hooks/useAgentDashboard";
import { FileText, CreditCard, User, AlertCircle } from "lucide-react";
import { Button, Input } from "@/src/components/atoms";
import { toast } from "sonner";
import api from "@/src/lib/api-client";
import { useMutation } from "@tanstack/react-query";

const AgentPolisSchema = z.object({
    polisNumber: z.string().min(3, "Nomor polis minimal 3 karakter"),
    nasabahId: z.string().uuid("Pilih Nasabah"),
    premiumAmount: z.number().int().positive("Premi harus angka positif"),
    productName: z.string().min(1, "Nama produk wajib diisi"),
});

type PolisFormValues = z.infer<typeof AgentPolisSchema>;

export function AgentPolisInputForm() {
    const { data: referrals } = useAgentReferrals();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        control,
        formState: { errors }
    } = useForm<PolisFormValues>({
        resolver: zodResolver(AgentPolisSchema),
        defaultValues: {
            premiumAmount: 0,
            productName: "",
        }
    });

    const premiumAmount = watch("premiumAmount");
    const estimatedPoints = Math.floor(premiumAmount / 1000);

    const submitMutation = useMutation({
        mutationFn: async (data: PolisFormValues) => {
            const res = await api.post("/v1/polis/agent-input", data);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Polis berhasil diinput dan menunggu persetujuan admin");
            reset();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal input polis");
        },
    });

    const onSubmit = (data: PolisFormValues) => {
        submitMutation.mutate(data);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-trisula-500/20 bg-charcoal-900/40 backdrop-blur-md p-8 shadow-2xl">
                {/* Decorative background */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-trisula-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-trisula-500/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-trisula-500/20 to-trisula-600/10 border border-trisula-500/20 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-trisula-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Input Polis Sold</h2>
                            <p className="text-sm text-zinc-500">Catat penjualan polis yang sudah deal di luar sistem</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Polis Number */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-trisula-500/70 uppercase tracking-widest ml-1">Nomor Polis</label>
                            <Input
                                {...register("polisNumber")}
                                placeholder="TRSL-XXXX-XXXX"
                                className="h-14 bg-charcoal-800/50 border-white/5 rounded-2xl pl-12 focus:border-trisula-500/50"
                                icon={<FileText className="w-5 h-5 text-zinc-500 group-focus-within:text-trisula-500" />}
                                error={!!errors.polisNumber}
                            />
                            {errors.polisNumber && <p className="text-xs text-red-500 ml-1">{errors.polisNumber.message}</p>}
                        </div>

                        {/* Nasabah Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-trisula-500/70 uppercase tracking-widest ml-1">Pilih Nasabah</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-trisula-500 transition-colors" />
                                <select
                                    {...register("nasabahId")}
                                    className="w-full bg-charcoal-800/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white appearance-none focus:outline-none focus:border-trisula-500/50 focus:ring-1 focus:ring-trisula-500/20 transition-all"
                                >
                                    <option value="" className="bg-charcoal-900">-- Pilih Nasabah --</option>
                                    {referrals?.map(r => (
                                        <option key={r.id} value={r.id} className="bg-charcoal-900">
                                            {r.fullName} ({r.userId})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {errors.nasabahId && <p className="text-xs text-red-500 ml-1">{errors.nasabahId.message}</p>}
                        </div>

                        {/* Product Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-trisula-500/70 uppercase tracking-widest ml-1">Nama Produk / Asuransi</label>
                            <Input
                                {...register("productName")}
                                placeholder="Contoh: Asuransi Jiwa Premium"
                                className="h-14 bg-charcoal-800/50 border-white/5 rounded-2xl pl-12 focus:border-trisula-500/50"
                                icon={<AlertCircle className="w-5 h-5 text-zinc-500 group-focus-within:text-trisula-500" />}
                                error={!!errors.productName}
                            />
                            {errors.productName && <p className="text-xs text-red-500 ml-1">{errors.productName.message}</p>}
                        </div>

                        {/* Premium Amount */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-trisula-500/70 uppercase tracking-widest ml-1">Nominal Premi (Rp)</label>
                            <div className="relative group">
                                <Controller
                                    name="premiumAmount"
                                    control={control}
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            placeholder="Contoh: 10.000.000"
                                            value={value === 0 ? "" : value.toLocaleString("id-ID")}
                                            onChange={(e) => {
                                                const rawValue = e.target.value.replace(/\D/g, "");
                                                onChange(rawValue === "" ? 0 : parseInt(rawValue, 10));
                                            }}
                                            className="w-full h-14 bg-charcoal-800/50 border border-white/5 rounded-2xl pl-12 pr-20 font-mono text-white focus:outline-none focus:border-trisula-500/50 transition-all"
                                        />
                                    )}
                                />
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-trisula-500/10 border border-trisula-500/20 z-10">
                                    <span className="text-[10px] font-black text-trisula-400 uppercase">
                                        {estimatedPoints.toLocaleString("id-ID")} PTS
                                    </span>
                                </div>
                            </div>
                            {errors.premiumAmount && <p className="text-xs text-red-500 ml-1">{errors.premiumAmount.message}</p>}
                        </div>

                        {/* Info Box */}
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                            <p className="text-xs text-amber-400 leading-relaxed">
                                <strong>Catatan:</strong> Polis yang diinput akan menunggu persetujuan admin. Setelah disetujui, point akan otomatis masuk ke rekening nasabah.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            isLoading={submitMutation.isPending}
                            className="w-full h-16 bg-gradient-to-r from-trisula-500 to-trisula-600 text-midnight-950 font-black rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-trisula-500/20 border-transparent gap-3"
                        >
                            Kirim untuk Persetujuan
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
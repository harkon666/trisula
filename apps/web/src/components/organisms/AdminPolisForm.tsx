"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminUsers } from "@/src/hooks/useAdminUsers";
import { useAdminPolis } from "@/src/hooks/useAdminPolis";
import {
    FileText,
    User,
    Users,
    CreditCard,
    ShieldCheck,
    Coins,
    ArrowRight,
    Loader2
} from "lucide-react";
import { Button, Input } from "@/src/components/atoms";

const PolisSchema = z.object({
    polisNumber: z.string().min(3, "Nomor polis minimal 3 karakter"),
    nasabahId: z.string().uuid("Pilih Nasabah"),
    agentId: z.string().uuid("Pilih Agent"),
    premiumAmount: z.number().int().positive("Premi harus angka positif"),
});

type PolisFormValues = z.infer<typeof PolisSchema>;

export function AdminPolisForm() {
    const { data: nasabahs, isLoading: loadingNasabah } = useAdminUsers("nasabah");
    const { data: agents, isLoading: loadingAgent } = useAdminUsers("agent");
    const { submitPolis, isSubmitting } = useAdminPolis();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        control,
        formState: { errors }
    } = useForm<PolisFormValues>({
        resolver: zodResolver(PolisSchema),
        defaultValues: {
            premiumAmount: 0,
        }
    });

    const premiumAmount = watch("premiumAmount");
    const estimatedPoints = Math.floor(premiumAmount / 1000);

    const onSubmit = (data: PolisFormValues) => {
        submitPolis(data, {
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-charcoal-900/40 backdrop-blur-md p-8 shadow-2xl">
                {/* Decorative background Elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-metallic/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-royal-blue/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-metallic/20 to-gold-dark/10 border border-gold-metallic/20 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-gold-metallic" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Input Data Polis</h2>
                            <p className="text-sm text-zinc-500">Kaitkan polis baru dan injeksi poin secara otomatis.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Polis Number */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gold-metallic/70 uppercase tracking-widest ml-1">Nomor Polis</label>
                            <Input
                                {...register("polisNumber")}
                                placeholder="TRSL-XXXX-XXXX"
                                className="h-14 bg-charcoal-800/50 border-white/5 rounded-2xl pl-12 focus:border-gold-metallic/50"
                                icon={<FileText className="w-5 h-5 text-zinc-500 group-focus-within:text-gold-metallic" />}
                                error={!!errors.polisNumber}
                            />
                            {errors.polisNumber && <p className="text-xs text-red-500 ml-1">{errors.polisNumber.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nasabah Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gold-metallic/70 uppercase tracking-widest ml-1">Pilih Nasabah</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-gold-metallic transition-colors" />
                                    <select
                                        {...register("nasabahId")}
                                        className="w-full bg-charcoal-800/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white appearance-none focus:outline-none focus:border-gold-metallic/50 focus:ring-1 focus:ring-gold-metallic/20 transition-all"
                                    >
                                        <option value="" className="bg-charcoal-900">-- Pilih Nasabah --</option>
                                        {nasabahs?.map(n => (
                                            <option key={n.id} value={n.id} className="bg-charcoal-900">
                                                {n.fullName || n.userId}
                                            </option>
                                        ))}
                                    </select>
                                    {loadingNasabah && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-metallic animate-spin" />}
                                </div>
                                {errors.nasabahId && <p className="text-xs text-red-500 ml-1">{errors.nasabahId.message}</p>}
                            </div>

                            {/* Agent Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gold-metallic/70 uppercase tracking-widest ml-1">Pilih Agent</label>
                                <div className="relative group">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-gold-metallic transition-colors" />
                                    <select
                                        {...register("agentId")}
                                        className="w-full bg-charcoal-800/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white appearance-none focus:outline-none focus:border-gold-metallic/50 focus:ring-1 focus:ring-gold-metallic/20 transition-all"
                                    >
                                        <option value="" className="bg-charcoal-900">-- Pilih Agent --</option>
                                        {agents?.map(a => (
                                            <option key={a.id} value={a.id} className="bg-charcoal-900">
                                                {a.fullName || a.userId}
                                            </option>
                                        ))}
                                    </select>
                                    {loadingAgent && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-metallic animate-spin" />}
                                </div>
                                {errors.agentId && <p className="text-xs text-red-500 ml-1">{errors.agentId.message}</p>}
                            </div>
                        </div>

                        {/* Premium Amount */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gold-metallic/70 uppercase tracking-widest ml-1">Nominal Premi (Rp)</label>
                            <div className="relative group">
                                <Controller
                                    name="premiumAmount"
                                    control={control}
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Contoh: 10.000.000"
                                            value={value === 0 ? "" : value.toLocaleString("id-ID")}
                                            onChange={(e) => {
                                                const rawValue = e.target.value.replace(/\D/g, "");
                                                onChange(rawValue === "" ? 0 : parseInt(rawValue, 10));
                                            }}
                                            className="h-14 bg-charcoal-800/50 border-white/5 rounded-2xl pl-12 font-mono focus:border-gold-metallic/50"
                                            icon={<CreditCard className="w-5 h-5 text-zinc-500 group-focus-within:text-gold-metallic" />}
                                            error={!!errors.premiumAmount}
                                        />
                                    )}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-metallic/10 border border-gold-metallic/20 z-10">
                                    <Coins className="w-3.5 h-3.5 text-gold-metallic" />
                                    <span className="text-[10px] font-black text-gold-metallic uppercase">
                                        {estimatedPoints.toLocaleString("id-ID")} PTS
                                    </span>
                                </div>
                            </div>
                            {errors.premiumAmount && <p className="text-xs text-red-500 ml-1">{errors.premiumAmount.message}</p>}
                        </div>

                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            className="w-full h-16 bg-gold-metallic text-charcoal-950 font-black rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-gold-metallic/20 border-transparent gap-3"
                        >
                            <span className="uppercase tracking-widest">Simpan & Inject Poin</span>
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

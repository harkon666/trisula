"use client";

import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConnectWallet from "../../../components/ConnectWallet";

interface CatalogItem {
    id: number;
    name: string;
    pointsRequired: number;
    description?: string;
    isActive: boolean;
}

interface RedemptionRequest {
    id: string;
    itemName: string;
    pointsUsed: number;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    createdAt: string;
    onchainTx?: string;
}

export default function RedeemPage() {
    const account = useActiveAccount();
    const router = useRouter();
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [myRequests, setMyRequests] = useState<RedemptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [userPoints, setUserPoints] = useState(0);
    const [whatsapp, setWhatsapp] = useState("");
    const [useRegisteredPhone, setUseRegisteredPhone] = useState(true);
    const [registeredPhone, setRegisteredPhone] = useState("");
    const [userId, setUserId] = useState<string | null>(null);

    // Fetch All Data
    const fetchData = async () => {
        if (!account) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

            // 1. Fetch Profile (ID & Points)
            const profileRes = await fetch(`${apiUrl}/api/v1/user/profile?walletAddress=${account.address}`);
            const profileJson = await profileRes.json();
            if (profileJson.success) {
                setUserId(profileJson.data.id);
                setUserPoints(profileJson.data.points);
            }

            // 2. Fetch Catalog
            const catalogRes = await fetch(`${apiUrl}/api/v1/redeem/catalog`);
            const catalogJson = await catalogRes.json();
            if (catalogJson.success) {
                setCatalog(catalogJson.data);
            }

            // 3. Fetch My Requests if we have ID
            if (profileJson.data?.id) {
                const requestsRes = await fetch(`${apiUrl}/api/v1/redeem/my-requests?userId=${profileJson.data.id}`);
                const requestsJson = await requestsRes.json();
                if (requestsJson.success) {
                    setMyRequests(requestsJson.data);
                }
            }

        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [account]);

    const handleRedeem = async (item: CatalogItem) => {
        if (!account || !userId) return;

        const finalWhatsapp = useRegisteredPhone ? registeredPhone : whatsapp;

        if (!finalWhatsapp || finalWhatsapp.length < 10) {
            setMessage({ type: 'error', text: "Mohon masukkan nomor WhatsApp yang valid!" });
            return;
        }
        if (userPoints < item.pointsRequired) {
            setMessage({ type: 'error', text: "Poin Anda tidak mencukupi!" });
            return;
        }

        const confirm = window.confirm(`Redeem ${item.name} for ${item.pointsRequired} points?`);
        if (!confirm) return;

        setProcessing(item.id);
        setMessage(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

            const response = await fetch(`${apiUrl}/api/v1/redeem/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    catalogId: item.id,
                    whatsappNumber: finalWhatsapp,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: "Redeem berhasil! Admin akan segera memproses permintaan Anda." });
                setUserPoints(prev => prev - item.pointsRequired);
                fetchData(); // Refresh history
            } else {
                setMessage({ type: 'error', text: result.message || "Gagal redeem." });
            }

        } catch (error) {
            setMessage({ type: 'error', text: "Terjadi kesalahan sistem." });
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-500 animate-pulse">Loading Rewards...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-zinc-400 hover:text-white mb-2 flex items-center gap-2 transition-colors"
                        >
                            ← Back to Dashboard
                        </button>
                        <h1 className="text-4xl font-bold text-white">Reward Catalog</h1>
                        <p className="text-zinc-400">Tukarkan poin Anda dengan hadiah eksklusif.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-end">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Your Balance</p>
                        <p className="text-3xl font-bold text-amber-500">{userPoints.toLocaleString()} Pts</p>
                    </div>
                </header>

                <div className="mb-12 max-w-md bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold mb-4">Informasi Kontak</h3>

                    {registeredPhone && (
                        <div className="mb-4">
                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                                <input
                                    type="radio"
                                    checked={useRegisteredPhone}
                                    onChange={() => setUseRegisteredPhone(true)}
                                    className="w-5 h-5 text-amber-500 focus:ring-amber-500"
                                />
                                <div>
                                    <span className="block font-medium text-white">Gunakan Nomor Terdaftar</span>
                                    <span className="block text-sm text-zinc-500">{registeredPhone}</span>
                                </div>
                            </label>
                        </div>
                    )}

                    <div className="mb-2">
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                            <input
                                type="radio"
                                checked={!useRegisteredPhone}
                                onChange={() => setUseRegisteredPhone(false)}
                                className="w-5 h-5 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="font-medium text-white">Gunakan Nomor WhatsApp Lain</span>
                        </label>
                    </div>

                    {!useRegisteredPhone && (
                        <div className="ml-2 mt-2 pl-6 border-l-2 border-white/10">
                            <input
                                type="tel"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="Contoh: 08123456789"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500 outline-none transition-all"
                            />
                        </div>
                    )}

                    <p className="text-xs text-zinc-600 mt-4 italic">*Admin akan menghubungi nomor ini untuk proses pengiriman hadiah.</p>
                </div>

                {message && (
                    <div className={`mb-8 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {catalog.length === 0 ? (
                        <div className="col-span-3 text-center py-20 text-zinc-500 bg-white/5 rounded-3xl border border-white/5">
                            Belum ada reward yang tersedia saat ini.
                        </div>
                    ) : (
                        catalog.map((item) => (
                            <div key={item.id} className="bg-white/5 border border-white/10 hover:border-amber-500/50 transition-all rounded-3xl p-6 flex flex-col group">
                                <div className="bg-zinc-900 w-full h-40 rounded-2xl mb-6 flex items-center justify-center text-zinc-700 text-4xl">
                                    🎁
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                                <p className="text-zinc-400 text-sm mb-4 flex-grow">{item.description}</p>
                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-amber-400 font-bold">{item.pointsRequired.toLocaleString()} Pts</span>
                                    <button
                                        onClick={() => handleRedeem(item)}
                                        disabled={userPoints < item.pointsRequired || processing === item.id}
                                        className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {processing === item.id ? "Processing..." : "Redeem"}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* History Section */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                        Status Penukaran Hadiah
                    </h2>

                    {myRequests.length === 0 ? (
                        <p className="text-zinc-500 italic">Belum ada riwayat penukaran hadiah.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-zinc-500 text-sm">
                                    <tr className="border-b border-white/5">
                                        <th className="pb-4 font-medium">Tanggal</th>
                                        <th className="pb-4 font-medium">Hadiah</th>
                                        <th className="pb-4 font-medium">Status</th>
                                        <th className="pb-4 font-medium text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myRequests.map((req) => (
                                        <tr key={req.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-4 text-zinc-400 text-sm">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 font-medium text-white">
                                                {req.itemName}
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold border ${req.status === 'completed' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                                                    req.status === 'rejected' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                                                        'bg-amber-500/20 border-amber-500/30 text-amber-400'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right font-bold text-zinc-400">
                                                -{req.pointsUsed}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

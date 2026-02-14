"use client";

import { useAgentGrowthChart } from "@/src/hooks/useAgentDashboard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export const EarningsChart = () => {
    const { data: chartData, isLoading } = useAgentGrowthChart();

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-midnight-950 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md">
                    <p className="text-zinc-400 text-xs mb-1 font-mono">{label}</p>
                    <p className="text-trisula-400 font-bold text-sm">
                        +{payload[0].value} Nasabah
                    </p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return <div className="w-full h-[300px] bg-white/5 rounded-3xl animate-pulse" />;
    }

    return (
        <div className="w-full h-[350px] bg-gradient-to-b from-white/[0.03] to-transparent rounded-[2rem] border border-white/5 p-6 relative overflow-hidden group">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-trisula-500" />
                        Growth Analytics
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">New Referral Performance</p>
                </div>
                {/* Decoration */}
                <div className="px-3 py-1 bg-trisula-500/10 border border-trisula-500/20 rounded-full text-[10px] font-bold text-trisula-400 uppercase tracking-wider">
                    Monthly View
                </div>
            </div>

            {/* Chart */}
            <div className="w-full h-[250px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#EAB308"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorGrowth)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Background Flair */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-trisula-600/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-trisula-600/10 transition-colors duration-500" />
        </div>
    );
};

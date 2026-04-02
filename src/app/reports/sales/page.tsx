"use client";

import { useState, useEffect } from "react";
import { reportService } from "@/services/reportService";
import { Loader2, TrendingUp, PackageSearch, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#84cc16", "#10b981"];

const CustomTooltipStyle = {
    borderRadius: "12px",
    border: "1px solid rgba(99,102,241,0.15)",
    background: "rgba(15,23,42,0.92)",
    color: "#f1f5f9",
    boxShadow: "0 20px 40px -12px rgba(0,0,0,0.4)",
    backdropFilter: "blur(12px)",
    fontSize: "12px",
    fontWeight: 700,
    padding: "10px 16px",
};

const RangeSelect = ({ value, onChange }: { value: number | "custom"; onChange: (v: number | "custom") => void }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value === "custom" ? "custom" : Number(e.target.value))}
        className="h-9 px-3 rounded-[var(--ui-radius-md)] border border-slate-200 bg-slate-50 text-[11px] font-black text-slate-600 uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
    >
        <option value={7}>Last 7 Days</option>
        <option value={30}>Last 30 Days</option>
        <option value={90}>Last 90 Days</option>
        <option value={365}>Last Year</option>
        <option value="custom">Custom Range</option>
    </select>
);

export default function SalesReportPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState<number | "custom">(30);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

    useEffect(() => {
        async function fetchSales() {
            setLoading(true);
            try {
                const result = days === "custom"
                    ? await reportService.fetchDetailedSalesStats(0, startDate, endDate)
                    : await reportService.fetchDetailedSalesStats(days);
                setData(result);
            } catch (error) {
                console.error("Error fetching sales reports:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSales();
    }, [days, startDate, endDate]);

    if (loading) return (
        <div className="h-full flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center gap-3 opacity-40">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Sales Data...</span>
            </div>
        </div>
    );

    if (!data) return null;

    return (
        <div className="space-y-4">

            {/* ── Filter bar ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 glass rounded-[var(--ui-radius-xl)] border border-primary/5 px-5 py-3 shadow-glass">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Filter Period</p>
                <div className="flex items-center gap-2 flex-wrap">
                    {days === "custom" && (
                        <>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                className="h-9 px-3 rounded-[var(--ui-radius-md)] border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 focus:ring-2 focus:ring-primary/20 outline-none" />
                            <span className="text-[10px] font-black text-slate-300 uppercase">to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                                className="h-9 px-3 rounded-[var(--ui-radius-md)] border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 focus:ring-2 focus:ring-primary/20 outline-none" />
                        </>
                    )}
                    <RangeSelect value={days} onChange={setDays} />
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { label: "Total Orders", value: data.totalOrders, icon: <TrendingUp size={18} strokeWidth={2.5} />, color: "text-primary", bg: "bg-primary/10 text-primary", accent: "from-primary/5" },
                    { label: "Items Sold", value: data.totalSoldItems, icon: <PackageSearch size={18} strokeWidth={2.5} />, color: "text-orange-500", bg: "bg-orange-500/10 text-orange-500", accent: "from-orange-500/5" },
                ].map(({ label, value, icon, bg, accent }) => (
                    <div key={label} className={`relative overflow-hidden glass rounded-[var(--ui-radius-xl)] border border-primary/5 shadow-glass p-5`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${accent} to-transparent`} />
                        <div className="relative flex items-center gap-4">
                            <div className={`p-3 rounded-[var(--ui-radius-lg)] ${bg} shadow-inner shrink-0`}>{icon}</div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                                <h3 className="text-3xl font-black italic text-slate-800 tracking-tighter leading-none">{value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Bar chart ── */}
            <div className="glass rounded-[var(--ui-radius-xl)] border border-primary/5 shadow-glass overflow-hidden">
                <div className="px-5 py-4 border-b border-primary/5 bg-primary/[0.02] flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-[var(--ui-radius-md)] text-primary">
                        <BarChart2 size={14} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-[12px] font-black text-slate-800 uppercase italic tracking-tight leading-none">Top Selling Products</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ranked by quantity sold</p>
                    </div>
                </div>
                <div className="p-5 h-[360px]">
                    {data.topSellingProducts.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topSellingProducts} margin={{ left: -20, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
                                    angle={-40} textAnchor="end" interval={0} height={70} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                                <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
                                <Bar dataKey="qty" radius={[8, 8, 0, 0]} maxBarSize={48}>
                                    {data.topSellingProducts.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center opacity-30">
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">No sales data for this period</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Performance table ── */}
            <div className="glass rounded-[var(--ui-radius-xl)] border border-primary/5 shadow-glass overflow-hidden">
                <div className="px-5 py-4 border-b border-primary/5 bg-primary/[0.02]">
                    <h3 className="text-[12px] font-black text-slate-800 uppercase italic tracking-tight leading-none">Product Performance</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Revenue breakdown by product</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="border-b border-primary/5 bg-primary/[0.02]">
                            <tr>
                                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">#</th>
                                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Units</th>
                                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {data.topSellingProducts.map((product: any, idx: number) => (
                                <tr key={idx} className="hover:bg-primary/[0.02] transition-colors">
                                    <td className="px-5 py-3 text-[10px] font-black text-slate-400">{String(idx + 1).padStart(2, "0")}</td>
                                    <td className="px-5 py-3 text-[12px] font-bold text-slate-700">{product.name}</td>
                                    <td className="px-5 py-3">
                                        <span className="text-[11px] font-black text-slate-500">{product.qty} <span className="text-slate-300">units</span></span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <span className="text-[12px] font-black italic text-emerald-600">${product.revenue.toFixed(2)}</span>
                                    </td>
                                </tr>
                            ))}
                            {data.topSellingProducts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-5 py-10 text-center text-[11px] font-black uppercase tracking-widest text-slate-300">
                                        No sales data found for the selected period
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

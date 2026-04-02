"use client";

import { useState, useEffect } from "react";
import { reportService } from "@/services/reportService";
import { Loader2, Package, AlertTriangle, Briefcase, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#d946ef", "#f43f5e", "#f97316"];

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

export default function StockReportPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStock() {
            setLoading(true);
            try {
                const result = await reportService.fetchStockStats();
                setData(result);
            } catch (error) {
                console.error("Error fetching stock reports:", error);
            } finally { setLoading(false); }
        }
        fetchStock();
    }, []);

    if (loading) return (
        <div className="h-full flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center gap-3 opacity-40">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Stock Intelligence...</span>
            </div>
        </div>
    );
    if (!data) return null;

    const kpis = [
        { label: "SKUs in Stock", value: data.totalItems, icon: <Package size={16} strokeWidth={2.5} />, colorClass: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
        { label: "Inventory Value", value: `$${data.totalStockValue.toFixed(2)}`, icon: <Briefcase size={16} strokeWidth={2.5} />, colorClass: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-200/50" },
        { label: "Retail Potential", value: `$${data.totalRetailValue.toFixed(2)}`, icon: <Activity size={16} strokeWidth={2.5} />, colorClass: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-200/50" },
        { label: "Low Stock Alerts", value: data.lowStockCount, icon: <AlertTriangle size={16} strokeWidth={2.5} />, colorClass: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-200/50" },
    ];

    return (
        <div className="space-y-4">

            {/* ── KPI Grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(({ label, value, icon, colorClass, bg, border }) => (
                    <div key={label} className={`glass rounded-[var(--ui-radius-xl)] border ${border} shadow-glass p-5 group hover:shadow-lg transition-shadow`}>
                        <div className="flex items-start justify-between mb-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight max-w-[80px]">{label}</p>
                            <div className={`p-2 rounded-[var(--ui-radius-md)] ${bg} ${colorClass} group-hover:scale-110 transition-transform shrink-0`}>
                                {icon}
                            </div>
                        </div>
                        <h3 className={`text-2xl font-black italic tracking-tighter leading-none ${colorClass}`}>{value}</h3>
                    </div>
                ))}
            </div>

            {/* ── Donut + Low Stock ── */}
            <div className="grid gap-4 lg:grid-cols-3">

                {/* Pie Chart */}
                <div className="glass rounded-[var(--ui-radius-xl)] border border-primary/5 shadow-glass overflow-hidden lg:col-span-1">
                    <div className="px-5 py-4 border-b border-primary/5 bg-primary/[0.02]">
                        <h3 className="text-[12px] font-black text-slate-800 uppercase italic tracking-tight leading-none">Category Distribution</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Top categories by quantity</p>
                    </div>
                    <div className="p-4 h-[300px]">
                        {data.categoryDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={data.categoryDistribution} cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={88} paddingAngle={4} dataKey="value">
                                        {data.categoryDistribution.map((_: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={CustomTooltipStyle} />
                                    <Legend iconType="circle" iconSize={8}
                                        formatter={(value) => <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center opacity-30">
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">No category data</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Low Stock alerts table */}
                <div className="glass rounded-[var(--ui-radius-xl)] border border-amber-200/40 shadow-glass overflow-hidden lg:col-span-2">
                    <div className="px-5 py-4 border-b border-amber-100/60 bg-amber-50/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-[var(--ui-radius-md)] text-amber-500">
                                <AlertTriangle size={14} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-black text-slate-800 uppercase italic tracking-tight leading-none">Action Required — Low Stock</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Products running below minimum threshold</p>
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-amber-500/10 text-amber-600 text-[9px] font-black rounded-[var(--ui-radius-md)] uppercase tracking-widest">
                            {data.lowStockCount} Items
                        </span>
                    </div>
                    <div className="overflow-y-auto max-h-[260px] custom-scrollbar">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="border-b border-primary/5 bg-primary/[0.02] sticky top-0 z-10">
                                <tr>
                                    <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Min</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {data.topLowStock.map((product: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-5 py-3 text-[12px] font-bold text-slate-700">{product.name}</td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-[var(--ui-radius-sm)] uppercase tracking-wider">
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center text-[11px] font-bold text-slate-400">{product.min_stock}</td>
                                    </tr>
                                ))}
                                {data.topLowStock.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-10 text-center text-[11px] font-black uppercase tracking-widest text-slate-300">
                                            All stocked up — no low alerts ✓
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Out of Stock — Dark card ── */}
            <div className="relative overflow-hidden rounded-[var(--ui-radius-xl)] bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-950 border border-white/10 shadow-2xl shadow-slate-900/30">
                <div className="absolute -top-20 right-1/3 w-56 h-56 rounded-full bg-rose-500/10 blur-3xl" />

                <div className="relative px-6 py-5 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-[13px] font-black text-white uppercase italic tracking-tight">Out of Stock Inventory</h3>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Products with exactly zero stock — lost revenue</p>
                    </div>
                    <span className="px-3 py-1 bg-rose-500/20 text-rose-400 text-[9px] font-black rounded-[var(--ui-radius-md)] uppercase tracking-widest border border-rose-500/20">
                        {data.outOfStockCount} Items
                    </span>
                </div>

                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="border-b border-white/5">
                            <tr>
                                <th className="px-6 py-3 text-[9px] font-black text-white/30 uppercase tracking-widest">#</th>
                                <th className="px-6 py-3 text-[9px] font-black text-white/30 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-3 text-[9px] font-black text-white/30 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-3 text-[9px] font-black text-white/30 uppercase tracking-widest text-right">Lost Rev / Unit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.topOutOfStock.map((product: any, idx: number) => (
                                <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                                    <td className="px-6 py-3 text-[10px] font-black text-white/20">{String(idx + 1).padStart(2, "0")}</td>
                                    <td className="px-6 py-3 text-[12px] font-bold text-white/80">{product.name}</td>
                                    <td className="px-6 py-3 text-[11px] font-semibold text-white/40">{product.product_categories?.name || "Uncategorized"}</td>
                                    <td className="px-6 py-3 text-right">
                                        <span className="text-[12px] font-black italic text-rose-400">${product.price}</span>
                                    </td>
                                </tr>
                            ))}
                            {data.topOutOfStock.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-[11px] font-black uppercase tracking-widest text-white/20">
                                        No out of stock products found
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

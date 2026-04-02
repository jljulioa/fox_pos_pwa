"use client";

import { useState, useEffect } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { Download, Calendar, TrendingUp, ArrowUpRight, Loader2, DollarSign } from "lucide-react";
import { reportService } from "@/services/reportService";
import { cn } from "@/lib/utils";

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];

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

export default function ReportsPage() {
    const [salesData, setSalesData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => { fetchReportData(); }, []);

    async function fetchReportData() {
        setLoading(true);
        try {
            const { data: sales } = await reportService.fetchSalesData();
            if (sales) {
                const total = sales.reduce((acc: number, s: any) => acc + Number(s.total_amount), 0);
                setTotalRevenue(total);
                const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const grouped = sales.reduce((acc: any, sale: any) => {
                    const day = days[new Date(sale.date).getDay()];
                    acc[day] = (acc[day] || 0) + Number(sale.total_amount);
                    return acc;
                }, {});
                setSalesData(days.map(day => ({ name: day, sales: grouped[day] || 0 })));
            }

            const { data: categorySales } = await reportService.fetchCategorySalesData();
            if (categorySales) {
                const groupedCat = categorySales.reduce((acc: any, item: any) => {
                    const catName = item.products?.product_categories?.name || "Uncategorized";
                    acc[catName] = (acc[catName] || 0) + Number(item.total_price);
                    return acc;
                }, {});
                setCategoryData(
                    Object.keys(groupedCat).map((key, i) => ({
                        name: key, value: groupedCat[key],
                        color: CHART_COLORS[i % CHART_COLORS.length]
                    }))
                );
            }
        } catch (err) {
            console.error("Error fetching reports:", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center gap-3 opacity-40">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Analytics...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* ── KPI Strip ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Revenue KPI — dark glass */}
                <div className="sm:col-span-2 relative overflow-hidden rounded-[var(--ui-radius-xl)] bg-gradient-to-br from-slate-900 via-primary/80 to-indigo-950 p-6 text-white shadow-2xl shadow-primary/20 border border-white/10">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.3)_0%,_transparent_60%)]" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50 mb-1">Total Revenue — All Time</p>
                        <h2 className="text-4xl font-black italic tracking-tighter leading-none">
                            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                        <div className="flex items-center gap-2 mt-3">
                            <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                <ArrowUpRight size={10} /> Live
                            </span>
                            <span className="text-[10px] text-white/40 font-semibold">Updated in real-time from closed transactions</span>
                        </div>
                    </div>
                    {/* Decorative orb */}
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-primary/20 blur-2xl" />
                </div>

                {/* Actions card */}
                <div className="flex flex-col gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 rounded-[var(--ui-radius-xl)] border border-slate-200 bg-white text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-primary/20 hover:text-primary transition-all shadow-sm px-4 py-3">
                        <Calendar size={14} strokeWidth={2.5} /> Last 7 Days
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 rounded-[var(--ui-radius-xl)] bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/25 px-4 py-3 italic">
                        <Download size={14} strokeWidth={2.5} /> Export Data
                    </button>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-[var(--ui-radius-xl)]">
                        <DollarSign size={14} className="text-primary" />
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg / Sale</p>
                            <p className="text-[13px] font-black italic text-slate-800">
                                ${salesData.length ? (totalRevenue / salesData.filter(d => d.sales > 0).length || 0).toFixed(0) : "–"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Charts ── */}
            <div className="grid gap-4 lg:grid-cols-2">

                {/* Line Chart — Weekly Revenue */}
                <div className="glass rounded-[var(--ui-radius-xl)] border border-primary/5 shadow-glass overflow-hidden">
                    <div className="px-5 py-4 border-b border-primary/5 bg-primary/[0.02] flex items-center justify-between">
                        <div>
                            <h3 className="text-[12px] font-black text-slate-800 uppercase italic tracking-tight">Weekly Revenue</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Sales volume by day of week</p>
                        </div>
                        <TrendingUp size={16} className="text-primary/40" />
                    </div>
                    <div className="p-5 h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <defs>
                                    <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                                <Tooltip contentStyle={CustomTooltipStyle} cursor={{ stroke: "rgba(99,102,241,0.15)", strokeWidth: 2, strokeDasharray: "4 4" }} />
                                <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3}
                                    dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                                    activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart — Category Sales */}
                <div className="glass rounded-[var(--ui-radius-xl)] border border-primary/5 shadow-glass overflow-hidden">
                    <div className="px-5 py-4 border-b border-primary/5 bg-primary/[0.02] flex items-center justify-between">
                        <div>
                            <h3 className="text-[12px] font-black text-slate-800 uppercase italic tracking-tight">Category Distribution</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Revenue by product category</p>
                        </div>
                        <div className="flex gap-1">
                            {CHART_COLORS.slice(0, 3).map(c => (
                                <span key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
                            ))}
                        </div>
                    </div>
                    <div className="p-5 h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical">
                                <CartesianGrid strokeDasharray="2 4" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false}
                                    tick={{ fill: "#475569", fontSize: 10, fontWeight: 600 }} width={90} />
                                <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

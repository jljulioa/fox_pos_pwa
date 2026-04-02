"use client";

import { useState, useEffect } from "react";
import { reportService } from "@/services/reportService";
import { Loader2, DollarSign, Wallet, Percent, MoveUpRight, MoveDownRight, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
    <select value={value}
        onChange={(e) => onChange(e.target.value === "custom" ? "custom" : Number(e.target.value))}
        className="h-9 px-3 rounded-[var(--ui-radius-md)] border border-slate-200 bg-slate-50 text-[11px] font-black text-slate-600 uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer">
        <option value={7}>Last 7 Days</option>
        <option value={30}>Last 30 Days</option>
        <option value={90}>Last 90 Days</option>
        <option value={365}>Last Year</option>
        <option value="custom">Custom Range</option>
    </select>
);

const kpis = (data: any) => [
    { label: "Total Revenue", value: `$${data.totalRevenue.toFixed(2)}`, icon: <DollarSign size={16} strokeWidth={2.5} />, colorClass: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-200/50" },
    { label: "Total Expenses", value: `$${data.totalExpenses.toFixed(2)}`, icon: <Wallet size={16} strokeWidth={2.5} />, colorClass: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-200/50" },
    {
        label: "Net Profit",
        value: `${data.netProfit >= 0 ? "" : "–"}$${Math.abs(data.netProfit).toFixed(2)}`,
        icon: data.netProfit >= 0 ? <MoveUpRight size={16} strokeWidth={2.5} /> : <MoveDownRight size={16} strokeWidth={2.5} />,
        colorClass: data.netProfit >= 0 ? "text-primary" : "text-rose-500",
        bg: data.netProfit >= 0 ? "bg-primary/10" : "bg-rose-500/10",
        border: data.netProfit >= 0 ? "border-primary/20" : "border-rose-200/50"
    },
    { label: "Profit Margin", value: `${data.margin.toFixed(1)}%`, icon: <Percent size={16} strokeWidth={2.5} />, colorClass: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-200/50" },
];

export default function FinancialReportPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState<number | "custom">(30);
    const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split("T")[0]; });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const result = days === "custom"
                    ? await reportService.fetchFinancialStats(0, startDate, endDate)
                    : await reportService.fetchFinancialStats(days);
                setData(result);
            } catch (error) {
                console.error("Error fetching financial reports:", error);
            } finally { setLoading(false); }
        }
        fetchData();
    }, [days, startDate, endDate]);

    if (loading) return (
        <div className="h-full flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center gap-3 opacity-40">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Financial Data...</span>
            </div>
        </div>
    );
    if (!data) return null;

    return (
        <div className="space-y-4">

            {/* ── Filter bar ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 glass rounded-[var(--ui-radius-xl)] border border-primary/5 px-5 py-3 shadow-glass">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Financial Summary</p>
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

            {/* ── KPI Grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis(data).map(({ label, value, icon, colorClass, bg, border }) => (
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

            {/* ── Dark Area Chart ── */}
            <div className="relative overflow-hidden rounded-[var(--ui-radius-xl)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-white/10 shadow-2xl shadow-slate-900/30">
                {/* Ambient glow */}
                <div className="absolute -top-24 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-24 right-1/4 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />

                {/* Header */}
                <div className="relative px-6 py-5 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-[13px] font-black text-white uppercase italic tracking-tight">Cash Flow Overview</h3>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Income vs Expenses — Day by Day</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Income
                        </div>
                        <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-black uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-rose-400" /> Expense
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="relative p-6 h-[360px]">
                    {data.dailyTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.dailyTrends} margin={{ left: -20, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false}
                                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700 }}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                    dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} />
                                <Tooltip contentStyle={CustomTooltipStyle}
                                    formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`]}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                                />
                                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gradIncome)" />
                                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#gradExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-[11px] font-black uppercase tracking-widest text-white/20">No financial data for this period</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

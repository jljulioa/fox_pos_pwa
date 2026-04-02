"use client";

import { useState, useEffect, useCallback } from "react";
import {
    DollarSign, Package, ShoppingCart, TrendingUp,
    AlertCircle, Loader2, RefreshCw, ArrowUpRight,
    ShoppingBag, Clock, ChevronRight, Wallet
} from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
interface UnpaidPurchase {
    id: string;
    invoice_number: string;
    supplier_name: string;
    total_amount: number;
    balance_due: number;
    payment_status: "unpaid" | "partial" | "paid";
    created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    unpaid: { label: "Unpaid", cls: "bg-rose-50 text-rose-600 border-rose-200" },
    partial: { label: "Partial", cls: "bg-amber-50 text-amber-600 border-amber-200" },
    paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Component ─────────────────────────────────────────────────────────────────
export default function Home() {
    const router = useRouter();

    const [cashFlowData, setCashFlowData] = useState<any[]>([]);
    const [stats, setStats] = useState([
        { label: "Total Revenue", value: "$0", icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
        { label: "Orders Count", value: "0", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-500/10" },
        { label: "Total Products", value: "0", icon: Package, color: "text-emerald-600", bg: "bg-emerald-500/10" },
        { label: "Avg. Ticket", value: "$0", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-500/10" },
    ]);
    const [stockAlerts, setStockAlerts] = useState<any[]>([]);
    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [unpaidPurchases, setUnpaidPurchases] = useState<UnpaidPurchase[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [dashData, purchasesResult] = await Promise.all([
                dashboardService.fetchDashboardData(),
                supabase
                    .from("purchases")
                    .select("id, invoice_number, supplier_name, total_amount, balance_due, payment_status, created_at")
                    .in("payment_status", ["unpaid", "partial"])
                    .order("created_at", { ascending: false })
            ]);

            setStats([
                { label: "Total Revenue", value: `$${dashData.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
                { label: "Orders Count", value: dashData.orderCount.toString(), icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-500/10" },
                { label: "Total Products", value: dashData.productCount.toString(), icon: Package, color: "text-emerald-600", bg: "bg-emerald-500/10" },
                { label: "Avg. Ticket", value: `$${dashData.avgTicket.toFixed(0)}`, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-500/10" },
            ]);
            setStockAlerts(dashData.stockAlerts);
            setRecentSales(dashData.recentSales);
            setCashFlowData(dashData.cashFlowData);
            setUnpaidPurchases((purchasesResult.data as UnpaidPurchase[]) || []);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 opacity-40">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Dashboard...</span>
                </div>
            </div>
        );
    }

    const totalOwed = unpaidPurchases.reduce((sum, p) => sum + Number(p.balance_due), 0);

    return (
        <div className="md:px-3 md:py-3 flex flex-col h-full gap-4 overflow-hidden md:bg-white rounded-[var(--sidebar-radius)] md:shadow-glass">

            {/* ── Header ── */}
            <header className="px-5 py-5 border-b border-primary/5 glass shrink-0 shadow-glass z-20 rounded-[var(--sidebar-radius)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-[var(--ui-radius-lg)] shadow-inner">
                        <TrendingUp size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase italic leading-none">
                            Store Insights
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic mt-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Live Performance Dashboard
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="w-9 h-9 flex items-center justify-center rounded-[var(--ui-radius-md)] bg-slate-50 border border-slate-200 text-slate-400 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
                    title="Refresh data"
                >
                    <RefreshCw size={15} strokeWidth={2.5} />
                </button>
            </header>

            {/* ── Scrollable body ── */}
            <main className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6 space-y-4 pt-1">

                {/* ── KPI Strip ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="glass rounded-[var(--ui-radius-xl)] border border-primary/5 shadow-glass p-5 group hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight max-w-[70px]">{stat.label}</p>
                                <div className={`p-2 rounded-[var(--ui-radius-md)] ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shrink-0`}>
                                    <stat.icon size={15} strokeWidth={2.5} />
                                </div>
                            </div>
                            <h3 className={`text-2xl font-black italic tracking-tighter leading-none ${stat.color}`}>{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* ── Main grid: chart + stock alerts ── */}
                <div className="grid gap-4 lg:grid-cols-3">

                    {/* Cash Flow Chart */}
                    <div className="lg:col-span-2 glass rounded-[var(--ui-radius-xl)] border border-primary/5 shadow-glass overflow-hidden">
                        <div className="px-5 py-4 border-b border-primary/5 bg-primary/[0.02] flex items-center justify-between">
                            <div>
                                <h2 className="text-[12px] font-black text-slate-800 uppercase italic tracking-tight leading-none">Cash Flow Analysis</h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Weekly revenue vs expenses</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-widest">
                                    <span className="w-2 h-2 rounded-full bg-primary" />Revenue
                                </span>
                                <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />Expenses
                                </span>
                            </div>
                        </div>
                        <div className="p-5 h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cashFlowData} barGap={6}>
                                    <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false}
                                        tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} dy={8} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: "rgba(99,102,241,0.04)" }}
                                        contentStyle={{
                                            borderRadius: "12px", border: "1px solid rgba(99,102,241,0.1)",
                                            boxShadow: "0 10px 30px rgba(0,0,0,0.08)", padding: "10px 14px",
                                            fontSize: "12px", fontWeight: 700
                                        }}
                                    />
                                    <Bar dataKey="income" fill="var(--primary)" radius={[8, 8, 4, 4]} barSize={16} />
                                    <Bar dataKey="expense" fill="#10b981" radius={[8, 8, 4, 4]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="glass rounded-[var(--ui-radius-xl)] border border-primary/5 shadow-glass overflow-hidden flex flex-col">
                        <div className="px-5 py-4 border-b border-primary/5 bg-primary/[0.02] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-rose-500/10 rounded-[var(--ui-radius-md)] text-rose-500">
                                    <AlertCircle size={14} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-[12px] font-black text-slate-800 uppercase italic tracking-tight leading-none">Low Stock</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Requires restocking</p>
                                </div>
                            </div>
                            {stockAlerts.length > 0 && (
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[9px] font-black rounded-full uppercase tracking-widest border border-rose-200 animate-pulse">
                                    {stockAlerts.length} alerts
                                </span>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                            {stockAlerts.length > 0 ? (
                                stockAlerts.map((product) => (
                                    <div key={product.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--ui-radius-lg)] hover:bg-primary/[0.02] border border-transparent hover:border-primary/5 transition-all">
                                        <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-[var(--ui-radius-md)] shrink-0">
                                            <AlertCircle size={12} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-bold text-slate-700 truncate">{product.name}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                {product.stock} <span className="text-slate-300">/ {product.min_stock} min</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => router.push("/purchases")}
                                            className="shrink-0 text-[9px] font-black text-primary px-2 py-1 bg-primary/10 rounded-[var(--ui-radius-sm)] hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
                                        >
                                            Order
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-8 opacity-30 text-center">
                                    <Package size={36} strokeWidth={1} className="mb-2 text-slate-400" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory is stable</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Unpaid Purchases ── */}
                <div className={cn(
                    "glass rounded-[var(--ui-radius-xl)] border shadow-glass overflow-hidden",
                    unpaidPurchases.length > 0 ? "border-amber-200/60" : "border-primary/5"
                )}>
                    <div className={cn(
                        "px-5 py-4 border-b flex items-center justify-between",
                        unpaidPurchases.length > 0 ? "border-amber-100 bg-amber-50/40" : "border-primary/5 bg-primary/[0.02]"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-[var(--ui-radius-md)]", unpaidPurchases.length > 0 ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary")}>
                                <Wallet size={14} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-[12px] font-black text-slate-800 uppercase italic tracking-tight leading-none">Unpaid Purchase Invoices</h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    Pending & partial payments owed to suppliers
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {unpaidPurchases.length > 0 && (
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Owed</p>
                                    <p className="text-[14px] font-black italic text-amber-600 leading-none">${fmt(totalOwed)}</p>
                                </div>
                            )}
                            <button
                                onClick={() => router.push("/purchases")}
                                className="flex items-center gap-1 text-[9px] font-black text-primary px-2.5 py-1.5 bg-primary/10 rounded-[var(--ui-radius-md)] hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
                            >
                                View All <ChevronRight size={10} />
                            </button>
                        </div>
                    </div>

                    {unpaidPurchases.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="border-b border-primary/5 bg-primary/[0.01]">
                                    <tr>
                                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Invoice</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Date</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Balance Due</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {unpaidPurchases.map((p) => {
                                        const statusCfg = STATUS_CONFIG[p.payment_status] ?? STATUS_CONFIG.unpaid;
                                        return (
                                            <tr
                                                key={p.id}
                                                onClick={() => router.push("/purchases")}
                                                className="hover:bg-amber-50/30 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-5 py-3">
                                                    <span className="text-[11px] font-black text-slate-700 group-hover:text-primary transition-colors">
                                                        {p.invoice_number || `#${p.id.slice(0, 8).toUpperCase()}`}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-[12px] font-semibold text-slate-600 max-w-[140px] truncate">
                                                    {p.supplier_name || "—"}
                                                </td>
                                                <td className="px-5 py-3 text-[10px] font-bold text-slate-400 hidden sm:table-cell">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {new Date(p.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right text-[12px] font-black italic text-slate-600">
                                                    ${fmt(Number(p.total_amount))}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <span className="text-[13px] font-black italic text-rose-600">
                                                        ${fmt(Number(p.balance_due))}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2 py-0.5 rounded-[var(--ui-radius-sm)] text-[9px] font-black uppercase tracking-widest border",
                                                        statusCfg.cls
                                                    )}>
                                                        {statusCfg.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 opacity-30">
                            <ShoppingBag size={36} strokeWidth={1} className="mb-2 text-slate-400" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">All purchase invoices are settled</p>
                        </div>
                    )}
                </div>

                {/* ── Recent Sales ── */}
                <div className="glass rounded-[var(--ui-radius-xl)] border border-primary/5 shadow-glass overflow-hidden">
                    <div className="px-5 py-4 border-b border-primary/5 bg-primary/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-[var(--ui-radius-md)] text-primary">
                                <ShoppingCart size={14} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-[12px] font-black text-slate-800 uppercase italic tracking-tight leading-none">Live Transactions</h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Real-time sale stream</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/sales")}
                            className="flex items-center gap-1 text-[9px] font-black text-primary px-2.5 py-1.5 bg-primary/10 rounded-[var(--ui-radius-md)] hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
                        >
                            View All <ChevronRight size={10} />
                        </button>
                    </div>

                    {recentSales.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="border-b border-primary/5 bg-primary/[0.01]">
                                    <tr>
                                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Time</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {recentSales.map((sale, i) => (
                                        <tr key={i} className="hover:bg-primary/[0.02] transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-[var(--ui-radius-md)] bg-primary/10 text-primary flex items-center justify-center text-[11px] font-black shrink-0">
                                                        {sale.customers?.name?.charAt(0) || "W"}
                                                    </div>
                                                    <span className="text-[12px] font-bold text-slate-700 truncate max-w-[120px]">
                                                        {sale.customers?.name || "Walk-in Guest"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-[10px] font-bold text-slate-400 hidden sm:table-cell">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(sale.date).toLocaleString([], { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span className="text-[13px] font-black italic text-primary">
                                                    ${Number(sale.total_amount).toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 opacity-30">
                            <ShoppingCart size={36} strokeWidth={1} className="mb-2 text-slate-400" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No sales today yet</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}

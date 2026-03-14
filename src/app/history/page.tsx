"use client";

import { useState, useEffect } from "react";
import {
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Filter,
    History,
    Loader2,
    Hash,
    Clock,
    Tag,
    ArrowRight,
    Download
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 30;

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("all"); // all, today, 7days, month, custom
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchTransactions();
    }, [dateFilter, startDate, endDate, page]);

    async function fetchTransactions() {
        setLoading(true);
        let query = supabase
            .from("inventory_transactions")
            .select("*", { count: "exact" })
            .order("transaction_date", { ascending: false });

        // Date Filtering Logic
        const now = new Date();
        if (dateFilter === "today") {
            const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            query = query.gte("transaction_date", startOfDay);
        } else if (dateFilter === "7days") {
            const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
            query = query.gte("transaction_date", sevenDaysAgo);
        } else if (dateFilter === "month") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            query = query.gte("transaction_date", startOfMonth);
        } else if (dateFilter === "custom" && startDate && endDate) {
            query = query.gte("transaction_date", startDate).lte("transaction_date", endDate);
        }

        // Search
        if (searchTerm) {
            query = query.ilike("product_name", `%${searchTerm}%`);
        }

        // Pagination
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (!error && data) {
            setTransactions(data);
            setTotalCount(count || 0);
        }
        setLoading(false);
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        fetchTransactions();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] lg:-m-4 gap-0 overflow-hidden bg-[#F8F9FA]">
            {/* Header Section */}
            <header className="p-6 lg:p-10 space-y-8 shrink-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <History size={24} strokeWidth={1.5} />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-primary">Stock Kardex</h1>
                        </div>
                        <p className="text-muted-foreground font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                            Inventory Audit & Movement Ledger
                        </p>
                    </div>

                    <div className="flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-primary/5">
                        {[
                            { id: "all", label: "All" },
                            { id: "today", label: "Today" },
                            { id: "7days", label: "7 Days" },
                            { id: "month", label: "Month" },
                            { id: "custom", label: "Custom" }
                        ].map((f) => (
                            <button
                                key={f.id}
                                onClick={() => { setDateFilter(f.id); setPage(0); }}
                                className={cn(
                                    "px-6 py-2.5 text-xs font-black rounded-[1.5rem] transition-all uppercase tracking-wider",
                                    dateFilter === f.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-4 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={20} strokeWidth={1.5} />
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Filter by product name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 rounded-3xl bg-white shadow-sm border-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold italic text-primary"
                            />
                        </form>
                    </div>

                    <div className="lg:col-span-5 flex items-center gap-4">
                        {dateFilter === "custom" && (
                            <div className="flex items-center gap-3 animate-in slide-in-from-left-4">
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={16} strokeWidth={1.5} />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="pl-10 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm text-xs font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <ArrowRight size={16} className="text-primary/20" />
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={16} strokeWidth={1.5} />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="pl-10 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm text-xs font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-3 flex justify-end gap-3">
                        <button className="flex items-center gap-2 px-6 py-4 bg-secondary text-primary rounded-3xl font-black text-xs uppercase tracking-widest shadow-sm hover:scale-105 transition-transform active:scale-95">
                            <Download size={18} strokeWidth={1.5} />
                            Download Audit
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Ledger Space */}
            <main className="flex-1 overflow-y-auto px-6 lg:px-10 pb-10 custom-scrollbar">
                <div className="space-y-4">
                    {loading ? (
                        <div className="grid gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-24 rounded-3xl bg-white animate-pulse" />)}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-30">
                            <div className="p-10 bg-primary/5 rounded-[3rem]">
                                <History size={80} strokeWidth={1} className="text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-primary uppercase tracking-widest">No Activity Records</h3>
                                <p className="text-xs font-bold uppercase tracking-widest">Inventory levels have been stagnant for this period</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-1">
                            {transactions.map((t) => (
                                <div
                                    key={t.id}
                                    className="group flex flex-col md:flex-row items-center justify-between p-6 bg-white first:rounded-t-[2.5rem] last:rounded-b-[2.5rem] hover:bg-[#F1F5F9] transition-all duration-300 border-b border-primary/5 relative"
                                >
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                                            t.transaction_type === "sale" ? "bg-red-50 text-red-600" : "bg-accent/10 text-accent"
                                        )}>
                                            {t.transaction_type === "sale" ? <ArrowDownRight size={24} strokeWidth={1.5} /> : <ArrowUpRight size={24} strokeWidth={1.5} />}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-black text-primary uppercase italic tracking-tight">{t.product_name || "UNKNOWN_PART"}</h3>
                                                <span className={cn(
                                                    "px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest",
                                                    t.transaction_type === "sale" ? "bg-red-500/10 text-red-600" : "bg-accent/20 text-accent"
                                                )}>
                                                    {t.transaction_type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase opacity-60">
                                                <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(t.transaction_date).toLocaleDateString()}</div>
                                                <div className="flex items-center gap-1.5"><Clock size={12} /> {new Date(t.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                {t.related_document_id && (
                                                    <div className="flex items-center gap-1.5 bg-secondary px-2 rounded-lg text-primary"><Hash size={10} /> {t.related_document_id}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-10 w-full md:w-auto mt-6 md:mt-0">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1 tracking-widest">Movement</p>
                                            <p className={cn(
                                                "text-2xl font-black italic tracking-tighter",
                                                t.transaction_type === "sale" ? "text-red-600" : "text-accent"
                                            )}>
                                                {t.transaction_type === "sale" ? "-" : "+"}{Math.abs(t.quantity_change)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 px-6 py-3 bg-secondary/30 rounded-2xl min-w-[140px]">
                                            <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                                                <Tag size={16} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1 tracking-widest">Traceability</p>
                                                <div className="flex items-center gap-2 text-xs font-black">
                                                    <span className="opacity-30 leading-none">{t.stock_before}</span>
                                                    <ArrowRight size={10} className="text-primary/20" />
                                                    <span className="text-primary leading-none">{t.stock_after}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="hidden lg:block max-w-[200px] text-right">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1 tracking-widest">Audit Note</p>
                                            <p className="text-[10px] font-semibold text-primary/60 italic leading-tight truncate">"{t.notes || "No additional context"}"</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="mt-10 flex items-center justify-between shrink-0">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">
                        Real-time synchronization • {totalCount} movements tracked
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <button
                                disabled={page === 0 || loading}
                                onClick={() => setPage(page - 1)}
                                className="p-3 bg-white border border-primary/5 rounded-2xl hover:bg-primary hover:text-white transition-all disabled:opacity-20 shadow-sm"
                            >
                                <ChevronLeft size={20} strokeWidth={1.5} />
                            </button>
                            <div className="flex items-center px-6 bg-white border border-primary/5 rounded-2xl shadow-sm text-sm font-black text-primary">
                                Page {page + 1}
                            </div>
                            <button
                                disabled={(page + 1) * PAGE_SIZE >= totalCount || loading}
                                onClick={() => setPage(page + 1)}
                                className="p-3 bg-white border border-primary/5 rounded-2xl hover:bg-primary hover:text-white transition-all disabled:opacity-20 shadow-sm"
                            >
                                <ChevronRight size={20} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

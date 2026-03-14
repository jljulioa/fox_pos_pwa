"use client";

import { useState, useEffect } from "react";
import {
    Receipt,
    Search,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
    Undo,
    X,
    Loader2,
    AlertCircle,
    Hash,
    User,
    Package,
    TrendingDown,
    Clock,
    LayoutGrid,
    Filter,
    ArrowRight,
    Download,
    CheckCircle2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { generateInvoicePDF } from "@/lib/pdf";

const PAGE_SIZE = 30;

type FilterType = 'all' | 'today' | '7days' | 'month' | 'custom';

export default function SalesHistoryPage() {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState<FilterType>('today');
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [pageError, setPageError] = useState<string | null>(null);

    // Detail Modal State
    const [selectedSale, setSelectedSale] = useState<any | null>(null);
    const [saleItems, setSaleItems] = useState<any[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [processReturn, setProcessReturn] = useState(false);

    useEffect(() => {
        fetchSales();
    }, [dateFilter, startDate, endDate, page]);

    async function fetchSales() {
        setLoading(true);
        setPageError(null);
        try {
            let query = supabase
                .from("sales")
                .select("*, customers(name)", { count: 'exact' });

            // Apply Filters
            const now = new Date();
            if (dateFilter === 'today') {
                const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
                query = query.gte('date', startOfDay);
            } else if (dateFilter === '7days') {
                const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
                query = query.gte('date', sevenDaysAgo);
            } else if (dateFilter === 'month') {
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                query = query.gte('date', firstDayOfMonth);
            } else if (dateFilter === 'custom' && startDate && endDate) {
                query = query.gte('date', startDate).lte('date', endDate);
            }

            // Search
            if (searchTerm) {
                query = query.ilike('sale_ref', `%${searchTerm}%`);
            }

            // Pagination
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data, error, count } = await query
                .order('date', { ascending: false })
                .range(from, to);

            if (error) throw error;
            setSales(data || []);
            setTotalCount(count || 0);
        } catch (err: any) {
            console.error("Error fetching sales:", err);
            setPageError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        fetchSales();
    };

    async function fetchSaleDetails(sale: any) {
        setSelectedSale(sale);
        setLoadingItems(true);
        try {
            const { data, error } = await supabase
                .from("sale_items")
                .select("*, products(name, sku, stock)")
                .eq("sale_id", sale.id);

            if (error) throw error;
            setSaleItems(data || []);
        } catch (err: any) {
            alert("Error loading items: " + err.message);
        } finally {
            setLoadingItems(false);
        }
    }

    const handleReturn = async (item: any) => {
        if (!confirm(`Register return for 1 unit of ${item.products.name}?`)) return;

        setProcessReturn(true);
        try {
            const returningQty = 1;
            const taxPerUnit = item.tax_amount / item.quantity;
            const returningTax = taxPerUnit * returningQty;
            const returningTotalWithTax = (item.unit_price * returningQty) + returningTax;

            // 1. Update Sale Item
            if (item.quantity <= returningQty) {
                const { error: delErr } = await supabase.from("sale_items").delete().eq("id", item.id);
                if (delErr) throw delErr;
            } else {
                const newQty = item.quantity - returningQty;
                const newSubtotal = item.unit_price * newQty;
                const newTax = taxPerUnit * newQty;

                const { error: updErr } = await supabase
                    .from("sale_items")
                    .update({
                        quantity: newQty,
                        total_price: newSubtotal,
                        tax_amount: newTax
                    })
                    .eq("id", item.id);
                if (updErr) throw updErr;
            }

            // 2. Increase Product Stock
            const { data: product } = await supabase.from("products").select("stock").eq("id", item.product_id).single();
            const newStock = (product?.stock || 0) + returningQty;

            const { error: stockErr } = await supabase
                .from("products")
                .update({ stock: newStock })
                .eq("id", item.product_id);
            if (stockErr) throw stockErr;

            // 3. Log Inventory Transaction (Return)
            const { error: transErr } = await supabase.from("inventory_transactions").insert({
                product_id: item.product_id,
                product_name: item.products.name,
                transaction_type: 'return',
                quantity_change: returningQty,
                stock_before: product?.stock || 0,
                stock_after: newStock,
                related_document_id: selectedSale.sale_ref,
                notes: `Customer return from ${selectedSale.sale_ref}`
            });
            if (transErr) throw transErr;

            // 4. Update Sale Total (Subtract price + tax)
            const newTotal = selectedSale.total_amount - returningTotalWithTax;
            await supabase.from("sales").update({ total_amount: newTotal }).eq("id", selectedSale.id);

            // Refresh data
            fetchSaleDetails({ ...selectedSale, total_amount: newTotal });
            fetchSales();
            alert("Return processed successfully!");
        } catch (err: any) {
            alert("Error processing return: " + err.message);
        } finally {
            setProcessReturn(false);
        }
    };

    const handlePrintReceipt = () => {
        if (!selectedSale) return;
        
        const cartForPdf = saleItems.map(item => ({
            name: item.products?.name || "Unknown item",
            quantity: item.quantity,
            price: Number(item.unit_price)
        }));
        
        const subtotal = saleItems.reduce((sum, item) => sum + (Number(item.unit_price) * item.quantity), 0);
        const tax = saleItems.reduce((sum, item) => sum + Number(item.tax_amount || 0), 0);
        const total = Number(selectedSale.total_amount);

        generateInvoicePDF(selectedSale, cartForPdf, subtotal, tax, total);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] lg:-m-4 gap-0 overflow-hidden bg-[#F8F9FA]">
            {/* Header & Filters Section */}
            <header className="p-6 lg:p-10 space-y-8 shrink-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <Receipt size={24} strokeWidth={1.5} />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-primary">Sales History</h1>
                        </div>
                        <p className="text-muted-foreground font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                            Revenue Tracking & Transaction Portal
                        </p>
                    </div>

                    <div className="flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-primary/5">
                        {[
                            { id: 'all', label: 'All Time' },
                            { id: 'today', label: 'Today' },
                            { id: '7days', label: '7 Days' },
                            { id: 'month', label: 'Month' },
                            { id: 'custom', label: 'Custom' }
                        ].map((f) => (
                            <button
                                key={f.id}
                                onClick={() => { setDateFilter(f.id as FilterType); setPage(0); }}
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
                                placeholder="Search by reference (e.g. VEN-0001)..."
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
                            Export CSV
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Space */}
            <main className="flex-1 overflow-y-auto px-6 lg:px-10 pb-10 custom-scrollbar">
                {pageError && (
                    <div className="mb-8 p-6 glass-dark rounded-[2.5rem] border-primary/10 flex items-center gap-5">
                        <div className="p-3 bg-red-500/10 text-red-600 rounded-2xl">
                            <AlertCircle size={32} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black text-primary uppercase tracking-widest leading-none mb-1">Database Connectivity Error</p>
                            <p className="text-xs font-semibold text-muted-foreground">{pageError}</p>
                        </div>
                        <button onClick={fetchSales} className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95">Retry Sync</button>
                    </div>
                )}

                <div className="space-y-4">
                    {loading ? (
                        <div className="grid gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-24 rounded-3xl bg-white animate-pulse" />)}
                        </div>
                    ) : sales.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-30">
                            <div className="p-10 bg-primary/5 rounded-[3rem]">
                                <Receipt size={80} strokeWidth={1} className="text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-primary uppercase tracking-widest">No Records Found</h3>
                                <p className="text-xs font-bold uppercase tracking-widest">The transaction archive is empty for this period</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {sales.map((sale) => (
                                <div
                                    key={sale.id}
                                    className="group flex flex-col md:flex-row items-center justify-between p-6 bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 border border-transparent hover:border-primary/5"
                                >
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className="w-14 h-14 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <Receipt size={24} strokeWidth={1.5} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-black text-primary uppercase italic tracking-tight">{sale.sale_ref || "UNTITLED"}</h3>
                                                <span className="px-3 py-1 bg-secondary text-primary text-[9px] font-black rounded-full uppercase tracking-widest">{sale.payment_method}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase opacity-60">
                                                <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(sale.date).toLocaleDateString()}</div>
                                                <div className="flex items-center gap-1.5"><Clock size={12} /> {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 w-full md:w-auto mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-primary/5">
                                        <div className="flex items-center gap-3 px-6 py-3 bg-secondary/30 rounded-2xl shrink-0">
                                            <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                                                <User size={16} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1 tracking-widest">Client</p>
                                                <p className="text-xs font-black text-primary uppercase italic truncate max-w-[120px]">{sale.customers?.name || "Walk-In"}</p>
                                            </div>
                                        </div>

                                        <div className="text-right px-6 shrink-0">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1 tracking-widest">Grand Total</p>
                                            <p className="text-2xl font-black text-primary italic tracking-tighter">${Number(sale.total_amount).toLocaleString()}</p>
                                        </div>

                                        <button
                                            onClick={() => fetchSaleDetails(sale)}
                                            className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                                        >
                                            <Eye size={20} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="mt-10 flex items-center justify-between">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">
                        Archived transactions • {totalCount} total entries
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

            {/* DETAIL MODAL - High Fidelity Redesign */}
            {selectedSale && (
                <div className="fixed inset-0 bg-primary/10 backdrop-blur-xl flex items-center justify-center z-[100] p-4 lg:p-10 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl border border-primary/10 overflow-hidden relative flex flex-col h-full max-h-[85vh] animate-in zoom-in-95 duration-500">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-40 -mt-40" />

                        {/* Modal Header */}
                        <div className="p-8 lg:p-12 border-b border-primary/5 relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-primary/20">
                                            <Receipt size={32} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-primary tracking-tight italic uppercase">Sale Ticket</h2>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] font-mono">{selectedSale.sale_ref}</span>
                                                <span className="w-1 h-1 bg-primary/20 rounded-full" />
                                                <span className="text-[10px] font-black text-accent uppercase tracking-widest">Order Finalized</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedSale(null)}
                                    className="p-4 bg-secondary text-primary rounded-[1.5rem] hover:scale-110 active:scale-95 transition-all shadow-sm"
                                >
                                    <X size={24} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 custom-scrollbar relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="p-6 glass-dark rounded-[2rem] border-primary/5 space-y-2">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Client Information</p>
                                    <div className="flex items-center gap-3">
                                        <User size={18} className="text-primary" strokeWidth={1.5} />
                                        <p className="text-sm font-black text-primary uppercase italic truncate">{selectedSale.customers?.name || "Walk-In Service"}</p>
                                    </div>
                                </div>
                                <div className="p-6 glass-dark rounded-[2rem] border-primary/5 space-y-2">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Transaction Mode</p>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-accent" strokeWidth={1.5} />
                                        <p className="text-sm font-black text-primary uppercase italic">{selectedSale.payment_method}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-primary rounded-[2rem] shadow-xl shadow-primary/20 space-y-1">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Grand Total</p>
                                    <p className="text-3xl font-black text-white italic tracking-tighter">${Number(selectedSale.total_amount).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-xs font-black text-primary uppercase tracking-[0.2em]">
                                    <LayoutGrid size={18} strokeWidth={1.5} />
                                    <span>Detailed Item Summary</span>
                                    <div className="flex-1 h-px bg-primary/5" />
                                </div>

                                <div className="space-y-4">
                                    {loadingItems ? (
                                        <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20">
                                            <Loader2 size={48} className="animate-spin text-primary" strokeWidth={1.5} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Retrieving payload...</p>
                                        </div>
                                    ) : (
                                        saleItems.map(item => (
                                            <div key={item.id} className="group flex items-center justify-between p-6 bg-[#F8F9FA] rounded-[2rem] border border-primary/5 hover:border-primary/20 transition-all">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-primary text-sm shadow-sm border border-primary/5">
                                                        {item.quantity}x
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-black text-primary uppercase italic leading-tight group-hover:text-accent transition-colors">{item.products.name}</p>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                                            <span>SKU: {item.products.sku}</span>
                                                            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                                            <span>Stock: {item.products.stock}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-10">
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Unit Price</p>
                                                        <p className="text-lg font-black text-primary italic">${Number(item.unit_price).toLocaleString()}</p>
                                                    </div>
                                                    <button
                                                        disabled={processReturn}
                                                        onClick={() => handleReturn(item)}
                                                        className="p-4 bg-white text-red-600 rounded-2xl shadow-sm border border-red-100 hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-20 group/btn"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Undo size={18} strokeWidth={1.5} />
                                                            <span className="text-[9px] font-black uppercase tracking-widest hidden lg:block">Return</span>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 lg:px-12 lg:py-10 bg-[#F1F5F9] border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 shrink-0 mt-auto">
                            <div className="flex items-center gap-3 text-primary/40">
                                <TrendingDown size={20} strokeWidth={1.5} />
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] max-w-[280px]">Inventory updates and revenue adjustments are processed automatically upon return.</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button 
                                    onClick={handlePrintReceipt}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-5 bg-white text-primary rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-sm hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Download size={20} strokeWidth={1.5} />
                                    Print Receipt
                                </button>
                                <button
                                    onClick={() => setSelectedSale(null)}
                                    className="flex-1 md:flex-none px-12 py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all italic"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Receipt,
    Search,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
    AlertCircle,
    LayoutGrid,
    SlidersHorizontal,
    X,
    Download,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateInvoicePDF } from "@/lib/pdf";
import { salesService, FilterType } from "@/services/salesService";
import { SaleDetailModal } from "./_components/SaleDetailModal";
import { SalesMobileView } from "./_components/SalesMobileView";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 12;

export default function SalesHistoryPage() {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState<FilterType>("today");
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

    // Filter Sheet State
    const [showFilters, setShowFilters] = useState(false);
    const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");

    useEffect(() => {
        fetchSales();
    }, [dateFilter, startDate, endDate, page]);

    async function fetchSales() {
        setLoading(true);
        setPageError(null);
        try {
            const salesRes = await salesService.fetchSales({
                dateFilter,
                startDate,
                endDate,
                searchTerm,
                page,
                pageSize: PAGE_SIZE,
            });
            if (salesRes.error) throw salesRes.error;
            setSales(salesRes.data || []);
            setTotalCount(salesRes.count || 0);
        } catch (err: any) {
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
            const { data, error } = await salesService.fetchSaleDetails(sale.id);
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
            const newTotal = await salesService.processReturn(item, selectedSale, 1);
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
        generateInvoicePDF(selectedSale, cartForPdf, subtotal, tax, Number(selectedSale.total_amount));
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (dateFilter !== "all" && dateFilter !== "today") count++;
        if (filterPaymentMethod !== "all") count++;
        return count;
    }, [dateFilter, filterPaymentMethod]);

    const resetFilters = () => {
        setDateFilter("today");
        setFilterPaymentMethod("all");
        setStartDate("");
        setEndDate("");
        setPage(0);
    };

    return (
        <div className="md:px-3 md:py-3 flex flex-col h-full gap-4 overflow-hidden md:bg-white rounded-[var(--sidebar-radius)] md:shadow-glass">

            {/* ── Header ── */}
            <header className="px-5 py-5 border-b border-primary/5 glass shrink-0 shadow-glass z-20 rounded-[var(--sidebar-radius)] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5">
                <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-[var(--ui-radius-lg)] shadow-inner">
                            <Receipt size={18} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase italic leading-none">
                            Sales Ledger
                        </h1>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic ml-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Transaction Protocol • {totalCount} Records Registered
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full xl:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={14} />
                        <form onSubmit={handleSearch}>
                            <Input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-8 pl-9 bg-slate-50 border-slate-200 rounded-[var(--ui-radius-md)] text-[11px] font-bold uppercase italic tracking-widest text-slate-600 focus:bg-white transition-all shadow-inner"
                            />
                        </form>
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Filters Button */}
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(true)}
                        className={cn(
                            "h-8 px-4 border-slate-200 bg-white rounded-[var(--ui-radius-md)] font-black text-[10px] uppercase tracking-widest italic flex items-center gap-2 transition-all shadow-sm shrink-0",
                            activeFilterCount > 0
                                ? "border-primary/40 text-primary bg-primary/5 ring-1 ring-primary/10"
                                : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                        )}
                    >
                        <SlidersHorizontal size={12} className={activeFilterCount > 0 ? "animate-pulse" : ""} strokeWidth={2.5} />
                        {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters"}
                    </Button>

                    {/* Export */}
                    <Button variant="ghost" size="icon"
                        className="h-8 w-8 text-slate-400 hover:bg-slate-50 rounded-[var(--ui-radius-md)] border border-slate-200 shadow-sm shrink-0"
                        title="Export CSV"
                    >
                        <Download size={14} strokeWidth={2.5} />
                    </Button>
                </div>
            </header>

            {/* ── Error ── */}
            {pageError && (
                <div className="mx-4 p-4 bg-rose-50 border border-rose-100 rounded-[var(--ui-radius-md)] flex items-center gap-3 text-rose-600 shrink-0">
                    <AlertCircle size={18} strokeWidth={2} />
                    <p className="text-[11px] font-bold uppercase tracking-widest flex-1">Connect Error: {pageError}</p>
                    <button onClick={fetchSales} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-rose-600 text-white rounded-md">
                        Retry
                    </button>
                </div>
            )}

            {/* ── Main Content ── */}
            <main className="flex-1 min-h-0 overflow-hidden flex flex-col">

                {/* ─── DESKTOP TABLE ─────────────────────────────────── */}
                <div className="hidden lg:flex flex-col flex-1 min-h-0">
                    <div className="flex-1 min-h-0 glass lg:rounded-[var(--sidebar-radius)] border border-primary/5 flex flex-col overflow-hidden shadow-glass mx-4">
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-primary/[0.01]">
                            <Table className="border-collapse">
                                <TableHeader className="bg-primary/[0.02] sticky top-0 z-10 border-b border-primary/5">
                                    <TableRow className="hover:bg-transparent border-primary/5">
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 w-[80px] pl-6 text-center">Ref</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 min-w-[150px]">Date & Time</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11">Customer</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11">Payment Mode</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 text-right pr-6">Total Amount</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 text-center w-[100px]">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 8 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={6} className="h-[52px]">
                                                    <div className="h-4 bg-slate-100 animate-pulse rounded-[var(--ui-radius-sm)] w-full" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : sales.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-[400px] text-center border-none">
                                                <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                                                    <div className="p-4 border-2 border-dashed border-slate-300 rounded-[var(--ui-radius-xl)]">
                                                        <LayoutGrid size={32} />
                                                    </div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest">No transactions found for this range</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sales.map(sale => (
                                            <TableRow key={sale.id} className="group border-primary/5 hover:bg-primary/[0.03] transition-colors">
                                                <TableCell className="pl-6 text-center">
                                                    <span className="text-[11px] font-black text-slate-400 group-hover:text-primary transition-colors italic">
                                                        #{String(sale.id).slice(-4).toUpperCase()}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-bold text-slate-900 italic tracking-tight">{new Date(sale.date).toLocaleDateString()}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(sale.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 bg-slate-100 rounded-[var(--ui-radius-sm)] flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                                                            <User size={14} />
                                                        </div>
                                                        <span className="text-[13px] font-bold text-slate-900">{sale.customers?.name || "Walk-In Customer"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                                        {sale.payment_method}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <span className="text-sm font-black text-slate-900 italic tracking-tight">${Number(sale.total_amount).toLocaleString()}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => fetchSaleDetails(sale)}
                                                        className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-300 hover:text-primary hover:bg-white border border-transparent hover:border-slate-100 shadow-none"
                                                    >
                                                        <Eye size={16} strokeWidth={2.5} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="flex items-center justify-between h-10 px-6 py-1 bg-primary/[0.02] border-t border-primary/5 shrink-0">
                            <div className="flex items-center gap-6 leading-none">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none opacity-60">Density</span>
                                    <div className="flex items-center px-1.5 py-0.5 bg-primary/5 border border-primary/10 rounded-[var(--ui-radius-sm)] text-[10px] font-black text-primary italic opacity-70">
                                        {PAGE_SIZE}
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none opacity-60">
                                    Page {page + 1} of {Math.ceil(totalCount / PAGE_SIZE) || 1} • {sales.length}/{totalCount} records
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" disabled={page === 0 || loading} onClick={() => setPage(page - 1)}
                                    className="h-6 w-6 rounded-md text-slate-400 hover:text-primary hover:bg-white border border-transparent hover:border-primary/20 transition-all disabled:opacity-20">
                                    <ChevronLeft size={14} strokeWidth={2.5} />
                                </Button>
                                <div className="min-w-[20px] h-6 flex items-center justify-center text-[10px] font-black text-primary italic px-2 bg-white border border-primary/10 rounded-md shadow-sm leading-none">
                                    {page + 1}
                                </div>
                                <Button variant="ghost" size="icon" disabled={(page + 1) * PAGE_SIZE >= totalCount || loading} onClick={() => setPage(page + 1)}
                                    className="h-6 w-6 rounded-md text-slate-400 hover:text-primary hover:bg-white border border-transparent hover:border-primary/20 transition-all disabled:opacity-20">
                                    <ChevronRight size={14} strokeWidth={2.5} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── MOBILE CARDS ───────────────────────────────────── */}
                <div className="lg:hidden flex-1 overflow-y-auto custom-scrollbar min-h-0">
                    <SalesMobileView
                        sales={sales}
                        loading={loading}
                        onViewSale={fetchSaleDetails}
                    />

                    {/* Mobile Pagination */}
                    {!loading && sales.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white sticky bottom-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                                {page + 1} / {Math.ceil(totalCount / PAGE_SIZE) || 1}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" disabled={page === 0 || loading} onClick={() => setPage(page - 1)}
                                    className="h-8 w-8 rounded-[var(--ui-radius-md)] text-slate-400 hover:text-primary border border-slate-200 disabled:opacity-30">
                                    <ChevronLeft size={14} />
                                </Button>
                                <Button variant="ghost" size="icon" disabled={(page + 1) * PAGE_SIZE >= totalCount || loading} onClick={() => setPage(page + 1)}
                                    className="h-8 w-8 rounded-[var(--ui-radius-md)] text-slate-400 hover:text-primary border border-slate-200 disabled:opacity-30">
                                    <ChevronRight size={14} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ── Filters Sheet ── */}
            {showFilters && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[110] p-0 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-t-[var(--ui-radius-xl)] sm:rounded-[var(--ui-radius-xl)] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">

                        {/* Sheet Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 text-primary rounded-[var(--ui-radius-md)] shadow-inner">
                                    <SlidersHorizontal size={18} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-black text-slate-900 uppercase italic tracking-tight leading-none">Sales Filters</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Transaction Search Matrix</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}
                                className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-400 hover:text-rose-500 hover:bg-rose-50">
                                <X size={18} />
                            </Button>
                        </div>

                        {/* Sheet Body */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                            {/* Time Horizon */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Time Horizon</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["today", "7days", "month", "all", "custom"] as FilterType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setDateFilter(type)}
                                            className={cn(
                                                "px-3 py-2.5 rounded-[var(--ui-radius-md)] text-[10px] font-black uppercase tracking-widest border transition-all italic",
                                                dateFilter === type
                                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                    : "bg-slate-50 text-slate-500 border-slate-200 hover:border-primary/20 hover:text-primary"
                                            )}
                                        >
                                            {type === "7days" ? "Last 7D" : type === "all" ? "Historical" : type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Date Range */}
                            {dateFilter === "custom" && (
                                <div className="space-y-3 animate-in slide-in-from-top-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Date Range Boundary</label>
                                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/50 rounded-[var(--ui-radius-lg)] border border-slate-200">
                                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                            className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[11px] font-bold text-slate-600" />
                                        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                            className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[11px] font-bold text-slate-600" />
                                    </div>
                                </div>
                            )}

                            {/* Payment Method */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Payment Protocol</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["all", "Cash", "Credit Card", "Debit Card", "Transfer"].map(method => (
                                        <button
                                            key={method}
                                            onClick={() => setFilterPaymentMethod(method)}
                                            className={cn(
                                                "px-4 py-2.5 rounded-[var(--ui-radius-md)] text-[10px] font-black uppercase tracking-widest border transition-all italic",
                                                filterPaymentMethod === method
                                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                    : "bg-slate-50 text-slate-500 border-slate-200 hover:border-primary/20 hover:text-primary"
                                            )}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sheet Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                            <Button variant="outline" onClick={resetFilters}
                                className="flex-1 h-11 rounded-[var(--ui-radius-md)] border-slate-200 text-slate-400 text-[11px] font-black uppercase tracking-widest italic">
                                Reset Matrix
                            </Button>
                            <Button onClick={() => { setShowFilters(false); fetchSales(); }}
                                className="flex-[2] h-11 rounded-[var(--ui-radius-md)] bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-95 transition-all italic">
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Sale Detail Modal ── */}
            <SaleDetailModal
                selectedSale={selectedSale}
                setSelectedSale={setSelectedSale}
                saleItems={saleItems}
                loadingItems={loadingItems}
                processReturn={processReturn}
                handleReturn={handleReturn}
                handlePrintReceipt={handlePrintReceipt}
            />
        </div>
    );
}

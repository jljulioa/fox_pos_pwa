"use client";

import { useState, useEffect } from "react";
import {
    Receipt,
    Search,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
    AlertCircle,
    Clock,
    Filter,
    ArrowRight,
    Download,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateInvoicePDF } from "@/lib/pdf";
import { salesService, FilterType } from "@/services/salesService";
import { SaleDetailModal } from "./_components/SaleDetailModal";

const PAGE_SIZE = 10;

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
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        fetchSales();
    }, [dateFilter, startDate, endDate, page]);

    async function fetchSales() {
        setLoading(true);
        setPageError(null);
        try {
            const { data, error, count } = await salesService.fetchSales({
                dateFilter,
                startDate,
                endDate,
                searchTerm,
                page,
                pageSize: PAGE_SIZE,
            });

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
        <div className="flex flex-col h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-4rem)] lg:-m-4 gap-0 overflow-hidden bg-[#F8F9FA]">
            {/* Header & Filters Section */}
            <header className="p-4 md:p-6 lg:p-10 space-y-4 md:space-y-8 shrink-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                            <Receipt size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tight text-primary leading-none">Sales History</h1>
                            <p className="text-[9px] md:text-sm text-muted-foreground font-semibold md:flex items-center gap-2 hidden lg:flex">
                                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                                Revenue Tracking
                            </p>
                        </div>
                    </div>

                    {/* Mobile Export - Compact */}
                    <button className="lg:hidden p-3 bg-secondary text-primary rounded-xl shadow-sm active:scale-95 transition-all">
                        <Download size={18} strokeWidth={2} />
                    </button>
                    
                    {/* Desktop Filter Row - Hidden on mobile, moved below */}
                    <div className="hidden lg:flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-primary/5">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'today', label: 'Today' },
                            { id: '7days', label: '7D' },
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

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 md:gap-6 items-stretch md:items-center">
                    <div className="relative group lg:col-span-8 lg:col-start-1 lg:row-start-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={16} strokeWidth={1.5} />
                            <form onSubmit={handleSearch}>
                                <input
                                    type="text"
                                    placeholder="Search reference..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white shadow-sm border-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold italic text-primary text-xs"
                                />
                            </form>
                        </div>
                        {/* Mobile Filter Toggle */}
                        <button 
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className={cn(
                                "lg:hidden flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0",
                                showMobileFilters ? "bg-primary text-white" : "bg-white text-primary shadow-sm"
                            )}
                        >
                            <Filter size={14} />
                            <span>Filter</span>
                        </button>
                    </div>

                    {/* Date Filters Row - Responsive toggle */}
                    <div className={cn(
                        "lg:col-span-12 w-full transition-all duration-300 overflow-hidden",
                        showMobileFilters ? "max-h-20 opacity-100" : "max-h-0 lg:max-h-0 opacity-0 lg:opacity-0"
                    )}>
                        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-primary/5 w-full overflow-x-auto custom-scrollbar-hide mt-2 lg:hidden">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'today', label: 'Today' },
                                { id: '7days', label: '7D' },
                                { id: 'month', label: 'Month' },
                                { id: 'custom', label: 'Custom' }
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => { setDateFilter(f.id as FilterType); setPage(0); }}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-wider flex-1 whitespace-nowrap",
                                        dateFilter === f.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-12 flex items-center gap-3 w-full overflow-x-auto custom-scrollbar-hide">
                        {dateFilter === "custom" && (
                            <div className="flex items-center gap-2 animate-in slide-in-from-left-4 w-full min-w-[280px]">
                                <div className="relative flex-1">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={14} strokeWidth={1.5} />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full pl-9 pr-2 py-2 bg-white rounded-xl border-none shadow-sm text-[10px] font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <ArrowRight size={14} className="text-primary/20 shrink-0" />
                                <div className="relative flex-1">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={14} strokeWidth={1.5} />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full pl-9 pr-2 py-2 bg-white rounded-xl border-none shadow-sm text-[10px] font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hidden lg:flex lg:col-span-4 lg:col-start-9 lg:row-start-1 justify-end gap-3 h-full">
                        <button className="flex items-center justify-center gap-2 px-6 py-3 w-full max-w-[200px] bg-secondary text-primary rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-sm hover:scale-105 transition-transform active:scale-95">
                            <Download size={18} strokeWidth={1.5} />
                            Export CSV
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Space */}
            <main className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-10 pb-10 custom-scrollbar">
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
                                    className="group flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-white rounded-2xl md:rounded-[2rem] shadow-sm hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 border border-transparent hover:border-primary/5 gap-4 md:gap-0"
                                >
                                    <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                                        <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/5 rounded-xl md:rounded-[1.5rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                            <Receipt size={20}  strokeWidth={1.5} />
                                        </div>
                                        <div className="space-y-0.5 md:space-y-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                                <h3 className="text-base md:text-lg font-black text-primary uppercase italic tracking-tight truncate">{sale.sale_ref || "UNTITLED"}</h3>
                                                <span className="px-2 py-0.5 bg-secondary text-primary text-[8px] md:text-[9px] font-black rounded-full uppercase tracking-widest">{sale.payment_method}</span>
                                            </div>
                                            <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-bold text-muted-foreground uppercase opacity-60">
                                                <div className="flex items-center gap-1"><Calendar size={10} /> {new Date(sale.date).toLocaleDateString()}</div>
                                                <div className="flex items-center gap-1"><Clock size={10} /> {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row items-center justify-between md:justify-end gap-3 md:gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-primary/5">
                                        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3 bg-secondary/30 rounded-xl md:rounded-2xl min-w-0">
                                            <div className="w-7 h-7 md:w-8 md:h-8 bg-white rounded-lg md:rounded-xl shadow-sm flex items-center justify-center text-primary shrink-0">
                                                <User size={14} strokeWidth={1.5} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase leading-none mb-0.5 md:mb-1 tracking-widest">Client</p>
                                                <p className="text-[10px] md:text-xs font-black text-primary uppercase italic truncate max-w-[80px] md:max-w-[120px]">{sale.customers?.name || "Walk-In"}</p>
                                            </div>
                                        </div>

                                        <div className="text-right md:px-6 shrink-0">
                                            <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase leading-none mb-0.5 md:mb-1 tracking-widest">Grand Total</p>
                                            <p className="text-lg md:text-2xl font-black text-primary italic tracking-tighter">${Number(sale.total_amount).toLocaleString()}</p>
                                        </div>

                                        <button
                                            onClick={() => fetchSaleDetails(sale)}
                                            className="p-3 md:p-4 bg-primary text-white rounded-xl md:rounded-2xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all shrink-0"
                                        >
                                            <Eye size={18} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Spacing for fixed pagination on mobile */}
                <div className="h-20 lg:h-0" />
            </main>

            {/* Pagination - Fixed on mobile, normal on desktop */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md lg:relative lg:bg-transparent border-t lg:border-none border-primary/5 p-4 lg:p-0 lg:mt-10 z-50">
                <div className="flex items-center justify-between max-w-7xl mx-auto px-2 lg:px-0">
                    <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic hidden sm:block">
                        {totalCount} entries
                    </p>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            disabled={page === 0 || loading}
                            onClick={() => setPage(page - 1)}
                            className="p-2 md:p-3 bg-white border border-primary/5 rounded-xl md:rounded-2xl hover:bg-primary hover:text-white transition-all disabled:opacity-20 shadow-sm grow sm:grow-0"
                        >
                            <ChevronLeft size={18} strokeWidth={1.5} />
                        </button>
                        <div className="flex items-center justify-center px-4 md:px-6 py-2 md:py-3 bg-white border border-primary/5 rounded-xl md:rounded-2xl shadow-sm text-xs font-black text-primary italic shrink-0">
                           {page + 1}
                        </div>
                        <button
                            disabled={(page + 1) * PAGE_SIZE >= totalCount || loading}
                            onClick={() => setPage(page + 1)}
                            className="p-2 md:p-3 bg-white border border-primary/5 rounded-xl md:rounded-2xl hover:bg-primary hover:text-white transition-all disabled:opacity-20 shadow-sm grow sm:grow-0"
                        >
                            <ChevronRight size={18} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>

            {/* DETAIL MODAL - Extracted */}
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

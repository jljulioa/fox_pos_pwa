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
    User,
    Printer,
    ArrowUpRight,
    LayoutGrid,
    MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateInvoicePDF } from "@/lib/pdf";
import { salesService, FilterType } from "@/services/salesService";
import { SaleDetailModal } from "./_components/SaleDetailModal";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 12;

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
            const [salesRes] = await Promise.all([
                salesService.fetchSales({
                    dateFilter,
                    startDate,
                    endDate,
                    searchTerm,
                    page,
                    pageSize: PAGE_SIZE,
                })
            ]);

            if (salesRes.error) throw salesRes.error;
            
            setSales(salesRes.data || []);
            setTotalCount(salesRes.count || 0);
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
        <div className="flex flex-col h-[calc(100vh-5rem)] lg:h-[calc(100vh-4rem)] gap-6 overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-primary/10 rounded-[var(--ui-radius-md)] text-primary">
                            <Receipt size={18} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none uppercase italic">Sales Management</h1>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-12">Track and manage every transaction</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-9 px-4 rounded-[var(--ui-radius-md)] text-[11px] font-bold uppercase tracking-widest border-slate-200 gap-2 focus:ring-0">
                        <Download size={14} className="text-slate-400" strokeWidth={2.5} />
                        Export .CSV
                    </Button>
                </div>
            </div>

            {/* Filters Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center shrink-0">
                <div className="lg:col-span-5 relative flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} strokeWidth={2.5} />
                        <form onSubmit={handleSearch}>
                            <Input
                                placeholder="Search by ticket ID or reference..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 pl-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold italic text-slate-600 focus:ring-primary/10 focus-visible:ring-0"
                            />
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-4 flex items-center gap-2">
                    <Select
                        value={dateFilter}
                        onValueChange={(val: any) => { setDateFilter(val); setPage(0); }}
                    >
                        <SelectTrigger className="h-10 w-[140px] bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[11px] font-bold uppercase tracking-widest text-slate-600">
                            <Calendar size={14} className="mr-2 text-slate-400" strokeWidth={2.5} />
                            <SelectValue placeholder="Date Range" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[var(--ui-radius-md)]">
                            <SelectItem value="all">All Records</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="7days">Last 7 Days</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                    </Select>

                    {dateFilter === "custom" && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-left-2 grow">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[11px] font-bold text-slate-600"
                            />
                            <ArrowRight size={14} className="text-slate-300 shrink-0" />
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[11px] font-bold text-slate-600"
                            />
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3 flex justify-end">
                    <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-[var(--ui-radius-md)] flex items-center gap-2 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{totalCount} Sales Recorded</span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {pageError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-[var(--ui-radius-md)] flex items-center gap-3 text-red-600 shrink-0">
                    <AlertCircle size={18} strokeWidth={2.5} />
                    <p className="text-[11px] font-bold uppercase tracking-widest">Connect Error: {pageError}</p>
                </div>
            )}

            {/* Data Table Wrapper (This scrolls) */}
            <div className="flex-1 min-h-0 bg-white rounded-[var(--ui-radius-lg)] shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                            <TableRow className="hover:bg-transparent border-slate-200">
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
                                Array.from({ length: 6 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6} className="h-14">
                                            <div className="h-4 bg-slate-100 animate-pulse rounded-[var(--ui-radius-sm)] w-full" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : sales.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                                            <div className="p-4 border-2 border-dashed border-slate-300 rounded-[var(--ui-radius-xl)]">
                                                <LayoutGrid size={32} />
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest">No transaction data found for this range</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sales.map((sale) => (
                                    <TableRow key={sale.id} className="group border-slate-100 hover:bg-slate-50/50">
                                        <TableCell className="pl-6 text-center">
                                            <span className="text-[11px] font-black text-slate-400 group-hover:text-primary transition-colors italic">#{String(sale.id).slice(-4).toUpperCase()}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-slate-900 italic tracking-tight">{new Date(sale.date).toLocaleDateString()}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 bg-slate-100 rounded-[var(--ui-radius-sm)] flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
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
            </div>

            {/* Pagination Space (Fixed at bottom) */}
            <div className="flex items-center justify-between py-2 shrink-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic pl-2">
                    Page {page + 1} of {Math.ceil(totalCount / PAGE_SIZE) || 1} — Showing {sales.length} of {totalCount} records
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={page === 0 || loading}
                        onClick={() => setPage(page - 1)}
                        className="h-9 w-9 rounded-[var(--ui-radius-md)] border-slate-200 disabled:opacity-20"
                    >
                        <ChevronLeft size={16} strokeWidth={2.5} />
                    </Button>
                    <div className="flex items-center justify-center h-9 min-w-[36px] px-2 bg-white border border-slate-200 rounded-[var(--ui-radius-md)] text-[12px] font-bold text-primary italic shadow-sm">
                        {page + 1}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={(page + 1) * PAGE_SIZE >= totalCount || loading}
                        onClick={() => setPage(page + 1)}
                        className="h-9 w-9 rounded-[var(--ui-radius-md)] border-slate-200 disabled:opacity-20"
                    >
                        <ChevronRight size={16} strokeWidth={2.5} />
                    </Button>
                </div>
            </div>

            {/* Detail Modal Container */}
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

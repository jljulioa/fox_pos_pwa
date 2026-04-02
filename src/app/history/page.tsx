"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    History,
    Search,
    Download,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Filter,
    X,
    SlidersHorizontal,
    RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { historyService } from "@/services/historyService";
import { KardexDesktopView } from "./_components/KardexDesktopView";
import { KardexMobileView } from "./_components/KardexMobileView";
import { KardexFilterModal } from "./_components/KardexFilterModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 30;

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    // Consolidated Filter State
    const [filters, setFilters] = useState({
        dateFilter: "today",
        startDate: "",
        endDate: "",
        transactionType: "all"
    });

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.dateFilter !== "today") count++;
        if (filters.transactionType !== "all") count++;
        return count;
    }, [filters]);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        const { data, count, error } = await historyService.fetchTransactions({
            ...filters,
            searchTerm,
            page,
            pageSize: PAGE_SIZE,
        });

        if (!error && data) {
            setTransactions(data);
            setTotalCount(count || 0);
        }
        setLoading(false);
    }, [filters, searchTerm, page]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return (
        <div className="flex flex-col overflow-hidden">
            {/* Header Section */}
            <header className="px-6 py-6 border-b border-slate-200 bg-white shrink-0 shadow-sm z-20 rounded-[var(--ui-radius-lg)]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 max-w-[1600px] mx-auto">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-[var(--ui-radius-lg)] flex items-center justify-center shadow-inner">
                                <History size={20} strokeWidth={2.5} />
                            </div>
                            <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase italic">Stock Ledger Control</h1>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic ml-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Inventory Audit Protocol • {totalCount} Active Nodes Tracking
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={14} />
                            <Input
                                type="text"
                                placeholder="Quick Search Ledger..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 pl-9 bg-slate-50 border-slate-200 rounded-[var(--ui-radius-md)] text-[11px] font-bold uppercase italic tracking-widest text-slate-600 focus:bg-white transition-all shadow-inner"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setShowFilterModal(true)}
                            className={cn(
                                "h-10 px-5 border-slate-200 bg-white rounded-[var(--ui-radius-md)] font-black text-[11px] uppercase tracking-widest italic flex items-center gap-2.5 transition-all shadow-sm",
                                activeFilterCount > 0 ? "border-primary/40 text-primary bg-primary/5 ring-1 ring-primary/10" : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                            )}
                        >
                            <SlidersHorizontal size={14} className={activeFilterCount > 0 ? "animate-pulse" : ""} strokeWidth={2.5} />
                            {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters"}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-slate-400 hover:bg-slate-50 rounded-[var(--ui-radius-md)] border border-slate-100 shadow-sm"
                        >
                            <Download size={16} strokeWidth={2.5} />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content Space */}
            <main className="flex-1 overflow-hidden pt-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
                <div className="flex-1 overflow-hidden">
                    <div className="hidden lg:block h-full">
                        <KardexDesktopView 
                            transactions={transactions}
                            loading={loading}
                            page={page}
                            setPage={setPage}
                            totalCount={totalCount}
                            pageSize={PAGE_SIZE}
                        />
                    </div>
                    <div className="lg:hidden h-full overflow-y-auto custom-scrollbar pr-1">
                        <KardexMobileView 
                            transactions={transactions}
                            loading={loading}
                            page={page}
                            setPage={setPage}
                            totalCount={totalCount}
                            pageSize={PAGE_SIZE}
                        />
                        {loading && (
                            <div className="flex items-center justify-center py-10 opacity-30 animate-pulse">
                                <Loader2 className="animate-spin" />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <KardexFilterModal 
                open={showFilterModal}
                onOpenChange={setShowFilterModal}
                filters={filters}
                setFilters={setFilters}
                onApply={fetchTransactions}
            />
        </div>
    );
}

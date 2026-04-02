import React from "react";
import { 
    X, 
    Filter, 
    Calendar, 
    ListCheck, 
    ArrowRight, 
    SlidersHorizontal,
    RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface KardexFilterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: {
        dateFilter: string;
        startDate: string;
        endDate: string;
        transactionType: string;
    };
    setFilters: (filters: any) => void;
    onApply: () => void;
}

export function KardexFilterModal({
    open,
    onOpenChange,
    filters,
    setFilters,
    onApply
}: KardexFilterModalProps) {
    if (!open) return null;

    const resetFilters = () => {
        setFilters({
            dateFilter: "today",
            startDate: "",
            endDate: "",
            transactionType: "all"
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[110] p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-t-[var(--ui-radius-xl)] sm:rounded-[var(--ui-radius-xl)] shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col p-6 sm:p-8 space-y-6 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-[var(--ui-radius-md)] shadow-inner">
                            <SlidersHorizontal size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight leading-none">
                                Audit Ledger Filters
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 italic">
                                Protocol-Based Search Matrix
                            </p>
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onOpenChange(false)} 
                        className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-400 hover:text-primary hover:bg-slate-50 transition-all"
                    >
                        <X size={20} />
                    </Button>
                </div>

                {/* Modal Body */}
                <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                    
                    {/* Period Selector */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic opacity-70">Timeline Boundary</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { id: "today", label: "Today" },
                                { id: "7days", label: "7 Days" },
                                { id: "month", label: "Month" },
                                { id: "custom", label: "Custom" }
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setFilters({ ...filters, dateFilter: p.id })}
                                    className={cn(
                                        "px-4 py-2.5 rounded-[var(--ui-radius-md)] text-[11px] font-black uppercase tracking-widest border transition-all italic",
                                        filters.dateFilter === p.id 
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                            : "bg-white text-slate-500 border-slate-200 hover:border-primary/20 hover:text-primary"
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Range Range */}
                    {filters.dateFilter === "custom" && (
                        <div className="grid grid-cols-1 gap-4 p-4 bg-slate-50/50 rounded-[var(--ui-radius-lg)] border border-slate-200/60 animate-in slide-in-from-top-2 duration-200">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Manual Range Specification</label>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                        className="h-10 bg-white border-slate-200 text-[11px] font-black uppercase italic shadow-sm"
                                    />
                                    <Calendar size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                </div>
                                <ArrowRight size={14} className="text-slate-300" />
                                <div className="relative flex-1">
                                    <Input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                        className="h-10 bg-white border-slate-200 text-[11px] font-black uppercase italic shadow-sm"
                                    />
                                    <Calendar size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Movement Type Filter */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic opacity-70">Movement Protocol</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                                { id: "all", label: "All Movements" },
                                { id: "sale", label: "Sales Only" },
                                { id: "purchase", label: "Entries (In-Stock)" },
                                { id: "adjustment", label: "Manual Adjusts" }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setFilters({ ...filters, transactionType: type.id })}
                                    className={cn(
                                        "w-full flex items-center justify-between px-5 py-3 rounded-[var(--ui-radius-md)] border transition-all italic",
                                        filters.transactionType === type.id 
                                            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" 
                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
                                    )}
                                >
                                    <span className="text-[11px] font-black uppercase tracking-widest">{type.label}</span>
                                    {filters.transactionType === type.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 pt-4 border-t border-slate-100 pb-2">
                    <Button
                        variant="ghost"
                        onClick={resetFilters}
                        className="flex-1 h-12 rounded-[var(--ui-radius-md)] text-slate-400 text-[11px] font-black uppercase tracking-widest italic hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <RotateCcw size={14} />
                        Reset
                    </Button>
                    <Button
                        onClick={() => {
                            onApply();
                            onOpenChange(false);
                        }}
                        className="flex-[2] h-12 rounded-[var(--ui-radius-md)] bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-95 transition-all italic flex items-center justify-center gap-2"
                    >
                        Apply Ledger Filters
                    </Button>
                </div>
            </div>
        </div>
    );
}

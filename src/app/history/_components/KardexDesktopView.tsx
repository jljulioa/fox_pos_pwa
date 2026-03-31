import React from "react";
import { 
    ArrowUpRight, ArrowDownRight, Clock, Calendar, 
    Hash, Tag, ArrowRight, Eye, ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface KardexDesktopViewProps {
    transactions: any[];
    loading: boolean;
    page: number;
    setPage: (page: number) => void;
    totalCount: number;
    pageSize: number;
}

export function KardexDesktopView({ 
    transactions, 
    loading, 
    page, 
    setPage, 
    totalCount, 
    pageSize 
}: KardexDesktopViewProps) {
    return (
        <div className="bg-white rounded-[var(--ui-radius-xl)] border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
                <Table>
                    <TableHeader className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 border-b border-slate-200">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[180px] py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-center">Movement Type</TableHead>
                            <TableHead className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Product Specifications</TableHead>
                            <TableHead className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Timeline</TableHead>
                            <TableHead className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Traceability (Stock)</TableHead>
                            <TableHead className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-left">Ref Document</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((t) => (
                            <TableRow 
                                key={t.id} 
                                className="group border-b border-slate-100 hover:bg-slate-50/50 transition-all duration-200"
                            >
                                <TableCell className="py-3 px-6">
                                    <div className="flex items-center justify-center">
                                        <div className={cn(
                                            "w-10 h-10 rounded-[var(--ui-radius-md)] flex items-center justify-center transition-all shadow-inner",
                                            t.transaction_type === "sale" ? "bg-red-50 text-red-500 shadow-red-500/5 group-hover:bg-red-500 group-hover:text-white" : "bg-emerald-50 text-emerald-600 shadow-emerald-500/5 group-hover:bg-emerald-500 group-hover:text-white"
                                        )}>
                                            {t.transaction_type === "sale" ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 px-6">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[13px] font-black text-slate-700 uppercase italic tracking-tight group-hover:text-primary transition-colors leading-none truncate max-w-[240px]">
                                            {t.product_name || "UNKNOWN_COMPONENT"}
                                        </span>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className={cn(
                                                "px-2 py-0.5 text-[8px] font-black rounded-full uppercase tracking-tighter border",
                                                t.transaction_type === "sale" ? "bg-red-50/50 text-red-500 border-red-100 group-hover:bg-white" : "bg-emerald-50/50 text-emerald-600 border-emerald-100 group-hover:bg-white"
                                            )}>
                                                {t.transaction_type} protocol
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1 italic max-w-[150px]">
                                                {t.notes || "No extra context"}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 px-6">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-slate-300" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                                {new Date(t.transaction_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} className="text-slate-300" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                {new Date(t.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 px-6">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-3 bg-slate-50/80 px-3 py-1.5 rounded-md border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Pre</span>
                                                <span className="text-[11px] font-black text-slate-400">{t.stock_before}</span>
                                            </div>
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-sm",
                                                t.transaction_type === "sale" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                                            )}>
                                                <div className="font-black text-[9px]">
                                                    {t.transaction_type === "sale" ? "-" : "+"}{Math.abs(t.quantity_change)}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[8px] font-black text-primary uppercase tracking-tighter leading-none mb-0.5">Post</span>
                                                <span className="text-[12px] font-black text-primary italic underline decoration-primary/20 underline-offset-4">{t.stock_after}</span>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 px-6">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 text-slate-500 rounded-md border border-slate-100 group-hover:bg-white group-hover:border-primary/20 transition-all shadow-inner">
                                        <Hash size={10} className="text-primary/40" />
                                        <span className="text-[10px] font-black text-primary tracking-widest uppercase italic">
                                            {t.related_document_id || "SYSTEM_GEN"}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            <div className="px-6 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0 h-10">
                <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">
                        Sync Status: <span className="text-emerald-500">Online</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] italic hidden sm:inline leading-none">
                        Audit Ledger V4.2
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={page === 0 || loading}
                        onClick={() => setPage(page - 1)}
                        className="h-6 w-6 rounded-md text-slate-400 hover:text-primary hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                    >
                        <ChevronRight size={14} className="rotate-180" />
                    </Button>
                    <div className="min-w-[20px] h-6 flex items-center justify-center text-[10px] font-black text-primary italic px-2 bg-white border border-slate-200 rounded-md shadow-sm">
                        {page + 1}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={(page + 1) * pageSize >= totalCount || loading}
                        onClick={() => setPage(page + 1)}
                        className="h-6 w-6 rounded-md text-slate-400 hover:text-primary hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                    >
                        <ChevronRight size={14} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

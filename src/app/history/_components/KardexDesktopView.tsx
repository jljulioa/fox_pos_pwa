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
        <div className="flex-1 min-h-0 bg-white rounded-[var(--ui-radius-lg)] border border-slate-200 flex flex-col overflow-hidden shadow-sm">
            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                <Table>
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                        <TableRow className="hover:bg-transparent border-slate-200">
                            <TableHead className="w-[180px] text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 text-center">Movement Type</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11">Product Specifications</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11">Timeline</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11">Traceability (Stock)</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 text-left">Ref Document</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((t) => (
                            <TableRow 
                                key={t.id} 
                                className="group border-slate-100 hover:bg-slate-50/80 transition-colors"
                            >
                                <TableCell className="px-4 py-3">
                                    <div className="flex items-center justify-center">
                                        <div className={cn(
                                            "w-8 h-8 rounded-[var(--ui-radius-sm)] flex items-center justify-center transition-all shadow-sm",
                                            t.transaction_type === "sale" ? "bg-red-50 text-red-500 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                        )}>
                                            {t.transaction_type === "sale" ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-slate-900 leading-tight italic truncate max-w-[240px]">
                                            {t.product_name || "UNKNOWN_COMPONENT"}
                                        </span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={cn(
                                                "px-2 py-0.5 text-[8px] font-black rounded-full uppercase tracking-widest border",
                                                t.transaction_type === "sale" ? "bg-red-50/50 text-red-500 border-red-100" : "bg-emerald-50/50 text-emerald-600 border-emerald-100"
                                            )}>
                                                {t.transaction_type}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1 italic max-w-[150px]">
                                                {t.notes || "No extra context"}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={10} className="text-slate-300" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                                {new Date(t.transaction_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={10} className="text-slate-300" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                {new Date(t.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <div className="inline-flex items-center gap-3 bg-slate-50/50 px-2.5 py-1 rounded-[var(--ui-radius-sm)] border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[7px] font-black text-slate-400 uppercase leading-none mb-0.5">Pre</span>
                                            <span className="text-[10px] font-black text-slate-400 leading-none">{t.stock_before}</span>
                                        </div>
                                        <div className={cn(
                                            "w-5 h-5 rounded-full flex items-center justify-center transition-colors shadow-sm",
                                            t.transaction_type === "sale" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                                        )}>
                                            <div className="font-black text-[9px]">
                                                {t.transaction_type === "sale" ? "-" : "+"}{Math.abs(t.quantity_change)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[7px] font-black text-primary uppercase leading-none mb-0.5">Post</span>
                                            <span className="text-[11px] font-black text-primary italic leading-none">{t.stock_after}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-500 rounded-[var(--ui-radius-sm)] border border-slate-100 group-hover:bg-white transition-all">
                                        <Hash size={10} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-primary tracking-widest uppercase italic leading-none">
                                            {t.related_document_id || "SYSTEM_GEN"}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50/50 border-t border-slate-200 shrink-0 h-10">
                <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                        Viewing records {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalCount)} of {totalCount} total
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

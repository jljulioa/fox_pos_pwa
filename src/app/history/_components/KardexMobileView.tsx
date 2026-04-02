import React from "react";
import { 
    ArrowUpRight, ArrowDownRight, Clock, Calendar, 
    Hash, Tag, ArrowRight, Eye, ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface KardexMobileViewProps {
    transactions: any[];
    loading: boolean;
    page: number;
    setPage: (page: number) => void;
    totalCount: number;
    pageSize: number;
}

export function KardexMobileView({ 
    transactions, 
    loading, 
    page, 
    setPage, 
    totalCount, 
    pageSize 
}: KardexMobileViewProps) {
    return (
        <div className="space-y-3 pb-24 pr-1">
            {transactions.map((t) => (
                <div 
                    key={t.id}
                    className="bg-white rounded-[var(--ui-radius-lg)] border border-slate-200 overflow-hidden shadow-sm active:scale-[0.99] transition-all duration-300 group"
                >
                    <div className="p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-[var(--ui-radius-md)] flex items-center justify-center transition-all shadow-inner",
                                    t.transaction_type === "sale" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                                )}>
                                    {t.transaction_type === "sale" ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <h3 className="text-[14px] font-black text-slate-800 uppercase italic tracking-tight leading-none group-hover:text-primary transition-colors">
                                        {t.product_name || "UNKNOWN_PART"}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={10} className="text-slate-300" />
                                            <span className="text-[9px] font-black text-slate-400 tracking-tight uppercase italic">{new Date(t.transaction_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={10} className="text-slate-300" />
                                            <span className="text-[9px] font-bold text-slate-400 tracking-tight uppercase">{new Date(t.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={cn(
                                    "text-[18px] font-black italic tracking-tighter",
                                    t.transaction_type === "sale" ? "text-red-500" : "text-emerald-500"
                                )}>
                                    {t.transaction_type === "sale" ? "-" : "+"}{Math.abs(t.quantity_change)}
                                </div>
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">Units Delta</span>
                            </div>
                        </div>

                        <div className="bg-slate-50/50 rounded-[var(--ui-radius-md)] p-3 border border-slate-100 flex items-center justify-between group-hover:bg-primary/[0.02] transition-colors shadow-inner">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-center">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 opacity-60 italic">Opening</span>
                                    <span className="text-[14px] font-black text-slate-400">{t.stock_before}</span>
                                </div>
                                <ArrowRight size={14} className="text-slate-200" />
                                <div className="flex flex-col items-center">
                                    <span className="text-[8px] font-black text-primary uppercase tracking-widest leading-none mb-1 animate-pulse italic">Current</span>
                                    <span className="text-[16px] font-black text-primary underline decoration-primary/20 underline-offset-4">{t.stock_after}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={cn(
                                    "px-2 py-0.5 text-[8px] font-black rounded-full uppercase tracking-tighter border mb-1.5",
                                    t.transaction_type === "sale" ? "bg-red-50 text-red-500 border-red-100" : "bg-emerald-50 text-emerald-500 border-emerald-100"
                                )}>
                                    {t.transaction_type}
                                </span>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-100 rounded-md shadow-sm">
                                    <Hash size={9} className="text-primary/40" />
                                    <span className="text-[9px] font-black text-primary tracking-widest uppercase italic">{t.related_document_id || "SYS"}</span>
                                </div>
                            </div>
                        </div>

                        {t.notes && (
                            <div className="pb-1">
                                <p className="text-[10px] font-bold text-slate-400 italic leading-tight pl-2 border-l-2 border-slate-100">
                                    "{t.notes}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

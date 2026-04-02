import React from "react";
import { Eye, User, Receipt, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SalesMobileViewProps {
    sales: any[];
    loading: boolean;
    onViewSale: (sale: any) => void;
}

const paymentMethodColors: Record<string, string> = {
    Cash: "bg-emerald-50 text-emerald-600 border-emerald-200",
    "Credit Card": "bg-blue-50 text-blue-600 border-blue-200",
    "Debit Card": "bg-sky-50 text-sky-600 border-sky-200",
    Transfer: "bg-violet-50 text-violet-600 border-violet-200",
};

export function SalesMobileView({ sales, loading, onViewSale }: SalesMobileViewProps) {
    if (loading) {
        return (
            <div className="flex flex-col gap-3 px-4 pb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-36 rounded-[var(--ui-radius-xl)] bg-slate-100/60 animate-pulse border border-slate-200/50" />
                ))}
            </div>
        );
    }

    if (sales.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full opacity-30 py-20 px-4">
                <Receipt size={56} strokeWidth={1} className="text-slate-400 mb-3" />
                <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-600 italic">No Transactions Found</h3>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 px-4 pb-6">
            {sales.map((sale) => {
                const paymentStyle = paymentMethodColors[sale.payment_method] ?? "bg-slate-100 text-slate-500 border-slate-200";
                return (
                    <div
                        key={sale.id}
                        className="group bg-white rounded-[var(--ui-radius-xl)] p-4 border border-slate-200 hover:border-primary/20 hover:shadow-md transition-all duration-300"
                    >
                        {/* Top row */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-9 h-9 rounded-[var(--ui-radius-md)] bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner shrink-0">
                                    <User size={16} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[13px] font-black text-slate-800 uppercase italic tracking-tight truncate">
                                        {sale.customers?.name || "Walk-In Customer"}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ref:</span>
                                        <span className="text-[9px] font-black text-slate-500 tracking-widest italic">{sale.sale_ref || `#${String(sale.id).slice(-4).toUpperCase()}`}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onViewSale(sale)}
                                className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg hover:bg-primary/10 hover:border-primary/20 text-slate-400 hover:text-primary transition-all ml-2 shrink-0"
                            >
                                <ChevronRight size={15} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Info row */}
                        <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-50/70 rounded-[var(--ui-radius-md)] border border-slate-100">
                            <div>
                                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-0.5">Date</span>
                                <span className="text-[11px] font-black italic text-slate-700">
                                    {new Date(sale.date).toLocaleDateString()}
                                </span>
                            </div>
                            <div>
                                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-0.5">Time</span>
                                <span className="text-[11px] font-black italic text-slate-700">
                                    {new Date(sale.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                        </div>

                        {/* Bottom row: amount + payment */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <div>
                                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Total Amount</div>
                                <div className="text-[17px] font-black italic text-slate-800 leading-none">
                                    ${Number(sale.total_amount).toLocaleString()}
                                </div>
                            </div>
                            <span className={cn(
                                "px-2.5 py-1 text-[8px] font-black rounded-md uppercase tracking-widest border",
                                paymentStyle
                            )}>
                                {sale.payment_method}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

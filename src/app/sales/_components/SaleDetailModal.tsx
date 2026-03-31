import React from 'react';
import { 
    Receipt, X, User, CheckCircle2, LayoutGrid, Loader2, Undo, TrendingDown, Download, Printer, Hash, Calendar, Clock
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SaleDetailModalProps {
    selectedSale: any;
    setSelectedSale: (sale: any | null) => void;
    saleItems: any[];
    loadingItems: boolean;
    processReturn: boolean;
    handleReturn: (item: any) => void;
    handlePrintReceipt: () => void;
}

export function SaleDetailModal({
    selectedSale,
    setSelectedSale,
    saleItems,
    loadingItems,
    processReturn,
    handleReturn,
    handlePrintReceipt
}: SaleDetailModalProps) {
    if (!selectedSale) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-3xl rounded-[var(--ui-radius-lg)] shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-[var(--ui-radius-md)] text-primary">
                            <Receipt size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 leading-none">Sale Details</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {selectedSale.sale_ref}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedSale(null)}
                        className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                        <X size={16} strokeWidth={2.5} />
                    </Button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Top Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-50 rounded-[var(--ui-radius-md)] border border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                            <div className="flex items-center gap-2">
                                <User size={12} className="text-slate-400" />
                                <p className="text-[13px] font-bold text-slate-900 truncate">{selectedSale.customers?.name || "Walk-In"}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-[var(--ui-radius-md)] border border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment</p>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={12} className="text-green-500" />
                                <p className="text-[13px] font-bold text-slate-900">{selectedSale.payment_method}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-primary/5 rounded-[var(--ui-radius-md)] border border-primary/10">
                            <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="text-lg font-black text-primary italic leading-none">${Number(selectedSale.total_amount).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Timeline Info */}
                    <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 px-1">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" />
                            {new Date(selectedSale.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-400" />
                            {new Date(selectedSale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>

                    {/* Items Table Header */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                            <LayoutGrid size={12} />
                            <span>Items Breakdown</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        <div className="space-y-2">
                            {loadingItems ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-30">
                                    <Loader2 size={24} className="animate-spin text-primary" strokeWidth={2.5} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Loading Items...</p>
                                </div>
                            ) : (
                                saleItems.map(item => (
                                    <div key={item.id} className="group flex items-center justify-between p-3 bg-white rounded-[var(--ui-radius-md)] border border-slate-100 hover:border-slate-200 transition-colors">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-8 h-8 bg-slate-50 rounded-[var(--ui-radius-sm)] flex items-center justify-center font-bold text-slate-500 text-[11px] border border-slate-100 shrink-0">
                                                {item.quantity}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[13px] font-bold text-slate-900 truncate leading-tight">{item.products.name}</p>
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">SKU: {item.products.sku}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-right shrink-0">
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Price</p>
                                                <p className="text-[13px] font-bold text-slate-900 italic">${Number(item.unit_price).toLocaleString()}</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                disabled={processReturn}
                                                onClick={() => handleReturn(item)}
                                                className="h-8 w-8 rounded-[var(--ui-radius-sm)] border-red-50 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all opacity-0 group-hover:opacity-100"
                                                title="Process Return"
                                            >
                                                <Undo size={14} strokeWidth={2.5} />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Printer size={14} strokeWidth={2.5} />
                        <p className="text-[10px] font-semibold italic">Ready for printing</p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline"
                            onClick={handlePrintReceipt}
                            className="h-9 px-4 rounded-[var(--ui-radius-md)] font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 bg-white border-slate-200"
                        >
                            <Download size={14} strokeWidth={2.5} />
                            Print Invoice
                        </Button>
                        <Button
                            onClick={() => setSelectedSale(null)}
                            className="h-9 px-6 rounded-[var(--ui-radius-md)] font-bold text-[11px] uppercase tracking-widest italic shadow-sm"
                        >
                            Close Ticket
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

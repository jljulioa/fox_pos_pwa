import React from 'react';
import { 
    Receipt, X, User, CheckCircle2, LayoutGrid, Loader2, Undo, TrendingDown, Download 
} from "lucide-react";

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
        <div className="fixed inset-0 bg-primary/10 backdrop-blur-xl flex items-center justify-center z-[100] p-4 lg:p-10 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl border border-primary/10 overflow-hidden relative flex flex-col h-full max-h-[85vh] animate-in zoom-in-95 duration-500">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-40 -mt-40" />

                {/* Modal Header */}
                <div className="p-6 md:p-8 lg:p-12 border-b border-primary/5 relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-xl md:rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-primary/20 shrink-0">
                                    <Receipt size={24} strokeWidth={1.5} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xl md:text-3xl font-black text-primary tracking-tight italic uppercase truncate">Sale Ticket</h2>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <span className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em] md:tracking-[0.3em] font-mono truncate">{selectedSale.sale_ref}</span>
                                        <span className="w-1 h-1 bg-primary/20 rounded-full shrink-0" />
                                        <span className="text-[8px] md:text-[10px] font-black text-accent uppercase tracking-widest shrink-0">Finalized</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedSale(null)}
                            className="p-3 md:p-4 bg-secondary text-primary rounded-xl md:rounded-[1.5rem] hover:scale-110 active:scale-95 transition-all shadow-sm shrink-0"
                        >
                            <X size={20} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 space-y-8 md:space-y-12 custom-scrollbar relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                        <div className="p-4 md:p-6 glass-dark rounded-[1.5rem] md:rounded-[2rem] border-primary/5 space-y-1 md:space-y-2">
                            <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Client Information</p>
                            <div className="flex items-center gap-2 md:gap-3">
                                <User size={16} className="text-primary shrink-0" strokeWidth={1.5} />
                                <p className="text-xs md:text-sm font-black text-primary uppercase italic truncate">{selectedSale.customers?.name || "Walk-In Service"}</p>
                            </div>
                        </div>
                        <div className="p-4 md:p-6 glass-dark rounded-[1.5rem] md:rounded-[2rem] border-primary/5 space-y-1 md:space-y-2">
                            <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Transaction Mode</p>
                            <div className="flex items-center gap-2 md:gap-3">
                                <CheckCircle2 size={16} className="text-accent shrink-0" strokeWidth={1.5} />
                                <p className="text-xs md:text-sm font-black text-primary uppercase italic">{selectedSale.payment_method}</p>
                            </div>
                        </div>
                        <div className="p-4 md:p-6 bg-primary rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-primary/20 space-y-0.5 md:space-y-1">
                            <p className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Grand Total</p>
                            <p className="text-2xl md:text-3xl font-black text-white italic tracking-tighter">${Number(selectedSale.total_amount).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.2em]">
                            <LayoutGrid size={16} strokeWidth={1.5} />
                            <span>Detailed Item Summary</span>
                            <div className="flex-1 h-px bg-primary/5" />
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            {loadingItems ? (
                                <div className="py-10 md:py-20 flex flex-col items-center justify-center gap-4 opacity-20">
                                    <Loader2 size={32} className="animate-spin text-primary" strokeWidth={1.5} />
                                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Retrieving payload...</p>
                                </div>
                            ) : (
                                saleItems.map(item => (
                                    <div key={item.id} className="group flex flex-col sm:flex-row items-center justify-between p-4 md:p-6 bg-[#F8F9FA] rounded-[1.5rem] md:rounded-[2rem] border border-primary/5 hover:border-primary/20 transition-all gap-4">
                                        <div className="flex items-center gap-4 md:gap-6 w-full">
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center font-black text-primary text-xs md:text-sm shadow-sm border border-primary/5 shrink-0">
                                                {item.quantity}x
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm md:text-base font-black text-primary uppercase italic leading-tight group-hover:text-accent transition-colors truncate">{item.products.name}</p>
                                                <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                                    <span className="truncate">SKU: {item.products.sku}</span>
                                                    <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
                                                    <span>Stock: {item.products.stock}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-10 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-primary/5">
                                            <div className="text-left sm:text-right">
                                                <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase opacity-40">Unit Price</p>
                                                <p className="text-base md:text-lg font-black text-primary italic">${Number(item.unit_price).toLocaleString()}</p>
                                            </div>
                                            <button
                                                disabled={processReturn}
                                                onClick={() => handleReturn(item)}
                                                className="p-3 md:p-4 bg-white text-red-600 rounded-xl md:rounded-2xl shadow-sm border border-red-100 hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-20 group/btn"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Undo size={16} strokeWidth={1.5} />
                                                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest hidden sm:block">Return</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 md:p-8 lg:px-12 lg:py-10 bg-[#F1F5F9] border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 relative z-10 shrink-0 mt-auto">
                    <div className="flex items-center gap-3 text-primary/40 text-center md:text-left">
                        <TrendingDown size={18} strokeWidth={1.5} className="shrink-0" />
                        <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] max-w-[280px]">Inventory updates processed automatically.</p>
                    </div>
                    <div className="flex gap-3 md:gap-4 w-full md:w-auto">
                        <button 
                            onClick={handlePrintReceipt}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-4 md:py-5 bg-white text-primary rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-widest shadow-sm hover:scale-105 active:scale-95 transition-all"
                        >
                            <Download size={18} strokeWidth={1.5} />
                            <span>Print</span>
                        </button>
                        <button
                            onClick={() => setSelectedSale(null)}
                            className="flex-1 md:flex-none px-8 md:px-12 py-4 md:py-5 bg-primary text-white rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all italic"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

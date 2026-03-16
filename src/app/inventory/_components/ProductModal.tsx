import React from 'react';
import { 
    Edit3, Plus, X, Tag, Layers, Hash, FileText, DollarSign, Receipt, Loader2, CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductModalProps {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    isEditing: boolean;
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    categories: any[];
    handleSubmit: (e: React.FormEvent) => void;
    submitting: boolean;
}

export function ProductModal({
    showModal,
    setShowModal,
    isEditing,
    formData,
    setFormData,
    categories,
    handleSubmit,
    submitting
}: ProductModalProps) {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-xl flex items-center justify-center z-[100] p-4 lg:p-10 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-primary/10 overflow-hidden relative flex flex-col h-fit max-h-[85vh] md:max-h-[90vh] animate-in zoom-in-95 duration-500">
                {/* Modal Header */}
                <div className="p-6 md:p-8 lg:p-10 border-b border-primary/5 flex items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-primary text-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl shadow-primary/30 shrink-0">
                            {isEditing ? <Edit3 className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} /> : <Plus className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-lg md:text-2xl font-black text-primary uppercase italic tracking-tight truncate">
                                {isEditing ? "Modify Catalog Entry" : "Register Spare Part"}
                            </h3>
                            <p className="text-[9px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60 truncate">
                                {isEditing ? `System UID: ${formData.id.split('-')[0]}...` : "System-wide inventory integration"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(false)}
                        className="p-2.5 md:p-3 bg-secondary/50 text-primary rounded-xl md:rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 shrink-0"
                    >
                        <X size={18} strokeWidth={1.5} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="md:col-span-2 space-y-1.5 md:space-y-2">
                            <label className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Product Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-5 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary text-sm md:text-base"
                                placeholder="e.g. Master Brake Pad HD"
                            />
                        </div>

                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Brand / Manufacturer</label>
                            <div className="relative">
                                <Tag className="w-3 h-3 md:w-4 md:h-4 absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-primary/40" strokeWidth={1.5} />
                                <input
                                    required
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                    className="w-full pl-10 pr-5 py-3 md:pl-12 md:pr-6 md:py-4 rounded-2xl md:rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary text-sm md:text-base"
                                    placeholder="Brand Name"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Workshop Category</label>
                            <div className="relative">
                                <Layers className="w-3 h-3 md:w-4 md:h-4 absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-primary/40" strokeWidth={1.5} />
                                <select
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full pl-10 pr-8 py-3 md:pl-12 md:pr-10 md:py-4 rounded-2xl md:rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary appearance-none cursor-pointer text-sm md:text-base"
                                >
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Internal SKU Code</label>
                            <div className="relative">
                                <Hash className="w-3 h-3 md:w-4 md:h-4 absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-primary/40" strokeWidth={1.5} />
                                <input
                                    disabled={!isEditing}
                                    value={isEditing ? formData.sku : "AUTO-GENERATING..."}
                                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                    className="w-full pl-10 pr-5 py-3 md:pl-12 md:pr-6 md:py-4 rounded-2xl md:rounded-3xl bg-secondary/40 border-none focus:ring-2 focus:ring-primary/20 transition-all font-black italic text-primary/60 cursor-not-allowed text-xs md:text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Manuf. Reference</label>
                            <div className="relative">
                                <FileText className="w-3 h-3 md:w-4 md:h-4 absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-primary/40" strokeWidth={1.5} />
                                <input
                                    value={formData.reference}
                                    onChange={e => setFormData({ ...formData, reference: e.target.value })}
                                    className="w-full pl-10 pr-5 py-3 md:pl-12 md:pr-6 md:py-4 rounded-2xl md:rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary text-sm md:text-base"
                                    placeholder="REF-00X"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 p-5 md:p-8 bg-primary/5 rounded-[1.5rem] md:rounded-[2.5rem] border border-primary/10">
                            <div className="space-y-1.5 md:space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] ml-2">Purchase Cost</label>
                                <div className="relative">
                                    <span className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 font-black text-primary/40 text-sm md:text-base">$</span>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={formData.cost}
                                        onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                        className="w-full pl-8 pr-5 py-3 md:pl-10 md:pr-6 md:py-4 rounded-2xl md:rounded-3xl bg-white border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary text-sm md:text-base"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 md:space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic underline decoration-accent underline-offset-4 md:underline-offset-8">Public Retail Price</label>
                                <div className="relative">
                                    <DollarSign className="w-4 h-4 md:w-5 md:h-5 absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-accent" strokeWidth={1.5} />
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full pl-10 pr-5 py-3 md:pl-12 md:pr-6 md:py-4 rounded-2xl md:rounded-3xl bg-white shadow-lg md:shadow-xl shadow-primary/5 border-none focus:ring-2 focus:ring-accent transition-all font-black text-lg md:text-2xl text-accent italic"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                            <div className="col-span-2 sm:col-span-1 space-y-1.5 md:space-y-2 p-4 md:p-6 bg-secondary/20 rounded-[1.5rem] md:rounded-[2rem]">
                                <label className="text-[9px] md:text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] block text-center mb-1 md:mb-2">Available Stock</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full py-3 md:py-4 bg-white rounded-xl md:rounded-2xl border-none text-center text-xl md:text-2xl font-black text-primary italic shadow-inner"
                                />
                            </div>
                            <div className="space-y-1.5 md:space-y-2 p-4 md:p-6 bg-secondary/10 rounded-[1.5rem] md:rounded-[2rem]">
                                <label className="text-[9px] md:text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] block text-center mb-1 md:mb-2">Minimum</label>
                                <input
                                    type="number"
                                    value={formData.min_stock}
                                    onChange={e => setFormData({ ...formData, min_stock: e.target.value })}
                                    className="w-full py-3 md:py-4 bg-white/50 rounded-xl md:rounded-2xl border-none text-center text-base md:text-xl font-bold text-primary/60 shadow-inner"
                                />
                            </div>
                            <div className="space-y-1.5 md:space-y-2 p-4 md:p-6 bg-secondary/10 rounded-[1.5rem] md:rounded-[2rem]">
                                <label className="text-[9px] md:text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] block text-center mb-1 md:mb-2">Maximum</label>
                                <input
                                    type="number"
                                    value={formData.max_stock}
                                    onChange={e => setFormData({ ...formData, max_stock: e.target.value })}
                                    className="w-full py-3 md:py-4 bg-white/50 rounded-xl md:rounded-2xl border-none text-center text-base md:text-xl font-bold text-primary/60 shadow-inner"
                                />
                            </div>
                        </div>

                        <div
                            onClick={() => setFormData({ ...formData, taxable: !formData.taxable })}
                            className={cn(
                                "md:col-span-2 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between group",
                                formData.taxable ? "bg-accent/5 border-accent/20" : "bg-red-50/50 border-red-100"
                            )}
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className={cn(
                                    "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-colors shrink-0",
                                    formData.taxable ? "bg-accent text-white" : "bg-red-100 text-red-500"
                                )}>
                                    <Receipt size={20} strokeWidth={1.5} />
                                </div>
                                <div className="min-w-0 pr-2">
                                    <p className={cn(
                                        "text-xs md:text-sm font-black uppercase tracking-widest truncate",
                                        formData.taxable ? "text-accent" : "text-red-500"
                                    )}>{formData.taxable ? "Taxable Product" : "Tax Exempt"}</p>
                                    <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase opacity-60 truncate">Apply government sales tax on checkout</p>
                                </div>
                            </div>
                            <div className={cn(
                                "w-12 md:w-14 h-6 md:h-8 rounded-full relative transition-all shadow-inner border shrink-0",
                                formData.taxable ? "bg-accent border-accent/20" : "bg-red-100 border-red-200"
                            )}>
                                <div className={cn(
                                    "absolute top-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-all shadow-md shadow-black/10",
                                    formData.taxable ? "left-7 md:left-7" : "left-1"
                                )} />
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 md:p-8 lg:p-10 border-t border-primary/5 bg-secondary/10 flex flex-col-reverse sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8 -mx-6 md:-mx-8 lg:-mx-10 -mb-6 md:-mb-8 lg:-mb-10">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="w-full sm:flex-1 py-4 md:py-5 rounded-2xl md:rounded-[1.5rem] border border-primary/10 font-black text-[10px] md:text-xs uppercase tracking-widest text-primary/40 hover:bg-white transition-all active:scale-95"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full sm:flex-[2] py-4 md:py-5 bg-primary text-white rounded-2xl md:rounded-[1.5rem] font-black text-xs md:text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} strokeWidth={1.5} />}
                            <span className="truncate">{isEditing ? "Update Catalog" : "Commit to Inventory"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

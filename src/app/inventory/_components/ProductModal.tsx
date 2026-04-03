import React from 'react';
import {
    X, DollarSign, Receipt, Loader2, Package, Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const FieldLabel = ({ children, accent }: { children: React.ReactNode; accent?: boolean }) => (
    <span className={cn(
        "text-[9px] font-black uppercase tracking-widest italic ml-0.5",
        accent ? "text-primary/70" : "text-slate-400"
    )}>
        {children}
    </span>
);

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
        <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
            <div className="bg-white w-full max-w-lg rounded-[var(--ui-radius-lg)] shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">

                {/* ── Header ── */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-[var(--ui-radius-md)]",
                            isEditing ? "bg-primary/10 text-primary" : "bg-primary/10 text-primary"
                        )}>
                            <Package size={18} strokeWidth={2.5} className={cn(!isEditing && "animate-pulse")} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase italic tracking-tight leading-none">
                                {isEditing ? "Modify Catalog Item" : "Register New Product"}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {isEditing
                                    ? `UID: ${formData.id?.split('-')[0] || "REF"}…`
                                    : "Inventory Deployment Module"}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
                    >
                        <X size={16} strokeWidth={2.5} />
                    </Button>
                </div>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-4">

                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name"><FieldLabel>Specification Name *</FieldLabel></Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. Master Brake Pad HD"
                                className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-700"
                            />
                        </div>

                        {/* Brand + Category */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="brand"><FieldLabel>Manufacturer *</FieldLabel></Label>
                                <Input
                                    id="brand"
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                    required
                                    placeholder="Brand name"
                                    className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-700"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="category_id"><FieldLabel>Category</FieldLabel></Label>
                                <select
                                    id="category_id"
                                    value={formData.category_id?.toString() || ""}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer"
                                >
                                    <option value="">Select category…</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* SKU + Reference */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="sku"><FieldLabel>Reference SKU</FieldLabel></Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder={!isEditing ? "AUTO-GEN" : "SKU-0000"}
                                    className="h-10 bg-slate-50 border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-black text-slate-400 uppercase"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="reference"><FieldLabel>Manuf. Code</FieldLabel></Label>
                                <Input
                                    id="reference"
                                    value={formData.reference}
                                    onChange={e => setFormData({ ...formData, reference: e.target.value })}
                                    placeholder="REF-00X"
                                    className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-700 uppercase"
                                />
                            </div>
                        </div>

                        {/* Pricing — tinted section */}
                        <div className="p-4 bg-slate-50 rounded-[var(--ui-radius-lg)] border border-slate-200/80 space-y-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-1.5">
                                <DollarSign size={10} /> Pricing Configuration
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="cost"><FieldLabel>Purchase Cost *</FieldLabel></Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[12px]">$</span>
                                        <Input
                                            id="cost"
                                            type="number"
                                            step="0.01"
                                            value={formData.cost}
                                            onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                            required
                                            className="h-10 pl-7 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-700"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="price"><FieldLabel accent>Retail Price *</FieldLabel></Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-black text-[13px]">$</span>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            className="h-10 pl-7 bg-white border-primary/20 shadow-sm shadow-primary/5 rounded-[var(--ui-radius-md)] text-[14px] font-black text-primary italic"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stock levels */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: "stock", label: "Current *", key: "stock", cls: "font-black text-slate-900 text-center" },
                                { id: "min_stock", label: "Min Level", key: "min_stock", cls: "font-bold text-slate-500 text-center" },
                                { id: "max_stock", label: "Max Level", key: "max_stock", cls: "font-bold text-slate-500 text-center" },
                            ].map(f => (
                                <div key={f.id} className="space-y-1.5">
                                    <Label htmlFor={f.id} className="block text-center"><FieldLabel>{f.label}</FieldLabel></Label>
                                    <Input
                                        id={f.id}
                                        type="number"
                                        value={formData[f.key]}
                                        onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                        required={f.id === "stock"}
                                        className={cn("h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px]", f.cls)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Taxable toggle */}
                        <div
                            onClick={() => setFormData({ ...formData, taxable: !formData.taxable })}
                            className={cn(
                                "p-3 rounded-[var(--ui-radius-lg)] border transition-all cursor-pointer flex items-center justify-between",
                                formData.taxable ? "bg-emerald-50/60 border-emerald-100" : "bg-slate-50 border-slate-200"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-8 h-8 rounded-[var(--ui-radius-sm)] flex items-center justify-center transition-colors",
                                    formData.taxable ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400"
                                )}>
                                    <Receipt size={14} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className={cn(
                                        "text-[10px] font-black uppercase tracking-widest",
                                        formData.taxable ? "text-emerald-700" : "text-slate-500"
                                    )}>
                                        {formData.taxable ? "Taxable Asset" : "Non-Taxable"}
                                    </p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Apply standard sales tax</p>
                                </div>
                            </div>
                            {/* Toggle pill */}
                            <div className={cn(
                                "w-10 h-5 rounded-full relative transition-all shadow-inner border shrink-0",
                                formData.taxable ? "bg-emerald-500 border-emerald-400" : "bg-slate-300 border-slate-200"
                            )}>
                                <div className={cn(
                                    "absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-sm",
                                    formData.taxable ? "left-6" : "left-0.5"
                                )} />
                            </div>
                        </div>
                    </form>
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                    <p className="text-[10px] font-semibold italic text-slate-400">* Required fields</p>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowModal(false)}
                            disabled={submitting}
                            className="h-9 px-4 rounded-[var(--ui-radius-md)] font-bold text-[11px] uppercase tracking-widest bg-white border-slate-200 text-slate-500"
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            form="product-form"
                            disabled={submitting}
                            className="h-9 px-6 text-white text-[11px] font-black uppercase tracking-widest rounded-[var(--ui-radius-md)] bg-primary shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 italic"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} strokeWidth={2.5} />}
                            {isEditing ? "Sync Changes" : "Register Item"}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}

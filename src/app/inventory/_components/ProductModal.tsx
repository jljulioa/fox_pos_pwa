import React from 'react';
import { 
    Edit3, Plus, X, Tag, Layers, Hash, FileText, DollarSign, Receipt, Loader2, CheckCircle2, Package, Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white border-slate-200 rounded-[var(--ui-radius-xl)] shadow-2xl">
                <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-[var(--ui-radius-md)] flex items-center justify-center shadow-sm",
                            isEditing ? "bg-blue-50 text-blue-600" : "bg-primary/5 text-primary"
                        )}>
                            <Package size={20} className={cn(!isEditing && "animate-pulse")} />
                        </div>
                        <div>
                            <DialogTitle className="text-[14px] font-black text-slate-900 uppercase tracking-tight italic leading-none">
                                {isEditing ? "Modify Catalog Item" : "Register New Component"}
                            </DialogTitle>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 inline-block">
                                {isEditing ? `System UID: ${formData.id?.split('-')[0] || "REF"}...` : "Inventory Deployment Module"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Specification Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. Master Brake Pad HD"
                                className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-600 focus:ring-primary/10 italic"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="brand" className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Manufacturer</Label>
                                <Input
                                    id="brand"
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                    required
                                    placeholder="Brand Name"
                                    className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-600 focus:ring-primary/10 italic"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="category" className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Category</Label>
                                <Select 
                                    value={formData.category_id?.toString()} 
                                    onValueChange={val => setFormData({ ...formData, category_id: val })}
                                >
                                    <SelectTrigger className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-600 focus:ring-primary/10 italic">
                                        <SelectValue placeholder="Select Category">
                                            {categories.find(c => c.id.toString() === formData.category_id?.toString())?.name || "Select Category"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-[var(--ui-radius-md)] border-slate-200 shadow-xl z-[110]">
                                        {categories.map((cat) => (
                                            <SelectItem 
                                                key={cat.id} 
                                                value={cat.id.toString()}
                                                className="text-[12px] font-bold text-slate-600 focus:bg-primary/5 focus:text-primary italic"
                                            >
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="sku" className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Reference SKU</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder={!isEditing ? "AUTO-GEN" : "SKU-0000"}
                                    className="h-10 bg-slate-50/50 border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-black text-slate-400 focus:ring-primary/10 uppercase"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="reference" className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Manuf. Code</Label>
                                <Input
                                    id="reference"
                                    value={formData.reference}
                                    onChange={e => setFormData({ ...formData, reference: e.target.value })}
                                    placeholder="REF-00X"
                                    className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-600 focus:ring-primary/10 italic uppercase"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/80 rounded-[var(--ui-radius-lg)] border border-slate-200/60">
                            <div className="space-y-1.5">
                                <Label htmlFor="cost" className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Purchase Cost</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[12px]">$</span>
                                    <Input
                                        id="cost"
                                        type="number"
                                        step="0.01"
                                        value={formData.cost}
                                        onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                        required
                                        className="h-10 pl-7 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-600 focus:ring-primary/10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="price" className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic ml-1 underline decoration-blue-200 underline-offset-4">Retail Price</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 font-black text-[14px]">$</span>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        className="h-10 pl-7 bg-white border-blue-100 shadow-sm shadow-blue-500/5 rounded-[var(--ui-radius-md)] text-[15px] font-black text-blue-600 focus:ring-blue-500/20 italic"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="stock" className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Current</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    required
                                    className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-black text-slate-900 text-center"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="min_stock" className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1 text-center block">Min</Label>
                                <Input
                                    id="min_stock"
                                    type="number"
                                    value={formData.min_stock}
                                    onChange={e => setFormData({ ...formData, min_stock: e.target.value })}
                                    className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-500 text-center"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="max_stock" className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1 text-center block">Max</Label>
                                <Input
                                    id="max_stock"
                                    type="number"
                                    value={formData.max_stock}
                                    onChange={e => setFormData({ ...formData, max_stock: e.target.value })}
                                    className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-500 text-center"
                                />
                            </div>
                        </div>

                        <div 
                            onClick={() => setFormData({ ...formData, taxable: !formData.taxable })}
                            className={cn(
                                "p-3 rounded-[var(--ui-radius-lg)] border transition-all cursor-pointer flex items-center justify-between group",
                                formData.taxable ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50 border-slate-200"
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
                                    )}>{formData.taxable ? "Taxable Asset" : "Non-Taxable"}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Apply standard sales tax</p>
                                </div>
                            </div>
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

                        <div className="pt-4 flex items-center justify-end gap-3 mt-6">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowModal(false)}
                                disabled={submitting}
                                className="h-10 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-[var(--ui-radius-md)] transition-all"
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="h-10 px-8 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-[var(--ui-radius-md)] shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center gap-2.5 italic"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} strokeWidth={2.5} />}
                                {isEditing ? "Sync Changes" : "Register Item"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

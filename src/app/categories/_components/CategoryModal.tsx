import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutGrid, Hash, X, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryModalProps {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    isEditing: boolean;
    formData: any;
    setFormData: (data: any) => void;
    taxes: any[];
    handleSubmit: (e: React.FormEvent) => void;
    submitting: boolean;
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[9px] font-black uppercase tracking-widest italic ml-0.5 text-slate-400">
        {children}
    </span>
);

export function CategoryModal({
    showModal,
    setShowModal,
    isEditing,
    formData,
    setFormData,
    taxes,
    handleSubmit,
    submitting,
}: CategoryModalProps) {
    if (!showModal) return null;

    return (
        <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
            <div className="bg-white w-full max-w-[460px] rounded-[var(--ui-radius-lg)] shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">

                {/* ── Header ── */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-[var(--ui-radius-md)]",
                            isEditing ? "bg-blue-50 text-blue-600" : "bg-primary/10 text-primary"
                        )}>
                            <LayoutGrid size={18} strokeWidth={2.5} className={cn(!isEditing && "animate-pulse")} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase italic tracking-tight leading-none">
                                {isEditing ? "Modify Classification" : "New Category"}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {isEditing
                                    ? `UID: ${formData.id?.split('-')[0] || "REF"}…`
                                    : "Category Deployment Module"}
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
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <form id="category-form" onSubmit={handleSubmit} className="space-y-4">

                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label><FieldLabel>Classification Name *</FieldLabel></Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Braking Systems"
                                className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-700"
                            />
                        </div>

                        {/* SKU Slug + Tax */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label><FieldLabel>SKU Slug Prefix *</FieldLabel></Label>
                                <div className="relative">
                                    <Input
                                        required
                                        maxLength={4}
                                        value={formData.sku_slug}
                                        onChange={e => setFormData({ ...formData, sku_slug: e.target.value.toUpperCase() })}
                                        placeholder="MOT"
                                        className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-black text-slate-700 tracking-widest uppercase pr-8"
                                    />
                                    <Hash size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label><FieldLabel>Taxation Layer</FieldLabel></Label>
                                <select
                                    value={formData.tax_id}
                                    onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer"
                                >
                                    {taxes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label><FieldLabel>Description</FieldLabel></Label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                placeholder="Describe the inventory group context..."
                                className="w-full p-3 bg-white border border-slate-200 rounded-[var(--ui-radius-md)] text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none transition-all"
                            />
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
                            form="category-form"
                            disabled={submitting}
                            className={cn(
                                "h-9 px-6 text-white text-[11px] font-black uppercase tracking-widest rounded-[var(--ui-radius-md)] shadow-lg active:scale-[0.98] transition-all flex items-center gap-2 italic",
                                isEditing
                                    ? "bg-blue-600 shadow-blue-500/20 hover:opacity-90"
                                    : "bg-primary shadow-primary/20 hover:opacity-90"
                            )}
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} strokeWidth={2.5} />}
                            {isEditing ? "Sync Definition" : "Commit Node"}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}

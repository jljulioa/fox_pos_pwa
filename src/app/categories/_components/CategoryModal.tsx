import React from "react";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Tag, Hash, Receipt, FileText, LayoutGrid, Loader2, Save 
} from "lucide-react";
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
    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white border-slate-200 rounded-[var(--ui-radius-xl)] shadow-2xl">
                <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-[var(--ui-radius-md)] flex items-center justify-center shadow-sm",
                            isEditing ? "bg-blue-50 text-blue-600" : "bg-primary/5 text-primary"
                        )}>
                            <LayoutGrid size={20} className={cn(!isEditing && "animate-pulse")} />
                        </div>
                        <div>
                            <DialogTitle className="text-[14px] font-black text-slate-900 uppercase tracking-tight italic leading-none">
                                {isEditing ? "Modify Classification" : "New Taxonomy Node"}
                            </DialogTitle>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 inline-block">
                                {isEditing ? `System UID: ${formData.id?.split('-')[0] || "REF"}...` : "Category Deployment Module"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Classification Name</Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Braking Systems"
                                className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-600 focus:ring-primary/10 italic"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">SKU Slug Prefix</Label>
                                <div className="relative">
                                    <Input
                                        required
                                        maxLength={4}
                                        value={formData.sku_slug}
                                        onChange={e => setFormData({ ...formData, sku_slug: e.target.value.toUpperCase() })}
                                        placeholder="MOT"
                                        className="h-10 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-black text-slate-600 focus:ring-primary/10 tracking-widest uppercase italic"
                                    />
                                    <Hash size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Taxation Layer</Label>
                                <select
                                    value={formData.tax_id}
                                    onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
                                    className="w-full h-10 px-3 flex items-center bg-white border border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10 italic appearance-none cursor-pointer"
                                >
                                    {taxes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Classification Manifest</Label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                placeholder="Describe the inventory group context..."
                                className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-[var(--ui-radius-lg)] text-[12px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10 italic resize-none transition-all"
                            />
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
                                className={cn(
                                    "h-10 px-8 text-white text-[11px] font-black uppercase tracking-widest rounded-[var(--ui-radius-md)] shadow-lg active:scale-[0.98] transition-all flex items-center gap-2.5 italic",
                                    isEditing ? "bg-blue-600 shadow-blue-500/20 hover:shadow-blue-500/30" : "bg-primary shadow-primary/20 hover:shadow-primary/30"
                                )}
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} strokeWidth={2.5} />}
                                {isEditing ? "Sync Definition" : "Commit Node"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

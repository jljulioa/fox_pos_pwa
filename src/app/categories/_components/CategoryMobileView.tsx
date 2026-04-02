import React from "react";
import { 
    Edit3, Trash2, Tag, Hash, Receipt, Info, 
    LayoutGrid, ArrowRight, Layers 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CategoryMobileViewProps {
    categories: any[];
    onEdit: (category: any) => void;
    onDelete: (id: string, name: string) => void;
}

export function CategoryMobileView({ categories, onEdit, onDelete }: CategoryMobileViewProps) {
    return (
        <div className="space-y-3 pb-24">
            {categories.map((category) => (
                <div 
                    key={category.id}
                    className="bg-white rounded-[var(--ui-radius-lg)] border border-slate-200 overflow-hidden shadow-sm active:scale-[0.99] transition-all duration-300 group"
                >
                    <div className="p-4 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[var(--ui-radius-md)] bg-slate-100 flex items-center justify-center text-slate-400 font-bold shadow-inner">
                                    <Tag size={18} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <h3 className="text-[14px] font-black text-slate-800 uppercase italic tracking-tight leading-none group-hover:text-primary transition-colors">
                                        {category.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Hash size={9} className="text-slate-300" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{category.sku_slug}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(category)}
                                    className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                                >
                                    <Edit3 size={14} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(category.id, category.name)}
                                    className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </div>

                        {category.description && (
                            <div className="bg-slate-50 rounded-[var(--ui-radius-sm)] p-3 border border-slate-100 relative group-hover:bg-primary/[0.02] group-hover:border-primary/10 transition-all">
                                <p className="text-[11px] font-bold text-slate-500 leading-normal italic line-clamp-2">
                                    {category.description}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-emerald-50 rounded-[var(--ui-radius-sm)] text-emerald-600 border border-emerald-100/50">
                                    <Receipt size={12} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Rule Application</span>
                                    <span className="text-[10px] font-black text-slate-600 uppercase italic tracking-tight">
                                        {category.taxes?.name || "Standard Rule"} ({category.taxes?.rate || 0}%)
                                    </span>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-primary/10 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            
            {categories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 px-6">
                    <Layers size={48} className="text-slate-400 mb-4" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-1">Hierarchy Null</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest tracking-tighter italic">No classifications found in system</p>
                </div>
            )}
        </div>
    );
}

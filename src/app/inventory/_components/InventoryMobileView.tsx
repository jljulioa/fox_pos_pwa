"use client";

import {
    Edit3,
    Trash2,
    Hash,
    Box
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface InventoryMobileViewProps {
    products: any[];
    loading: boolean;
    onEdit: (product: any) => void;
    onDelete: (id: string, name: string) => void;
}

export function InventoryMobileView({ products, loading, onEdit, onDelete }: InventoryMobileViewProps) {
    if (loading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-16 rounded-[var(--ui-radius-md)] bg-white animate-pulse shadow-sm border border-slate-100" />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30 w-full">
                <Box size={60} strokeWidth={1} className="text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-primary">No products found</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 pb-8 mb-20">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="bg-white rounded-[var(--ui-radius-md)] p-3.5 shadow-sm border border-slate-200 active:scale-[0.98] transition-all flex flex-col gap-3"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] font-black text-slate-400 italic">#{product.sku?.slice(-6) || "N/A"}</span>
                                <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded border border-slate-100">
                                    {product.product_categories?.name || "General"}
                                </span>
                            </div>
                            <h3 className="text-[13px] font-bold text-slate-900 leading-tight italic truncate">
                                {product.name}
                            </h3>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[15px] font-black text-slate-900 italic tracking-tight">
                                ${Number(product.price).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                parseInt(product.stock) <= (product.min_stock || 5) ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                            )}>
                                {product.stock} in stock
                            </div>
                        </div>

                        <div className="flex gap-1.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(product)}
                                className="h-8 w-8 bg-slate-50 text-slate-400 rounded-[var(--ui-radius-sm)] border border-slate-100 shadow-none"
                            >
                                <Edit3 size={14} strokeWidth={2.5} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(product.id, product.name)}
                                className="h-8 w-8 bg-slate-50 text-slate-400 rounded-[var(--ui-radius-sm)] border border-slate-100 shadow-none hover:text-red-500 hover:bg-white transition-colors"
                            >
                                <Trash2 size={14} strokeWidth={2.5} />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

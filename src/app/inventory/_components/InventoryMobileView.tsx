"use client";

import {
    Edit3,
    Trash2,
    Hash,
    Box
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryMobileViewProps {
    products: any[];
    loading: boolean;
    onEdit: (product: any) => void;
    onDelete: (id: string, name: string) => void;
}

export function InventoryMobileView({ products, loading, onEdit, onDelete }: InventoryMobileViewProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-24 rounded-3xl bg-white animate-pulse shadow-sm" />
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
        <div className="space-y-4 pb-20">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="bg-white rounded-[2rem] p-5 shadow-sm border border-primary/5 active:scale-[0.98] transition-all"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-black text-primary uppercase italic truncate mb-1">
                                {product.name}
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/60 uppercase">
                                    <Hash size={12} strokeWidth={1.5} />
                                    <span>{product.sku}</span>
                                </div>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                    product.stock < 10 ? "bg-red-50 text-red-600 border-red-100" : "bg-primary/5 text-primary border-primary/10"
                                )}>
                                    {product.stock} Units
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <span className="text-lg font-black text-accent italic leading-none">
                                ${Number(product.price).toFixed(2)}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onEdit(product)}
                                    className="p-2.5 bg-secondary/50 text-primary rounded-xl"
                                >
                                    <Edit3 size={16} strokeWidth={1.5} />
                                </button>
                                <button
                                    onClick={() => onDelete(product.id, product.name)}
                                    className="p-2.5 bg-red-50 text-red-500 rounded-xl"
                                >
                                    <Trash2 size={16} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

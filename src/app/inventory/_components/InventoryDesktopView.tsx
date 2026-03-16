"use client";

import {
    Edit3,
    Trash2,
    Hash,
    Tag,
    TrendingUp,
    Receipt,
    Box
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryDesktopViewProps {
    products: any[];
    loading: boolean;
    onEdit: (product: any) => void;
    onDelete: (id: string, name: string) => void;
}

export function InventoryDesktopView({ products, loading, onEdit, onDelete }: InventoryDesktopViewProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="h-64 rounded-[2.5rem] bg-white animate-pulse shadow-sm" />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-30 w-full">
                <div className="p-10 bg-primary/5 rounded-[3rem]">
                    <Box size={80} strokeWidth={1} className="text-primary" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-primary uppercase tracking-widest">Workshop Floor Empty</h3>
                    <p className="text-xs font-bold uppercase tracking-widest">No matching parts found in active catalog</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="group relative bg-white rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-primary/5 flex flex-col"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-primary/5 text-primary text-[9px] font-black rounded-full uppercase tracking-widest border border-primary/10">
                                    {product.product_categories?.name || "General"}
                                </span>
                                {product.stock < 10 && (
                                    <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black rounded-full uppercase tracking-widest border border-red-100 animate-pulse">
                                        Low Stock
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-black text-primary uppercase italic tracking-tight leading-tight group-hover:text-accent transition-colors">
                                {product.name}
                            </h3>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase">
                                <span className="flex items-center gap-1">
                                    <Hash size={12} strokeWidth={1.5} /> {product.sku}
                                </span>
                                {product.brand && (
                                    <span className="flex items-center gap-1">
                                        <Tag size={12} strokeWidth={1.5} /> {product.brand}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onEdit(product)}
                                className="p-3 bg-secondary/50 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all duration-300"
                            >
                                <Edit3 size={18} strokeWidth={1.5} />
                            </button>
                            <button
                                onClick={() => onDelete(product.id, product.name)}
                                className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-300"
                            >
                                <Trash2 size={18} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-3 mb-6">
                        <div className="p-4 bg-secondary/10 rounded-3xl border border-primary/5">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
                                Price
                            </p>
                            <p className="text-xl font-black text-primary italic">
                                ${Number(product.price).toFixed(2)}
                            </p>
                        </div>
                        <div className="p-4 bg-primary/5 rounded-3xl border border-primary/10 transition-colors group-hover:bg-primary group-hover:text-white">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60 group-hover:text-white/60">
                                Stock
                            </p>
                            <p className="text-xl font-black italic">
                                {product.stock} <span className="text-[10px] uppercase group-hover:text-white/80">Units</span>
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-secondary/30 rounded-xl flex items-center justify-center text-primary/40">
                                <TrendingUp size={16} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-muted-foreground uppercase leading-none mb-1">Status</p>
                                <p className="text-[10px] font-black text-primary uppercase tracking-wider">Active Product</p>
                            </div>
                        </div>
                        {product.taxable && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 rounded-xl text-accent">
                                <Receipt size={12} strokeWidth={1.5} />
                                <span className="text-[9px] font-black uppercase">Taxable</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

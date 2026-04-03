"use client";

import { useState } from "react";
import {
    Edit3,
    Trash2,
    Box,
    ChevronDown,
    Eye,
    Image as ImageIcon
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface InventoryDesktopViewProps {
    products: any[];
    loading: boolean;
    onEdit: (product: any) => void;
    onDelete: (id: string, name: string) => void;
}

export function InventoryDesktopView({ products, loading, onEdit, onDelete }: InventoryDesktopViewProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const totalPages = Math.ceil(products.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentProducts = products.slice(startIndex, startIndex + rowsPerPage);

    if (loading) {
        return (
            <div className="space-y-4 pt-4 md:px-0 lg:px-0">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-[calc(100vh/10)] rounded-[var(--ui-radius-lg)] bg-slate-100 animate-pulse shadow-sm w-full" />
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
        <div className="flex-1 min-h-0 bg-white rounded-[var(--ui-radius-lg)] border border-slate-200 flex flex-col overflow-hidden shadow-sm">
            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                <Table>
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                        <TableRow className="hover:bg-transparent border-slate-200">
                            <TableHead className="w-[40px] px-4"><Checkbox className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" /></TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11">Ref</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 min-w-[200px]">Product Description</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11">Category</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 text-right">Price</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 text-center">Stock</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 text-center w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center ">
                                    <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                                        <div className="p-4 border-2 border-dashed border-slate-300 rounded-[var(--ui-radius-xl)]">
                                            <Box size={32} />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest">No inventory data available</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentProducts.map((product, index) => {
                                const no = (startIndex + index + 1).toString().padStart(2, '0');
                                const isLowStock = parseInt(product.stock) <= (product.min_stock || 5);
                                return (
                                    <TableRow 
                                        key={product.id} 
                                        className="group border-slate-100 hover:bg-slate-50/80 transition-colors"
                                    >
                                        <TableCell className="px-4 py-3"><Checkbox className="border-slate-200 data-[state=checked]:bg-primary transition-opacity opacity-50 group-hover:opacity-100 shadow-none" /></TableCell>
                                        <TableCell>
                                            <span className="text-[11px] font-black text-slate-400 italic">#{product.sku?.slice(-6) || "N/A"}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-slate-900 leading-tight italic">{product.name}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{product.brand || "Workshop Generic"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-slate-200 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/10 transition-colors">
                                                {product.product_categories?.name || "General"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-[13px] font-black text-slate-900 italic tracking-tight">${Number(product.price).toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className={cn(
                                                "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                isLowStock ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                            )}>
                                                {product.stock}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-1">
                                                <Button 
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit(product)}
                                                    className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-100"
                                                >
                                                    <Edit3 size={14} strokeWidth={2.5} />
                                                </Button>
                                                <Button 
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDelete(product.id, product.name)}
                                                    className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-slate-100"
                                                >
                                                    <Trash2 size={14} strokeWidth={2.5} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50/50 border-t border-slate-200 shrink-0 h-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Density</span>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-[var(--ui-radius-sm)] text-[11px] font-black text-primary italic shadow-sm cursor-pointer">
                            {rowsPerPage}
                            <ChevronDown size={12} className="text-slate-400" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                        Viewing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, products.length)} of {products.length} catalog parts
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={currentPage === 1 || loading}
                        onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                        className="h-6 w-6 rounded-md text-slate-400 hover:text-primary hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                    >
                        <ChevronRight size={14} className="rotate-180" />
                    </Button>
                    <div className="min-w-[20px] h-6 flex items-center justify-center text-[10px] font-black text-primary italic px-2 bg-white border border-slate-200 rounded-md shadow-sm">
                        {currentPage}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={currentPage >= totalPages || loading}
                        onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                        className="h-6 w-6 rounded-md text-slate-400 hover:text-primary hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                    >
                        <ChevronRight size={14} />
                    </Button>
                </div>
            </div>
        </div>
    );
}


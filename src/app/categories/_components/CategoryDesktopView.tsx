import React from "react";
import { 
    Edit3, Trash2, Tag, Hash, Receipt, FileText, LayoutGrid, Eye, 
    ArrowRight, ChevronRight, MoreHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CategoryDesktopViewProps {
    categories: any[];
    onEdit: (category: any) => void;
    onDelete: (id: string, name: string) => void;
}

export function CategoryDesktopView({ categories, onEdit, onDelete }: CategoryDesktopViewProps) {
    return (
        <div className="flex-1 min-h-0 bg-white rounded-[var(--ui-radius-lg)] border border-slate-200 flex flex-col overflow-hidden shadow-sm">
            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                <Table>
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                        <TableRow className="hover:bg-transparent border-slate-200">
                            <TableHead className="w-[300px] text-[10px] font-black text-slate-400 uppercase tracking-widest h-11">Classification & Identity</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11">System Slug</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11">Financial Profile</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11">Integration Status</TableHead>
                            <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 px-6">Ops</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow 
                                key={category.id} 
                                className="group border-slate-100 hover:bg-slate-50/80 transition-colors"
                            >
                                <TableCell className="px-4 py-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-[var(--ui-radius-md)] bg-slate-100/80 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner">
                                            <Tag size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-slate-900 leading-tight italic uppercase tracking-tight group-hover:text-primary transition-colors">
                                                {category.name}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-1">
                                                UID: {category.id.split('-')[0]}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-500 rounded-[var(--ui-radius-sm)] border border-slate-200 group-hover:bg-white transition-all">
                                        <Hash size={10} className="text-slate-400" />
                                        <span className="text-[10px] font-black tracking-widest leading-none italic">{category.sku_slug}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Receipt size={10} className="text-slate-300" />
                                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight italic">
                                                {category.taxes?.name || "Standard Rule"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-full border border-emerald-100 uppercase tracking-widest">
                                                {category.taxes?.rate || 0}% Tax
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 max-w-[250px]">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-bold text-slate-400 leading-tight italic line-clamp-2">
                                            {category.description || "No classification manifest provided."}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Link</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 px-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(category)}
                                            className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-100 transition-all"
                                        >
                                            <Edit3 size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(category.id, category.name)}
                                            className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-slate-100 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            <div className="px-6 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0 h-10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                    Node Count: <span className="text-primary font-black">{categories.length}</span> Classifications Found
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] italic">System Hierarchy V2.0</span>
                </div>
            </div>
        </div>
    );
}

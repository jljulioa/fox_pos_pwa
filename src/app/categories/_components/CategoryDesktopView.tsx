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
        <div className="bg-white rounded-[var(--ui-radius-xl)] border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
                <Table>
                    <TableHeader className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 border-b border-slate-200">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[300px] py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Classification & Identity</TableHead>
                            <TableHead className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">System Slug</TableHead>
                            <TableHead className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Financial Profile</TableHead>
                            <TableHead className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Integration Status</TableHead>
                            <TableHead className="text-right py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Ops</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow 
                                key={category.id} 
                                className="group border-b border-slate-100 hover:bg-slate-50/50 transition-all duration-200"
                            >
                                <TableCell className="py-3 px-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-[var(--ui-radius-md)] bg-slate-100/80 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner">
                                            <Tag size={18} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[13px] font-black text-slate-700 uppercase italic tracking-tight group-hover:text-primary transition-colors leading-none">
                                                {category.name}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                                                UID: {category.id.split('-')[0]}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 px-6">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md border border-slate-200 group-hover:bg-white group-hover:border-primary/20 transition-all shadow-sm">
                                        <Hash size={10} className="opacity-50" />
                                        <span className="text-[10px] font-black tracking-widest">{category.sku_slug}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 px-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Receipt size={12} className="text-slate-300" />
                                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight italic">
                                                {category.taxes?.name || "Standard Rule"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-sm border border-emerald-100 uppercase tracking-widest">
                                                {category.taxes?.rate || 0}% Tax
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 px-6 max-w-[250px]">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-bold text-slate-400 leading-tight italic line-clamp-1 group-hover:line-clamp-none transition-all">
                                            {category.description || "No classification manifest provided."}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Link</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 px-6 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(category)}
                                            className="h-8 w-8 rounded-[var(--ui-radius-md)] text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                                        >
                                            <Edit3 size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(category.id, category.name)}
                                            className="h-8 w-8 rounded-[var(--ui-radius-md)] text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
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
            
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                    Node Count: <span className="text-slate-600 font-black">{categories.length}</span> Classifications Found
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] italic">System Hierarchy V1.0</span>
                </div>
            </div>
        </div>
    );
}

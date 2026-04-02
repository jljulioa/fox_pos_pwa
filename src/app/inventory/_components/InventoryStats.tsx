"use client";

import React from 'react';
import { 
    AlertTriangle, 
    ArchiveX, 
    DollarSign, 
    Layers,
    TrendingUp,
    TrendingDown,
    Package
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface InventoryStatsProps {
    products: any[];
}

export function InventoryStats({ products }: InventoryStatsProps) {
    const outOfStock = products.filter(p => parseInt(p.stock) <= 0).length;
    const lowStock = products.filter(p => parseInt(p.stock) > 0 && parseInt(p.stock) <= (p.min_stock || 0)).length;
    
    const totalValue = products.reduce((acc, p) => {
        const stock = parseInt(p.stock) || 0;
        const cost = parseFloat(p.cost) || 0;
        return acc + (stock * cost);
    }, 0);

    const totalQty = products.reduce((acc, p) => acc + (parseInt(p.stock) || 0), 0);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const stats = [
        {
            label: "OOS Items",
            value: outOfStock,
            color: "text-red-500",
            bgColor: "bg-red-50",
            borderColor: "border-red-100",
            bgHover: "hover:bg-red-100",
            icon: ArchiveX
        },
        {
            label: "Low Stock",
            value: lowStock,
            color: "text-orange-500",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-100",
            bgHover: "hover:bg-orange-100",
            icon: AlertTriangle
        },
        {
            label: "Stock Value",
            value: `$${formatNumber(totalValue)}`,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-100",
            bgHover: "hover:bg-emerald-100",
            icon: DollarSign
        },
        {
            label: "Total Units",
            value: formatNumber(totalQty),
            color: "text-primary",
            bgColor: "bg-primary/5",
            borderColor: "border-primary",
            bgHover: "hover:bg-primary/10",
            icon: Package
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-0">
            {stats.map((stat, idx) => (
                <div 
                    key={idx}
                    className={cn(
                        "bg-white p-3.5 rounded-[var(--ui-radius-md)] shadow-sm flex flex-col gap-2 transition-all hover:bg-slate-50/50",
                        stat.borderColor, 
                        stat.bgColor,
                        stat.bgHover
                    )}
                >
                    <div className="flex flex-row justify-between">
                        <span className={cn("text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-none", stat.color)}>
                            {stat.label}
                        </span>
                        <span className={cn("text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-none animate-pulse", stat.color)}>
                            {stat.value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

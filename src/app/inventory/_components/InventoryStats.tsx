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
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return num.toString();
    };

    const stats = [
        {
            label: "OOS",
            value: outOfStock,
            color: "text-red-500",
            bgColor: "bg-red-50",
            borderColor: "border-red-100",
        },
        {
            label: "Low",
            value: lowStock,
            color: "text-orange-500",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-100",
        },
        {
            label: "Value",
            value: `$${formatNumber(totalValue)}`,
            color: "text-accent",
            bgColor: "bg-accent/10",
            borderColor: "border-accent/20",
        },
        {
            label: "Units",
            value: formatNumber(totalQty),
            color: "text-primary",
            bgColor: "bg-primary/5",
            borderColor: "border-primary/10",
        }
    ];

    return (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6">
            {stats.map((stat, idx) => (
                <div 
                    key={idx}
                    className={cn(
                        "bg-white p-3 sm:p-5 rounded-[1.5rem] border transition-all hover:scale-[1.02] shadow-sm flex flex-col items-start justify-between min-h-[110px] sm:min-h-[140px]",
                        stat.borderColor
                    )}
                >
                    <div className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 sm:mb-4 shadow-inner",
                        stat.bgColor,
                        stat.color
                    )}>
                        <Package size={16} strokeWidth={2.5} />
                    </div>

                    <div className="flex flex-col items-start text-left">
                        <span className={cn(
                            "text-lg sm:text-2xl font-black tracking-tighter leading-none mb-1",
                            stat.color
                        )}>
                            {stat.value}
                        </span>
                        <span className="text-[8px] sm:text-[10px] font-black text-primary/40 uppercase tracking-widest leading-none">
                            {stat.label}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

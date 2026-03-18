"use client";

import React from 'react';
import { 
    DollarSign,
    Package,
    TrendingUp,
    Hash
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface SalesStatsProps {
    totalRevenue: number;
    totalUnits: number;
}

export function SalesStats({ totalRevenue, totalUnits }: SalesStatsProps) {
    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return num.toLocaleString();
    };

    const stats = [
        {
            label: "Total Items",
            value: formatNumber(totalUnits),
            icon: Package,
            color: "text-accent",
            bgColor: "bg-accent/10",
            borderColor: "border-accent/20",
        },
        {
            label: "Total Value",
            value: `$${formatNumber(totalRevenue)}`,
            icon: DollarSign,
            color: "text-primary",
            bgColor: "bg-primary/10",
            borderColor: "border-primary/20",
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6">
            {stats.map((stat, idx) => (
                <div 
                    key={idx}
                    className={cn(
                        "bg-white p-4 sm:p-6 rounded-[2rem] border transition-all hover:scale-[1.02] shadow-sm flex flex-col items-start justify-between min-h-[120px] sm:min-h-[160px]",
                        stat.borderColor
                    )}
                >
                    <div className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4 sm:mb-8 shadow-inner",
                        stat.bgColor,
                        stat.color
                    )}>
                        <stat.icon size={20} strokeWidth={2.5} />
                    </div>

                    <div className="flex flex-col items-start text-left">
                        <span className={cn(
                            "text-xl sm:text-3xl font-black tracking-tighter leading-none mb-1",
                            stat.color
                        )}>
                            {stat.value}
                        </span>
                        <span className="text-[10px] sm:text-xs font-black text-primary/40 uppercase tracking-widest leading-none px-1">
                            {stat.label}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, PackageSearch, DollarSign, BarChart2 } from "lucide-react";

const tabs = [
    { name: "Overview", href: "/reports", icon: BarChart3, exact: true },
    { name: "Sales", href: "/reports/sales", icon: TrendingUp },
    { name: "Financial", href: "/reports/financial", icon: DollarSign },
    { name: "Stock", href: "/reports/stock", icon: PackageSearch },
];

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="md:px-3 md:py-3 flex flex-col h-full gap-4 overflow-hidden md:bg-white rounded-[var(--sidebar-radius)] md:shadow-glass">

            {/* ── Header ── */}
            <header className="px-5 py-5 border-b border-primary/5 glass shrink-0 shadow-glass z-20 rounded-[var(--sidebar-radius)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Title */}
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-[var(--ui-radius-lg)] shadow-inner">
                            <BarChart2 size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase italic leading-none">
                                Business Intelligence
                            </h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic mt-1 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                Live Analytics Dashboard
                            </p>
                        </div>
                    </div>

                    {/* Tabs pill bar */}
                    <div className="flex items-center bg-slate-100/80 rounded-[var(--ui-radius-xl)] p-1 gap-0.5">
                        {tabs.map((tab) => {
                            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--ui-radius-lg)] text-[10px] font-black uppercase tracking-widest transition-all",
                                        isActive
                                            ? "bg-white text-primary shadow-sm border border-primary/10"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-white/60"
                                    )}
                                >
                                    <tab.icon size={12} strokeWidth={2.5} />
                                    <span className="hidden sm:inline">{tab.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* ── Page content ── */}
            <main className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6 space-y-4 pt-1">
                {children}
            </main>
        </div>
    );
}

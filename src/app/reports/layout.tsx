"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, PackageSearch, DollarSign } from "lucide-react";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const tabs = [
        { name: "Overview", href: "/reports", icon: BarChart3, exact: true },
        { name: "Sales", href: "/reports/sales", icon: TrendingUp },
        { name: "Financial", href: "/reports/financial", icon: DollarSign },
        { name: "Stock", href: "/reports/stock", icon: PackageSearch },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Advanced Reports</h2>
                    <p className="text-muted-foreground">Comprehensive insights into your business performance.</p>
                </div>
            </div>

            <div className="flex bg-card p-1 rounded-2xl border shadow-sm w-fit">
                {tabs.map((tab) => {
                    const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all relative overflow-hidden",
                                isActive 
                                    ? "text-primary shadow-sm bg-primary/10" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                        >
                            <tab.icon size={18} className={isActive ? "text-primary shrink-0" : "opacity-70 shrink-0"} />
                            <span className={cn("whitespace-nowrap", isActive ? "block" : "hidden md:block")}>
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </div>

            <div className="pt-2">
                {children}
            </div>
        </div>
    );
}

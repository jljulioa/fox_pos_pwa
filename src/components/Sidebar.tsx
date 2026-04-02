"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    BarChart3,
    Settings,
    LogOut,
    History,
    Receipt,
    Truck,
    ChevronLeft,
    Menu,
    X,
    FolderTree,
    UserCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const sections = [
    {
        title: "Main Office",
        items: [
            { icon: LayoutDashboard, label: "Home", href: "/" },
            { icon: ShoppingCart, label: "POS", href: "/pos" },
            { icon: Receipt, label: "Sales", href: "/sales" },
        ]
    },
    {
        title: "Catalog",
        items: [
            { icon: Package, label: "Stock", href: "/inventory" },
            { icon: Truck, label: "Purchases", href: "/purchases" },
            { icon: FolderTree, label: "Groups", href: "/categories" },
        ]
    },
    {
        title: "Management",
        items: [
            { icon: Users, label: "Clients", href: "/customers" },
            { icon: UserCircle, label: "Users", href: "/users" },
            { icon: History, label: "Kardex", href: "/history" },
        ]
    },
    {
        title: "System",
        items: [
            { icon: BarChart3, label: "Stats", href: "/reports" },
            { icon: Settings, label: "Setup", href: "/settings" },
        ]
    }
];

import { useLayout } from "@/context/LayoutContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { sidebarCollapsed: isCollapsed, setSidebarCollapsed: setIsCollapsed } = useLayout();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <>
            {/* --- MOBILE BOTTOM NAV BAR --- */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-primary/5 z-[60] flex items-center justify-around px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe">
                <Link href="/pos" className="flex flex-col items-center gap-1 p-2 w-16 group">
                    <div className={cn(
                        "p-2 rounded-xl transition-all",
                        pathname === "/pos" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                    )}>
                        <ShoppingCart size={22} strokeWidth={pathname === "/pos" ? 2 : 1.5} />
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", pathname === "/pos" ? "text-primary" : "text-muted-foreground")}>POS</span>
                </Link>

                <Link href="/inventory" className="flex flex-col items-center gap-1 p-2 w-16 group">
                    <div className={cn(
                        "p-2 rounded-xl transition-all",
                        pathname === "/inventory" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                    )}>
                        <Package size={22} strokeWidth={pathname === "/inventory" ? 2 : 1.5} />
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", pathname === "/inventory" ? "text-primary" : "text-muted-foreground")}>Stock</span>
                </Link>

                {/* HOME CENTER BUTTON */}
                <div className="relative -top-5">
                    <Link href="/" className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full shadow-xl shadow-primary/30 border-4 border-background hover:scale-105 active:scale-95 transition-all">
                        <LayoutDashboard size={26} strokeWidth={2} />
                    </Link>
                </div>

                <Link href="/sales" className="flex flex-col items-center gap-1 p-2 w-16 group">
                    <div className={cn(
                        "p-2 rounded-xl transition-all",
                        pathname === "/sales" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                    )}>
                        <Receipt size={22} strokeWidth={pathname === "/sales" ? 2 : 1.5} />
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", pathname === "/sales" ? "text-primary" : "text-muted-foreground")}>Sales</span>
                </Link>

                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="flex flex-col items-center gap-1 p-2 w-16 group">
                    <div className={cn(
                        "p-2 rounded-xl transition-all",
                        isMobileMenuOpen ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                    )}>
                        {isMobileMenuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={1.5} />}
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", isMobileMenuOpen ? "text-primary" : "text-muted-foreground")}>Menu</span>
                </button>
            </nav>

            {/* --- MOBILE FULL MENU BACKDROP & BOTTOM SHEET --- */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-primary/20 backdrop-blur-md z-[65] transition-opacity animate-in fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            <div className={cn(
                "lg:hidden fixed inset-x-0 bottom-24 z-[70] mx-4 bg-white rounded-[2rem] shadow-2xl border border-primary/5 transition-all duration-300 transform",
                isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0 pointer-events-none"
            )}>
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-primary uppercase tracking-widest text-sm">Main Menu</h3>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-secondary/50 rounded-xl">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                        {sections.map(section => 
                            section.items.map(item => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={item.href} href={item.href} className="flex flex-col items-center gap-2 group">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                            isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-primary/5 text-primary group-hover:bg-primary/10"
                                        )}>
                                            <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-wider text-center truncate w-full",
                                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                        )}>{item.label}</span>
                                    </Link>
                                );
                            })
                        )}
                        <button onClick={logout} className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-50 text-red-500 transition-all group-hover:bg-red-100">
                                <LogOut size={20} strokeWidth={1.5} />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-center text-red-500 truncate w-full">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            <aside className={cn(
                "hidden lg:block fixed inset-y-0 left-0 z-[80] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:p-3",
                isCollapsed ? "lg:w-20" : "lg:w-64"
            )}>
                <div className="h-full glass lg:rounded-[var(--sidebar-radius)] flex flex-col border border-primary/5 shadow-glass overflow-hidden">

                    {/* Header */}
                    <div className={cn(
                        "flex items-center justify-between transition-all",
                        isCollapsed ? "p-3 flex-col gap-4" : "p-5 flex-row"
                    )}>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-primary rounded-[var(--sidebar-item-radius)] flex items-center justify-center shadow-primary/20 shadow-lg shrink-0">
                                <LayoutDashboard className="text-white w-4.5 h-4.5" strokeWidth={2} />
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col">
                                    <span className="text-base font-black text-primary leading-none tracking-tight">VENDA</span>
                                    <span className="text-[9px] text-primary font-bold tracking-wider uppercase mt-0.5 opacity-100">FOX MP</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex p-1 hover:bg-primary/5 text-primary/40 hover:text-primary rounded-lg transition-all"
                        >
                            <ChevronLeft className={cn("transition-transform duration-500", isCollapsed && "rotate-180")} size={16} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-2 space-y-4 custom-scrollbar pb-4">
                        {sections.map((section) => (
                            <div key={section.title} className="space-y-0.5  relative">
                                {!isCollapsed && (
                                    <p className="px-3 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-2 pointer-events-none">
                                        {section.title}
                                    </p>
                                )}
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    
                                    const linkContent = (
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-2.5 px-3 py-2 rounded-[var(--sidebar-item-radius)] transition-all duration-300 group relative",
                                                isCollapsed
                                                    ? "justify-center h-10 w-10 mx-auto"
                                                    : "w-full",
                                                isActive
                                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                            )}
                                        >
                                            <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} className={cn(
                                                "shrink-0 transition-transform group-hover:scale-110",
                                                isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                                            )} />
                                            {!isCollapsed && (
                                                <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
                                            )}

                                            {/* Pointer for active item */}
                                            {isActive && !isCollapsed && (
                                                <div className="absolute right-3 w-1 h-1 bg-white/40 rounded-full" />
                                            )}
                                        </Link>
                                    );
                                    
                                    return (
                                        <div key={item.href} >
                                            {isCollapsed ? (
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        {linkContent}
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right" sideOffset={14} className="font-semibold px-2 py-1 text-xs bg-primary text-white">
                                                        {item.label}
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                linkContent
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    {/* User Profile & Logout - Integrated */}
                    <div className="p-3 mt-auto border-t border-primary/5 bg-primary/[0.02]">
                        <div className={cn(
                            "flex items-center transition-all",
                            isCollapsed ? "flex-col gap-3" : "justify-between px-1"
                        )}>
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-[var(--sidebar-item-radius)] bg-white shadow-sm flex items-center justify-center font-bold text-primary border border-primary/10 shrink-0 text-xs">
                                    {user?.full_name?.charAt(0) || "A"}
                                </div>
                                {!isCollapsed && (
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-black text-primary truncate leading-tight">
                                            {user?.full_name || "Administrator"}
                                        </p>
                                        <p className="text-[9px] text-accent font-bold uppercase tracking-wider opacity-60">Main Office</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={logout}
                                title="Sign Out"
                                className={cn(
                                    "p-2 rounded-[var(--sidebar-item-radius)] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group",
                                    isCollapsed && "w-10 h-10 flex items-center justify-center"
                                )}
                            >
                                <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
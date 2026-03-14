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
            {/* --- MOBILE TOP BAR (Floating & Glassy) --- */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-14 glass z-[60] flex items-center justify-between px-4 shadow-lg shadow-black/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-primary/20 shadow-lg">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold tracking-tight text-primary">FoxPOS</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 hover:bg-primary/5 rounded-xl transition-colors"
                >
                    {isMobileMenuOpen ? <X size={20} strokeWidth={1.5} className="text-primary" /> : <Menu size={20} strokeWidth={1.5} className="text-primary" />}
                </button>
            </div>

            {/* --- MOBILE BACKDROP --- */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-primary/20 backdrop-blur-sm z-[70] transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* --- MAIN SIDEBAR --- */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-[80] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                "lg:translate-x-0 lg:p-4", // On desktop, we give it padding to make it "float"
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
                isCollapsed ? "lg:w-24" : "lg:w-72 w-[280px]"
            )}>
                <div className="h-full glass lg:rounded-[2rem] flex flex-col border-none shadow-glass">

                    {/* Header */}
                    <div className={cn(
                        "p-6 flex items-center justify-between transition-all",
                        isCollapsed ? "flex-col gap-4" : "flex-row"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-primary/20 shadow-xl shrink-0">
                                <LayoutDashboard className="text-white w-6 h-6" strokeWidth={1.5} />
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-primary leading-none">FoxPOS</span>
                                    <span className="text-[10px] text-accent font-bold tracking-wide uppercase mt-1">v2.4.0</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex p-1.5 hover:bg-primary/5 text-primary/40 hover:text-primary rounded-lg transition-all"
                        >
                            <ChevronLeft className={cn("transition-transform duration-500", isCollapsed && "rotate-180")} size={18} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-3 space-y-6 custom-scrollbar pb-6">
                        {sections.map((section) => (
                            <div key={section.title} className="space-y-1 relative">
                                {!isCollapsed && (
                                    <p className="px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 opacity-50">
                                        {section.title}
                                    </p>
                                )}
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-2 py-3 rounded-2xl transition-all duration-300 group relative",
                                                isCollapsed
                                                    ? "justify-center h-10 w-10 mx-auto"
                                                    : "px-2 py-3 gap-3 w-full",
                                                isActive
                                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                            )}
                                        >
                                            <item.icon size={20} strokeWidth={1.5} className={cn(
                                                "shrink-0 transition-transform group-hover:scale-110",
                                                isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                                            )} />
                                            {!isCollapsed && (
                                                <span className="text-[14px] font-semibold">{item.label}</span>
                                            )}

                                            {/* Pointer for active item */}
                                            {isActive && !isCollapsed && (
                                                <div className="absolute right-4 w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                                            )}

                                            {/* Tooltip for collapsed state */}
                                            {isCollapsed && (
                                                <div className="lg:block hidden absolute left-16 px-3 py-1 bg-primary text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                                                    {item.label}
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 mt-auto">
                        <div className={cn(
                            "bg-primary/5 rounded-2xl p-3 flex items-center gap-3 transition-all",
                            isCollapsed ? "justify-center" : "px-4"
                        )}>
                            <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-primary border border-primary/10 shrink-0">
                                {user?.full_name?.charAt(0) || "A"}
                            </div>
                            {!isCollapsed && (
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-primary truncate">
                                        {user?.full_name || "Administrator"}
                                    </p>
                                    <p className="text-[11px] text-accent font-bold">Main Office</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={logout}
                            className={cn(
                                "mt-3 flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group",
                                isCollapsed && "justify-center"
                            )}
                        >
                            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                            {!isCollapsed && <span className="text-sm font-bold">Sign Out</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
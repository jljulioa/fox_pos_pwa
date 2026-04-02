"use client";

import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LayoutProvider, useLayout } from "@/context/LayoutContext";

function ContentWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { loading } = useAuth();
    const { sidebarCollapsed: isCollapsed } = useLayout();
    const isLoginPage = pathname === "/login";

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="text-primary animate-spin" size={48} />
                    <p className="text-primary font-bold text-sm tracking-widest uppercase animate-pulse">Loading POS...</p>
                </div>
            </div>
        );
    }

    const isPOSPage = pathname === "/pos" || pathname === "/posv2";

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 lg:bg-primary/[0.03]">
            <Sidebar />

            <main className={cn(
                "flex-1 w-full transition-all duration-[0.8s] ease-[cubic-bezier(0.4,0,0.2,1)]",
                isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
            )}>
                {isPOSPage ? (
                    <div className="h-screen w-full overflow-hidden pb-28 lg:pb-0">
                        {children}
                    </div>
                ) : (
                    <div className="pt-6 px-3 lg:pt-3 h-screen pb-20 lg:pb-3">
                        {children}
                    </div>
                )}
            </main>
        </div>
    );
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <LayoutProvider>
            <AuthProvider>
                <ContentWrapper>{children}</ContentWrapper>
            </AuthProvider>
        </LayoutProvider>
    );
}
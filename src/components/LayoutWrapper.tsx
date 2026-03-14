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

    const isPOSPage = pathname === "/pos";

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <main className={cn(
                "flex-1 w-full transition-all duration-[0.8s] ease-[cubic-bezier(0.4,0,0.2,1)]",
                isCollapsed ? "lg:ml-[96px]" : "lg:ml-[288px]"
            )}>
                {isPOSPage ? (
                    <div className="h-screen w-full overflow-hidden">
                        {children}
                    </div>
                ) : (
                    <div className="pt-24 pb-8 px-6 lg:pt-8 lg:px-10 max-w-[1920px] mx-auto">
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
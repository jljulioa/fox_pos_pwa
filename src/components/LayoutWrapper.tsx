"use client";

import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

function ContentWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { loading } = useAuth();
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

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <main className="flex-1 w-full transition-all duration-500 ease-in-out lg:pl-[72px] lg:group-hover:pl-72 transition-[padding]">
                {/* 
                  - pt-24: Space for the floating mobile top bar
                  - lg:pt-8: Standard padding on desktop
                  - px-6/lg:px-10: Responsive horizontal breathability
                */}
                <div className="pt-24 pb-8 px-6 lg:pt-8 lg:px-10 max-w-[1920px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ContentWrapper>{children}</ContentWrapper>
        </AuthProvider>
    );
}
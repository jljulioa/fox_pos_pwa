"use client";

import React, { createContext, useContext, useState } from 'react';

type LayoutContextType = {
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <LayoutContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed }}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayout() {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
}

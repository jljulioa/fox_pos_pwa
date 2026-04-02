"use client";

import { useState, useEffect, useMemo, useDeferredValue } from "react";
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    CreditCard,
    Banknote,
    CheckCircle2,
    Loader2,
    Ticket,
    PlusCircle,
    Users,
    X,
    ChevronUp,
    Package,
    Trash2,
    Hash,
    DollarSign,
    Percent,
    Printer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePos } from "@/hooks/usePos";
import { generateInvoicePDF } from "@/lib/pdf";
import { PosDesktopView } from "./_components/PosDesktopView";
import { PosMobileView } from "./_components/PosMobileView";

export default function POSPage() {
    const posProps = usePos();
    const {
        cart,
        searchTerm,
        setSearchTerm,
        loading,
        showSuccess,
        fetchProducts
    } = posProps;

    // Effect for real-time search limited to performance
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts(searchTerm);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, fetchProducts]);

    const total = useMemo(() => 
        cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    , [cart]);

    const tax = useMemo(() => 
        cart.reduce((sum, item) => {
            const rate = item.tax_rate || 0;
            const itemTotal = item.price * item.quantity;
            const netPrice = itemTotal / (1 + rate / 100);
            return sum + (itemTotal - netPrice);
        }, 0)
    , [cart]);

    const discount = useMemo(() => 
        cart.reduce((sum, item) => {
            const originalPrice = item.original_price !== undefined && item.original_price !== null ? item.original_price : item.price;
            const diff = originalPrice - item.price;
            return sum + ((diff > 0 ? diff : 0) * item.quantity);
        }, 0)
    , [cart]);

    const subtotal = total - tax; // Net price base
    const deferredSearchTerm = useDeferredValue(searchTerm);

    return (
        <div className="h-screen overflow-hidden">

            {/* Desktop View */}
            <div className="hidden lg:block h-full">
                <PosDesktopView 
                    {...posProps}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    subtotal={subtotal}
                    tax={tax}
                    discount={discount}
                    total={total}
                />
            </div>

            {/* Mobile View */}
            <div className="block lg:hidden h-full">
                <PosMobileView 
                    {...posProps}
                    subtotal={subtotal}
                    tax={tax}
                    total={total}
                />
            </div>

            {/* Global States */}
            {showSuccess && (
                <div className="fixed inset-0 flex items-center justify-center z-[200] animate-in fade-in duration-700">
                    <div className="text-center p-12 space-y-10 animate-in zoom-in duration-700">
                        <div className="w-64 h-64 bg-white text-primary rounded-[5rem] flex items-center justify-center mx-auto shadow-2xl">
                            <CheckCircle2 size={140} strokeWidth={1.5} className="animate-bounce" />
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Order Dispatched</h3>
                            <p className="text-accent font-black text-sm uppercase tracking-[0.5em] animate-pulse">Syncing Ledger • Generating Assets</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


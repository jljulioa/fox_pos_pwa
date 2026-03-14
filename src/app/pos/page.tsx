"use client";

import { useState, useEffect } from "react";
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

export default function POSPage() {
    const {
        products,
        openSales,
        customers,
        currentSale,
        cart,
        searchTerm,
        setSearchTerm,
        loading,
        processing,
        paymentMethod,
        setPaymentMethod,
        showSuccess,
        error,
        setError,
        fetchProducts,
        selectSale,
        createNewSale,
        updateSaleCustomer,
        addToCart,
        updateQuantity,
        updateItemPrice,
        removeFromCart,
        handleCheckout
    } = usePos();

    // Effect for real-time search limited to performance
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts(searchTerm);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, fetchProducts]);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = cart.reduce((sum, item) => {
        const rate = item.product_categories?.taxes?.rate || item.tax_rate || 0;
        return sum + (item.price * item.quantity * (rate / 100));
    }, 0);
    const discount = 0; // Placeholder for now
    const total = subtotal + tax - discount;

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            {/* --- CENTRAL MAIN SECTION (The Ticket) --- */}
            <section className="flex-1 flex flex-col min-w-0 bg-white border-r border-slate-200">
                {/* Ticket Header */}
                <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/5 rounded-xl text-primary">
                            <Ticket size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Active Ticket</h1>
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                                    {currentSale?.sale_ref || "NEW TICKET"}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1.5 cursor-pointer group">
                                    <Users size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
                                    <select
                                        className="bg-transparent text-xs font-semibold text-slate-500 hover:text-primary outline-none appearance-none cursor-pointer"
                                        value={currentSale?.customer_id || ""}
                                        onChange={(e) => updateSaleCustomer(e.target.value)}
                                    >
                                        <option value="">Guest Customer</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <span className="text-slate-200">|</span>
                                <div className="flex items-center gap-1.5">
                                    <Package size={14} className="text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        {cart.length} Items
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            className="bg-slate-50 text-slate-600 text-[11px] font-bold py-2.5 px-4 rounded-xl outline-none border border-slate-200 cursor-pointer focus:ring-2 focus:ring-primary/5 transition-all"
                            value={currentSale?.id || ""}
                            onChange={(e) => {
                                const sale = openSales.find(s => s.id === e.target.value);
                                if (sale) selectSale(sale);
                            }}
                        >
                            <option value="">Switch Ticket</option>
                            {openSales.map(sale => (
                                <option key={sale.id} value={sale.id}>
                                    {sale.sale_ref || `ID: ${sale.id.slice(0, 8)}`}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => createNewSale()}
                            className="p-2.5 bg-white text-primary border border-slate-200 rounded-xl hover:bg-primary/5 transition-all shadow-sm active:scale-95"
                            title="New Ticket"
                        >
                            <Plus size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </header>

                {/* Ticket Body (High-Density Table) */}
                <main className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/20">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16">#</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center w-32">Price</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center w-32">Qty</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right w-32">Subtotal</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {cart.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-32 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-20">
                                                <div className="p-8 border-2 border-dashed border-slate-300 rounded-[3rem] mb-6">
                                                    <ShoppingCart size={64} strokeWidth={1} />
                                                </div>
                                                <p className="text-xs font-bold uppercase tracking-[0.3em]">No items in ticket</p>
                                                <p className="text-[10px] mt-2 font-medium">Use the panel on the right to search products</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    cart.map((item, index) => (
                                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-[11px] font-bold text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{item.name}</span>
                                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{item.brand || 'SKU-GENERIC'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="text-[11px] font-bold text-slate-300">$</span>
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                                        className="w-20 bg-transparent border-none text-center font-bold text-slate-700 text-sm outline-none focus:ring-0 p-0"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all border border-slate-100 shadow-sm"
                                                    >
                                                        <Minus size={12} strokeWidth={3} />
                                                    </button>
                                                    <span className="w-6 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all border border-slate-100 shadow-sm"
                                                    >
                                                        <Plus size={12} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-bold text-slate-900">${(item.price * item.quantity).toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} strokeWidth={2} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>

                {/* Bottom Summary Section */}
                <footer className="p-8 bg-white border-t border-slate-100">
                    <div className="flex flex-col lg:flex-row items-end lg:items-center justify-between gap-8">
                        {/* Summary Cards */}
                        <div className="flex flex-wrap items-center gap-4 w-full">
                            <div className="flex-1 min-w-[140px] p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <Hash size={12} /> Subtotal
                                </p>
                                <p className="text-xl font-bold text-slate-900 italic tracking-tight">${subtotal.toLocaleString()}</p>
                            </div>
                            <div className="flex-1 min-w-[140px] p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <Percent size={12} /> Taxes
                                </p>
                                <p className="text-xl font-bold text-slate-900 italic tracking-tight">${tax.toLocaleString()}</p>
                            </div>
                            <div className="flex-1 min-w-[140px] p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <DollarSign size={12} /> Discounts
                                </p>
                                <p className="text-xl font-bold text-slate-900 italic tracking-tight text-red-500">-${discount.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Finalize Button */}
                        <div className="w-full lg:w-auto flex items-center gap-4 shrink-0">
                            <div className="text-right flex flex-col items-end pr-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Payable</span>
                                <span className="text-4xl font-black text-primary italic tracking-tighter leading-none">${total.toLocaleString()}</span>
                            </div>
                            <button
                                disabled={cart.length === 0 || !currentSale}
                                onClick={() => generateInvoicePDF(currentSale, cart, subtotal, tax, total)}
                                className="h-[72px] px-6 bg-slate-100 text-slate-500 rounded-[2rem] text-lg font-bold flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-20 disabled:scale-100"
                                title="Print Invoice / PDF"
                            >
                                <Printer size={24} strokeWidth={2.5} />
                            </button>
                            <button
                                disabled={cart.length === 0 || processing || !currentSale}
                                onClick={handleCheckout}
                                className="h-[72px] px-10 bg-primary text-white rounded-[2rem] text-lg font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] hover:shadow-2xl transition-all active:scale-95 disabled:opacity-20 disabled:scale-100 uppercase tracking-tight"
                            >
                                {processing ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <CheckCircle2 size={24} strokeWidth={2.5} />
                                )}
                                <span>{processing ? "Processing" : "Finalize Order"}</span>
                            </button>
                        </div>
                    </div>
                </footer>
            </section>

            {/* --- RIGHT SIDEBAR (Product Search) --- */}
            <aside className="w-[380px] xl:w-[440px] bg-slate-50 flex flex-col shrink-0">
                {/* Search Header */}
                <div className="p-6 bg-white border-b border-slate-200">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find products or scan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/10 transition-all font-semibold text-sm text-slate-700"
                        />
                    </div>
                </div>

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-24 bg-white rounded-2xl animate-pulse shadow-sm border border-slate-100" />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 px-8 text-center">
                            <Search size={48} strokeWidth={1} className="mb-4" />
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">No products found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex items-center gap-4"
                                >
                                    <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden relative">
                                        <Package className="text-slate-300" size={24} strokeWidth={1.5} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col">
                                            <h4 className="text-sm font-bold text-slate-900 truncate tracking-tight">{product.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{product.brand || 'Parts Dept'}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-lg font-bold text-primary italic">${product.price.toLocaleString()}</span>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="px-3 py-1.5 bg-slate-50 hover:bg-primary hover:text-white text-primary text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-slate-100 group-hover:border-primary/10"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stock Indicator */}
                                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className={cn(
                                            "w-1.5 h-1.5 rounded-full animate-pulse",
                                            product.stock > 10 ? "bg-green-500" : "bg-orange-500"
                                        )} />
                                        <span className="text-[9px] font-bold text-slate-400">{product.stock} left</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </aside>

            {/* Global States */}
            {showSuccess && (
                <div className="fixed inset-0 bg-primary/98 backdrop-blur-3xl flex items-center justify-center z-[110] animate-in fade-in duration-700">
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


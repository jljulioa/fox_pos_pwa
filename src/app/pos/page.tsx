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
    ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePos } from "@/hooks/usePos";

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

    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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
    const total = subtotal + tax;

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] lg:h-[calc(100vh-4rem)] lg:-m-4 gap-0 overflow-hidden bg-[#F8F9FA]">
            {/* Catalog Section - Expanded for Desktop */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <header className="p-6 lg:p-10 space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black tracking-tight text-primary">Fox Moto Terminal</h1>
                            <p className="text-muted-foreground font-semibold flex items-center gap-2">
                                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                System Operational • POS-404
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsSearchModalOpen(true)} className="lg:hidden p-3 glass-dark rounded-2xl text-primary">
                                <Search size={24} strokeWidth={1.5} />
                            </button>
                            <div className="hidden lg:flex relative group w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={20} strokeWidth={1.5} />
                                <input
                                    type="text"
                                    placeholder="Search motorcycle parts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-3xl bg-white shadow-sm border-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-6 lg:px-10 pb-24 lg:pb-10 custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold flex items-center justify-between">
                            <span>{error}</span>
                            <button onClick={() => setError(null)}><X size={16} /></button>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-[4/3] rounded-[2rem] bg-white animate-pulse shadow-sm" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 text-left border border-transparent hover:border-primary/5 active:scale-[0.98]"
                                >
                                    <div className="relative aspect-[4/3] bg-[#F1F5F9] overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ShoppingCart className="text-primary/10 group-hover:scale-110 transition-transform duration-700" size={60} strokeWidth={1} />
                                        </div>
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <span className="px-3 py-1.5 bg-secondary text-primary text-[10px] font-black rounded-full shadow-sm tracking-wider uppercase">
                                                {product.stock} in stock
                                            </span>
                                        </div>
                                        <div className="absolute bottom-4 right-4">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                <Plus size={20} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-2">
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-black text-accent uppercase tracking-widest">{product.brand || 'Original Part'}</p>
                                            <h3 className="text-base font-black text-primary group-hover:text-primary transition-colors leading-tight line-clamp-2 h-10">{product.name}</h3>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-2xl font-black text-primary">${product.price.toLocaleString()}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Tax Incl.</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Ticket Section - Optimized Sidebar Width */}
            <aside className={cn(
                "w-full lg:w-[480px] xl:w-[520px] flex flex-col bg-white lg:bg-transparent z-40 transition-all duration-500",
                "fixed inset-x-0 bottom-0 lg:relative lg:inset-auto",
                isMobileCartOpen ? "h-[90vh]" : "h-20 lg:h-full overflow-hidden"
            )}>
                {/* Mobile Handle */}
                <button
                    onClick={() => setIsMobileCartOpen(!isMobileCartOpen)}
                    className="lg:hidden w-full h-20 flex items-center justify-between px-8 bg-primary text-white"
                >
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <ShoppingCart size={24} strokeWidth={1.5} />
                            {cart.length > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-primary text-[10px] font-bold rounded-full flex items-center justify-center">{cart.length}</span>}
                        </div>
                        <span className="font-black uppercase tracking-widest text-sm">Order Overview</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xl font-black">${total.toLocaleString()}</span>
                        <ChevronUp className={cn("transition-transform duration-300", isMobileCartOpen && "rotate-180")} />
                    </div>
                </button>

                <div className="flex-1 flex flex-col glass lg:m-6 lg:rounded-[3rem] shadow-glass border-none overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

                    {/* Ticket Header */}
                    <div className="p-6 lg:p-8 border-b border-primary/5 relative z-10">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-black text-primary tracking-tight">Active Ticket</h2>
                                        <select
                                            className="bg-primary/5 text-primary text-[10px] font-black py-1 px-2 rounded-lg outline-none border-none cursor-pointer uppercase tracking-wider"
                                            value={currentSale?.id || ''}
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
                                    </div>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{currentSale?.sale_ref || 'Terminal ID: TBX-4'}</p>
                                </div>
                            </div>
                            <button onClick={createNewSale} className="p-2.5 bg-secondary text-primary rounded-xl hover:scale-110 transition-transform active:scale-95 shadow-sm">
                                <PlusCircle size={24} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Customer Row */}
                        <div className="flex items-center gap-3 p-3 glass-dark rounded-2xl group cursor-pointer hover:bg-primary/5 transition-all">
                            <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-primary">
                                <Users size={16} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Customer</p>
                                <select
                                    className="w-full bg-transparent font-black text-xs uppercase outline-none text-primary appearance-none cursor-pointer"
                                    value={currentSale?.customer_id || ''}
                                    onChange={(e) => updateSaleCustomer(e.target.value)}
                                >
                                    <option value="">Select Assignee</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-5 custom-scrollbar relative z-10">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20 px-8">
                                <div className="p-8 bg-primary/5 rounded-[2rem] animate-pulse">
                                    <ShoppingCart size={48} strokeWidth={1} />
                                </div>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] leading-relaxed text-center">System Ready<br />Assign items to ticket</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="group flex gap-4 items-start animate-in slide-in-from-right-4 duration-500">
                                    <div className="w-16 h-16 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 border border-primary/5 relative overflow-hidden">
                                        <ShoppingCart className="text-primary/30" size={20} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 space-y-1.5 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-black text-primary text-[13px] uppercase leading-tight line-clamp-1 group-hover:text-accent transition-colors">{item.name}</h4>
                                            <button onClick={() => removeFromCart(item.id)} className="p-1 text-muted-foreground hover:text-red-500 transition-all">
                                                <X size={14} strokeWidth={2} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm border border-primary/5 p-0.5">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-primary/5 text-primary rounded-md transition-colors"><Minus size={10} strokeWidth={3} /></button>
                                                <span className="w-6 text-center font-black text-xs">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-primary/5 text-primary rounded-md transition-colors"><Plus size={10} strokeWidth={3} /></button>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-bold text-muted-foreground">$</span>
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                                        className="w-20 bg-transparent border-b border-primary/10 text-right font-black text-primary text-[13px] outline-none focus:border-primary transition-colors"
                                                    />
                                                </div>
                                                <span className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase">Total: ${(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Checkout Footer */}
                    <div className="p-6 lg:p-8 bg-primary relative z-20 text-white space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-50">
                                <span>Net Subtotal</span>
                                <span>${subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-50">
                                <span>Sales TAX</span>
                                <span>${tax.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1 pt-4 border-t border-white/10">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">Grand Total</span>
                                    <span className="text-4xl lg:text-5xl font-black tracking-tighter italic">${total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>


                        <button
                            disabled={cart.length === 0 || processing || !currentSale}
                            onClick={handleCheckout}
                            className="w-full py-6 bg-accent text-white rounded-[2rem] text-xl font-black italic shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-3 tracking-tighter"
                        >
                            {processing ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} strokeWidth={2} />}
                            {processing ? "FINALIZING..." : "CLOSE TRANSACTION"}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Float Search Modal (Mobile) */}
            {isSearchModalOpen && (
                <div className="fixed inset-0 z-[100] p-6 lg:hidden bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-primary italic uppercase tracking-tight">Quick Finder</h3>
                            <button onClick={() => setIsSearchModalOpen(false)} className="p-2 glass-dark rounded-xl text-primary"><X size={24} /></button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={24} strokeWidth={1.5} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Part name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-6 rounded-[2rem] bg-secondary/30 font-black text-lg text-primary placeholder:text-primary/20 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="py-4 glass-dark rounded-2xl font-black text-xs uppercase tracking-widest">Filters</button>
                            <button onClick={() => setIsSearchModalOpen(false)} className="py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest">Search</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 bg-primary/95 backdrop-blur-3xl flex items-center justify-center z-[110] animate-in fade-in duration-700">
                    <div className="text-center p-12 space-y-8 animate-in zoom-in duration-500">
                        <div className="w-48 h-48 bg-white text-primary rounded-[4rem] flex items-center justify-center mx-auto shadow-2xl">
                            <CheckCircle2 size={120} strokeWidth={1.5} className="animate-bounce" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-6xl font-black text-white italic tracking-tighter uppercase underline decoration-8 decoration-accent underline-offset-8">Order Confirmed</h3>
                            <p className="text-white/60 font-black text-xs uppercase tracking-[0.4em]">Inventory sync complete • Receipt generating</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

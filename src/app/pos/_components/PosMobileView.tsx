"use client";

import { useState } from "react";
import {
    Search,
    Menu,
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    X,
    Package,
    Loader2,
    CheckCircle2,
    DollarSign,
    Printer,
    Edit3,
    Ticket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateInvoicePDF } from "@/lib/pdf";

interface PosMobileViewProps {
    products: any[];
    openSales: any[];
    customers: any[];
    currentSale: any | null;
    cart: any[];
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    loading: boolean;
    processing: boolean;
    selectSale: (sale: any) => void;
    createNewSale: () => void;
    addToCart: (product: any) => void;
    updateQuantity: (id: string, delta: number) => void;
    updateItemPrice: (id: string, price: number) => void;
    removeFromCart: (id: string) => void;
    handleCheckout: () => void;
    subtotal: number;
    tax: number;
    total: number;
}

export function PosMobileView({
    products,
    cart,
    searchTerm,
    setSearchTerm,
    loading,
    processing,
    currentSale,
    openSales,
    selectSale,
    createNewSale,
    addToCart,
    updateQuantity,
    updateItemPrice,
    removeFromCart,
    handleCheckout,
    subtotal,
    tax,
    total
}: PosMobileViewProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden text-slate-900 pb-20">
            {/* Ticket Management Area */}
            <div className="px-6 pt-6 pb-2 shrink-0 flex items-center gap-3">
                <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3 flex items-center justify-between overflow-hidden relative group">
                    <div className="flex items-center gap-2 min-w-0">
                        <Ticket size={16} className="text-primary shrink-0" />
                        <select
                            className="bg-transparent text-sm font-black text-slate-900 outline-none appearance-none cursor-pointer truncate pr-4"
                            value={currentSale?.id || ""}
                            onChange={(e) => {
                                const sale = openSales.find(s => s.id === e.target.value);
                                if (sale) selectSale(sale);
                            }}
                        >
                            <option value="">Cambiar Ticket</option>
                            {openSales.map(sale => (
                                <option key={sale.id} value={sale.id}>
                                    {sale.sale_ref || `ID: ${sale.id.slice(0, 8)}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Menu size={14} className="text-slate-300 absolute right-4 pointer-events-none" />
                </div>
                
                <button 
                    onClick={() => createNewSale()}
                    className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all shrink-0"
                >
                    <Plus size={20} strokeWidth={2.5} />
                </button>
            </div>

            {/* Sticky Search Trigger */}
            <div className="px-6 py-2 shrink-0">
                <div 
                    onClick={() => setIsSearchOpen(true)}
                    className="relative group cursor-pointer"
                >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <div className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-slate-400 font-semibold text-sm border border-slate-100">
                        Buscar productos
                    </div>
                </div>
            </div>

            {/* Cart List Header */}
            <div className="px-6 py-2 flex items-center justify-between shrink-0">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Productos Agregados</h2>
                <span className="px-3 py-1 bg-orange-50 text-orange-500 text-[10px] font-black rounded-full uppercase">
                    {cart.length} ítems
                </span>
            </div>

            {/* Cart Items */}
            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                        <div className="p-8 border-2 border-dashed border-slate-200 rounded-[3rem] mb-4">
                            <ShoppingCart size={48} />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">Carrito vacío</p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div key={item.id} className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm flex items-center gap-4">
                            {/* Product Image Placeholder */}
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-50 overflow-hidden">
                                <Package className="text-slate-200" size={24} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-black text-slate-900 truncate leading-tight uppercase italic">{item.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span 
                                        onClick={() => setEditingItemId(item.id)}
                                        className="text-xs font-bold text-slate-400 cursor-pointer flex items-center gap-1 hover:text-primary"
                                    >
                                        ${Number(item.price).toFixed(2)}
                                        <Edit3 size={10} />
                                    </span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center bg-slate-50/80 rounded-xl p-1 shrink-0">
                                <button 
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="w-8 h-8 flex items-center justify-center text-slate-400 active:scale-75 transition-transform"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="w-6 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="w-8 h-8 flex items-center justify-center text-slate-400 active:scale-75 transition-transform"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            {/* Delete */}
                            <button 
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-slate-300 hover:text-red-500 active:scale-95"
                            >
                                <Trash2 size={18} strokeWidth={1.5} />
                            </button>
                        </div>
                    ))
                )}
            </main>

            {/* Footer */}
            <footer className="px-6 pt-6 pb-8 border-t border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-400">Subtotal</span>
                    <span className="text-lg font-black text-slate-900 tracking-tight">${subtotal.toLocaleString()}</span>
                </div>

                <div className="flex gap-3">
                    {/* Print Button (Mobile) */}
                    <button
                        disabled={cart.length === 0 || !currentSale}
                        onClick={() => generateInvoicePDF(currentSale, cart, subtotal, tax, total)}
                        className="w-16 h-[72px] bg-slate-100 text-slate-500 rounded-3xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-20"
                    >
                        <Printer size={24} />
                    </button>

                    <button
                        disabled={cart.length === 0 || processing || !currentSale}
                        onClick={handleCheckout}
                        className="flex-1 h-[72px] bg-primary text-white rounded-[2rem] font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-between px-8 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        <span>{processing ? "Procesando..." : "Pagar"}</span>
                        <div className="flex items-center gap-2">
                            <span className="opacity-40 font-medium">|</span>
                            <span>${total.toLocaleString()}</span>
                        </div>
                    </button>
                </div>
            </footer>

            {/* SEARCH POPUP / PRODUCT PICKER */}
            {isSearchOpen && (
                <div className="fixed inset-0 bg-white z-[120] flex flex-col animate-in slide-in-from-bottom duration-300">
                    <header className="px-6 py-4 flex items-center gap-4 border-b border-slate-100">
                        <button onClick={() => setIsSearchOpen(false)} className="p-2 -ml-2">
                            <X size={24} />
                        </button>
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-0 font-semibold text-sm"
                            />
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-20">
                                <Loader2 className="animate-spin mb-2" size={32} />
                                <span className="text-xs font-bold uppercase">Cargando catálogo...</span>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-20">
                                <Search className="mb-2" size={48} />
                                <span className="text-xs font-bold uppercase">No se encontraron productos</span>
                            </div>
                        ) : (
                            products.map((product) => (
                                <div 
                                    key={product.id}
                                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 active:bg-slate-50 transition-colors"
                                    onClick={() => {
                                        addToCart(product);
                                        // Optional: close search on add? No, let user add multiple
                                    }}
                                >
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Package size={20} className="text-slate-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-black truncate text-primary uppercase italic">{product.name}</h4>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.brand || 'Motorcycle Parts'}</span>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-sm font-black text-slate-900 italic">${product.price.toLocaleString()}</span>
                                        <button className="mt-1 p-1 bg-primary text-white rounded-lg active:scale-75 transition-transform">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <footer className="p-6 border-t border-slate-100">
                        <button 
                            onClick={() => setIsSearchOpen(false)}
                            className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest"
                        >
                            Volver al Carrito ({cart.length})
                        </button>
                    </footer>
                </div>
            )}

            {/* PRICE EDIT MODAL (Mobile context) */}
            {editingItemId && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/5 text-primary rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <DollarSign size={32} />
                            </div>
                            <h3 className="text-lg font-black uppercase italic text-primary">Editar Precio</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {cart.find(i => i.id === editingItemId)?.name}
                            </p>
                        </div>

                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</span>
                            <input 
                                autoFocus
                                type="number"
                                defaultValue={cart.find(i => i.id === editingItemId)?.price}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        updateItemPrice(editingItemId, parseFloat((e.target as HTMLInputElement).value) || 0);
                                        setEditingItemId(null);
                                    }
                                }}
                                className="w-full pl-12 pr-6 py-6 bg-slate-50 rounded-3xl border-none text-center text-3xl font-black text-primary italic focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setEditingItemId(null)}
                                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => {
                                    const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                                    updateItemPrice(editingItemId, parseFloat(input.value) || 0);
                                    setEditingItemId(null);
                                }}
                                className="flex-1 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

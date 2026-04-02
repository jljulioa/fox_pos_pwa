"use client";

import React, { useState, useRef, memo } from "react";
import {
    Search,
    Plus,
    ShoppingCart,
    X,
    Loader2,
    DollarSign,
    Printer,
    Edit3,
    Ticket,
    Hash,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateInvoicePDF } from "@/lib/pdf";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    updateItemPrice: (id: string, price: number) => Promise<{ error: string | null }>;
    removeFromCart: (id: string) => void;
    handleCheckout: () => void;
    subtotal: number;
    tax: number;
    total: number;
}

const MobileCartItem = memo(({ item, onEdit, removeFromCart }: any) => (
    <div className="flex items-center gap-2.5 px-1 py-2 border-b border-slate-100 last:border-0 group">
        {/* Qty badge */}
        <div className="w-7 h-7 shrink-0 bg-slate-100 rounded-lg flex items-center justify-center text-[11px] font-black text-slate-600 shadow-inner">
            {item.quantity}
        </div>

        {/* Name + price */}
        <div className="flex-1 min-w-0">
            <p className="text-[12px] font-black text-slate-800 truncate uppercase italic leading-tight">{item.name}</p>
            <p className="text-[10px] font-bold text-slate-400 leading-tight mt-px">${Number(item.price).toLocaleString()} × {item.quantity}</p>
        </div>

        {/* Line total */}
        <span className="text-[13px] font-black italic text-slate-900 shrink-0">
            ${(item.price * item.quantity).toLocaleString()}
        </span>

        {/* Edit */}
        <button
            onClick={() => onEdit(item)}
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg bg-slate-50 text-slate-300 hover:bg-primary/10 hover:text-primary transition-all border border-slate-100"
        >
            <Edit3 size={12} />
        </button>

        {/* Remove */}
        <button
            onClick={() => removeFromCart(item.id)}
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100"
        >
            <Trash2 size={12} />
        </button>
    </div>
));
MobileCartItem.displayName = "MobileCartItem";

const MobileProductCard = memo(({ product, addToCart }: any) => (
    <div
        className="group flex flex-row !p-0 overflow-hidden bg-white border-slate-200 shadow-sm hover:border-primary/40 active:bg-slate-50 transition-all cursor-pointer h-[4.5rem]"
        onClick={() => addToCart(product)}
    >
        <div className="flex-1 min-w-0 p-3 flex flex-col justify-center relative">
            <h4 className="text-sm font-bold text-slate-900 truncate leading-tight tracking-tight pr-6">{product.name}</h4>
            <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.brand || 'Motorcycle Parts'}</span>
                <span className="text-base font-black text-slate-900 italic leading-none">${product.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            
            <div className="absolute top-3.5 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    product.stock > 10 ? "bg-green-500" : "bg-orange-500"
                )} />
            </div>
        </div>
        
        <Button
            variant="ghost"
            onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
            }}
            className="h-full w-14 rounded-none bg-primary/5 active:bg-primary border-l border-slate-100 text-primary active:text-white transition-colors shadow-none"
        >
            <Plus size={20} strokeWidth={2.5} />
        </Button>
    </div>
));
MobileProductCard.displayName = "MobileProductCard";

export const PosMobileView = memo(({
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
}: PosMobileViewProps) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<{ id: string; price: number; qty: number; name: string; cost: number; ceiling: number } | null>(null);
    const [popupPriceError, setPopupPriceError] = useState<string | null>(null);
    const editPriceRef = useRef<HTMLInputElement>(null);
    const editQtyRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden text-slate-900 pb-20">
            {/* Ticket Management Area */}
            <div className="px-6 pt-6 pb-2 shrink-0 flex items-center gap-3">
                <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between overflow-hidden relative group">
                    <Select
                        value={currentSale?.id ? String(currentSale.id) : "switch"}
                        onValueChange={(val) => {
                            if(val === "switch") return;
                            const sale = openSales.find(s => String(s.id) === val);
                            if (sale) selectSale(sale);
                        }}
                    >
                        <SelectTrigger className="w-full bg-transparent border-none shadow-none h-[50px] font-black text-slate-900 px-4 focus:ring-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <Ticket size={16} className="text-primary shrink-0" />
                                <SelectValue placeholder="Cambiar Ticket">
                                    {currentSale ? (openSales.find(s => String(s.id) === String(currentSale.id))?.sale_ref || `ID: ${String(currentSale.id).slice(0, 8)}`) : "Cambiar Ticket"}
                                </SelectValue>
                            </div>
                        </SelectTrigger>
                        <SelectContent className="max-w-[200px]">
                            <SelectItem value="switch">Cambiar Ticket</SelectItem>
                            {openSales.map(sale => (
                                <SelectItem key={String(sale.id)} value={String(sale.id)}>
                                    {sale.sale_ref || `ID: ${String(sale.id).slice(0, 8)}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <Button 
                    size="icon"
                    onClick={() => createNewSale()}
                    className="w-[50px] h-[50px] bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all shrink-0 border-none"
                >
                    <Plus size={20} strokeWidth={2.5} />
                </Button>
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
            <main className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                        <div className="p-8 border-2 border-dashed border-slate-200 rounded-[3rem] mb-4">
                            <ShoppingCart size={48} />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">Carrito vacío</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[var(--ui-radius-xl)] border border-slate-100 shadow-sm px-3 py-1">
                        {cart.map((item) => (
                            <MobileCartItem
                                key={item.id}
                                item={item}
                                onEdit={(i: any) => {
                                    setPopupPriceError(null);
                                    setEditingItem({
                                        id: i.id,
                                        price: i.price,
                                        qty: i.quantity,
                                        name: i.name,
                                        cost: Number(i.cost ?? 0),
                                        ceiling: Number(i.original_price ?? i.price),
                                    });
                                }}
                                removeFromCart={removeFromCart}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="px-6 pt-6 pb-8 border-t border-slate-100 space-y-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Subtotal</span>
                        <span className="text-sm font-black text-slate-900 tracking-tight">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tax</span>
                        <span className="text-sm font-black text-slate-600 tracking-tight">${tax.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        disabled={cart.length === 0 || !currentSale}
                        onClick={() => generateInvoicePDF(currentSale, cart, subtotal, tax, total)}
                        className="w-16 h-[72px] bg-slate-100 text-slate-500 rounded-3xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-20 border-none shadow-none"
                    >
                        <Printer size={24} />
                    </Button>

                    <Button
                        disabled={cart.length === 0 || processing || !currentSale}
                        onClick={handleCheckout}
                        className="flex-1 h-[72px] bg-primary text-white rounded-[2rem] font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-between px-8 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        <span>{processing ? "Cargando..." : "Pagar"}</span>
                        <div className="flex items-center gap-2">
                            <span className="opacity-40 font-medium">|</span>
                            <span>${total.toLocaleString()}</span>
                        </div>
                    </Button>
                </div>
            </footer>

            {/* SEARCH POPUP / PRODUCT PICKER */}
            {isSearchOpen && (
                <div className="fixed inset-0 bg-white z-[120] flex flex-col animate-in slide-in-from-bottom duration-300">
                    <header className="px-6 py-4 flex items-center gap-4 border-b border-slate-100">
                        <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)} className="-ml-2">
                            <X size={24} />
                        </Button>
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
                            <Input
                                autoFocus
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus-visible:ring-0 font-semibold text-sm h-[50px] shadow-none"
                            />
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6 space-y-3" style={{ contentVisibility: 'auto' } as any}>
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
                                <MobileProductCard 
                                    key={product.id} 
                                    product={product} 
                                    addToCart={addToCart} 
                                />
                            ))
                        )}
                    </div>

                    <footer className="p-6 border-t border-slate-100">
                        <Button 
                            variant="secondary"
                            onClick={() => setIsSearchOpen(false)}
                            className="w-full h-14 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-none hover:bg-slate-200"
                        >
                            Volver al Carrito ({cart.length})
                        </Button>
                    </footer>
                </div>
            )}

            {/* PRICE + QTY EDIT POPUP */}
            {editingItem && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-t-[var(--ui-radius-xl)] sm:rounded-[var(--ui-radius-xl)] p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-250">

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 text-primary rounded-[var(--ui-radius-md)] shadow-inner">
                                    <Edit3 size={16} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-[13px] font-black uppercase italic text-slate-900 leading-none">Edit Item</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate max-w-[180px]">{editingItem.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingItem(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100">
                                <X size={15} />
                            </button>
                        </div>

                        {/* Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Price */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1 mr-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Unit Price</label>
                                    <span className="text-[9px] font-bold text-slate-300 italic">
                                        ${editingItem.cost.toFixed(0)}–${editingItem.ceiling.toFixed(0)}
                                    </span>
                                </div>
                                <div className="relative">
                                    <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <Input
                                        ref={editPriceRef}
                                        autoFocus
                                        type="number"
                                        defaultValue={editingItem.price}
                                        onChange={() => setPopupPriceError(null)}
                                        className={`h-11 pl-8 bg-slate-50 border-slate-200 rounded-[var(--ui-radius-md)] text-[15px] font-black italic text-slate-900 text-right pr-3 ${popupPriceError ? 'border-red-400 ring-2 ring-red-300/50 bg-red-50' : ''}`}
                                    />
                                </div>
                            </div>
                            {/* Qty */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Quantity</label>
                                <div className="relative">
                                    <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <Input
                                        ref={editQtyRef}
                                        type="number"
                                        min={1}
                                        defaultValue={editingItem.qty}
                                        className="h-11 pl-8 bg-slate-50 border-slate-200 rounded-[var(--ui-radius-md)] text-[15px] font-black italic text-slate-900 focus:ring-primary/20 text-right pr-3"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-[var(--ui-radius-md)] border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Line Total (est.)</span>
                            <span className="text-[15px] font-black italic text-primary">
                                ${((editPriceRef.current ? parseFloat(editPriceRef.current.value) || editingItem.price : editingItem.price) * (editQtyRef.current ? parseInt(editQtyRef.current.value) || editingItem.qty : editingItem.qty)).toLocaleString()}
                            </span>
                        </div>

                        {/* Inline price error */}
                        {popupPriceError && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-[var(--ui-radius-md)] border border-red-200 text-red-600 animate-in slide-in-from-top-1">
                                <span className="text-[10px] font-black uppercase tracking-widest leading-snug">
                                    ⚠ {popupPriceError.split('.')[0]}.
                                </span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => { setEditingItem(null); setPopupPriceError(null); }}
                                className="flex-1 h-11 text-[11px] font-black uppercase tracking-widest text-slate-400 italic">
                                Cancel
                            </Button>
                            <Button
                                onClick={async () => {
                                    const newPrice = parseFloat(editPriceRef.current?.value ?? "") || editingItem.price;
                                    const newQty = parseInt(editQtyRef.current?.value ?? "") || editingItem.qty;
                                    const result = await updateItemPrice(editingItem.id, newPrice);
                                    if (result?.error) {
                                        setPopupPriceError(result.error);
                                        return; // keep popup open
                                    }
                                    // qty sync only if price passed
                                    const delta = newQty - editingItem.qty;
                                    if (delta !== 0) updateQuantity(editingItem.id, delta);
                                    setEditingItem(null);
                                    setPopupPriceError(null);
                                }}
                                className="flex-[2] h-11 bg-primary text-white rounded-[var(--ui-radius-md)] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 italic active:scale-[0.98] transition-all">
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
PosMobileView.displayName = "PosMobileView";

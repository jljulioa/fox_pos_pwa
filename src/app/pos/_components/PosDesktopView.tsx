"use client";

import React, { memo } from "react";
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Loader2,
    Ticket,
    Users,
    Package,
    Trash2,
    Hash,
    DollarSign,
    Percent,
    Printer,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateInvoicePDF } from "@/lib/pdf";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface PosDesktopViewProps {
    products: any[];
    openSales: any[];
    customers: any[];
    currentSale: any | null;
    cart: any[];
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    loading: boolean;
    processing: boolean;
    error: string | null;
    selectSale: (sale: any) => void;
    createNewSale: () => void;
    updateSaleCustomer: (id: string) => void;
    addToCart: (product: any) => void;
    updateQuantity: (id: string, delta: number) => void;
    updateItemPrice: (id: string, price: number) => void;
    removeFromCart: (id: string) => void;
    handleCheckout: () => void;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
}

const CartItem = memo(({ item, index, updateItemPrice, updateQuantity, removeFromCart }: any) => {
    const [localPrice, setLocalPrice] = React.useState(item.price);

    React.useEffect(() => {
        setLocalPrice(item.price);
    }, [item.price]);

    const handlePriceSubmit = () => {
        const parsed = parseFloat(localPrice as string) || 0;
        if (parsed !== item.price) {
            updateItemPrice(item.id, parsed);
        }
    };

    return (
        <TableRow className="group hover:bg-primary/[0.04] transition-colors border-b-0 border-primary/5">
            <TableCell className="px-6 py-3">
                <span className="text-[10px] font-bold text-slate-400">{String(index + 1).padStart(2, '0')}</span>
            </TableCell>
            <TableCell className="px-6 py-3">
                <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-slate-900 group-hover:text-primary transition-colors">{item.name}</span>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{item.brand || 'SKU-GENERIC'}</span>
                </div>
            </TableCell>
            <TableCell className="px-6 py-3">
                <div className="flex items-center justify-center gap-1">
                    <span className="text-[10px] font-bold text-slate-300">$</span>
                    <Input
                        type="number"
                        value={localPrice}
                        onChange={(e) => setLocalPrice(e.target.value)}
                        onBlur={handlePriceSubmit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handlePriceSubmit();
                        }}
                        className="w-16 bg-transparent border-none text-center font-bold text-slate-700 text-[13px] outline-none focus-visible:ring-0 p-0 shadow-none"
                    />
                </div>
            </TableCell>
            <TableCell className="px-6 py-3">
                <div className="flex items-center justify-center gap-2.5">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded-[var(--ui-radius-sm)] bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all border border-slate-100 shadow-sm"
                    >
                        <Minus size={10} strokeWidth={3} />
                    </Button>
                    <span className="w-5 text-center text-[13px] font-bold text-slate-900">{item.quantity}</span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-[var(--ui-radius-sm)] bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all border border-slate-100 shadow-sm"
                    >
                        <Plus size={10} strokeWidth={3} />
                    </Button>
                </div>
            </TableCell>
            <TableCell className="px-6 py-3 text-right">
                <span className="text-[13px] font-bold text-slate-900">${(item.price * item.quantity).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </TableCell>
            <TableCell className="px-6 py-3 text-center">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-[var(--ui-radius-sm)] text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={16} strokeWidth={2} />
                </Button>
            </TableCell>
        </TableRow>
    );
});
CartItem.displayName = "CartItem";

const ProductCard = memo(({ product, addToCart }: any) => (
    <Card 
        className="group flex flex-row !p-0 overflow-hidden bg-white border-slate-200 shadow-sm hover:border-primary/40 hover:shadow-md transition-all cursor-pointer h-[4rem] rounded-[var(--ui-radius-md)]"
        onClick={() => addToCart(product)}
    >
        <div className="flex-1 min-w-0 p-2.5 flex flex-col justify-center relative">
            <h4 className="text-[13px] font-bold text-slate-900 truncate leading-tight tracking-tight pr-6">{product.name}</h4>
            <div className="flex items-center justify-between mt-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{product.brand || 'Parts Dept'}</span>
                <span className="text-sm font-black text-slate-900 italic leading-none">${product.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            
            <div className="absolute top-3 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                <span className={cn(
                    "w-1 h-1 rounded-full animate-pulse",
                    product.stock > 10 ? "bg-green-500" : "bg-orange-500"
                )} />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{product.stock}</span>
            </div>
        </div>

        <Button
            variant="ghost"
            onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
            }}
            className="h-full w-12 rounded-none bg-primary/5 hover:bg-primary border-l border-slate-100 hover:border-primary text-primary hover:text-white transition-colors shadow-none"
        >
            <Plus size={18} strokeWidth={2.5} />
        </Button>
    </Card>
));
ProductCard.displayName = "ProductCard";

export const PosDesktopView = memo(({
    products,
    openSales,
    customers,
    currentSale,
    cart,
    searchTerm,
    setSearchTerm,
    loading,
    processing,
    selectSale,
    createNewSale,
    updateSaleCustomer,
    addToCart,
    updateQuantity,
    updateItemPrice,
    removeFromCart,
    handleCheckout,
    subtotal,
    tax,
    discount,
    total
}: PosDesktopViewProps) => {
    return (
        <div className="flex h-screen bg-transparent overflow-hidden lg:p-3">
            {/* --- CENTRAL MAIN SECTION (The Ticket) --- */}
            <section className="flex-1 flex flex-col min-w-0 glass lg:rounded-[var(--sidebar-radius)] border border-primary/5 shadow-glass overflow-hidden">
                {/* Ticket Header */}
                <header className="px-6 py-4 border-b border-primary/5 bg-primary/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-primary/5 rounded-[var(--ui-radius-md)] text-primary">
                            <Ticket size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Active Ticket</h1>
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-full uppercase tracking-wider">
                                    {currentSale?.sale_ref || "NEW TICKET"}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1.5 cursor-pointer group">
                                    <Users size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
                                    <Select
                                        value={currentSale?.customer_id ? String(currentSale.customer_id) : "guest"}
                                        onValueChange={(val) => updateSaleCustomer(!val || val === "guest" ? "" : val)}
                                    >
                                        <SelectTrigger className="border-none shadow-none h-auto py-0 px-1 bg-transparent text-[11px] font-semibold text-slate-500 hover:text-primary min-w-[120px] focus:ring-0">
                                            <SelectValue placeholder="Guest Customer">
                                                {currentSale?.customer_id && currentSale.customer_id !== "guest" 
                                                    ? customers.find(c => String(c.id) === String(currentSale.customer_id))?.name || "Guest Customer"
                                                    : "Guest Customer"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="guest">Guest Customer</SelectItem>
                                            {customers.map(c => <SelectItem key={String(c.id)} value={String(c.id)}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
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
                        <Select
                            value={currentSale?.id ? String(currentSale.id) : "switch"}
                            onValueChange={(val) => {
                                if(val === "switch") return;
                                const sale = openSales.find(s => String(s.id) === val);
                                if (sale) selectSale(sale);
                            }}
                        >
                            <SelectTrigger className="bg-slate-50 text-slate-600 text-[10px] font-bold h-9 px-3 rounded-[var(--ui-radius-md)] outline-none border border-slate-200 cursor-pointer focus:ring-2 focus:ring-primary/5 transition-all shadow-none w-[150px]">
                                <SelectValue placeholder="Switch Ticket">
                                    {currentSale ? (openSales.find(s => String(s.id) === String(currentSale.id))?.sale_ref || `ID: ${String(currentSale.id).slice(0, 8)}`) : "Switch Ticket"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {openSales.map(sale => (
                                    <SelectItem key={String(sale.id)} value={String(sale.id)}>
                                        {sale.sale_ref || `ID: ${String(sale.id).slice(0, 8)}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => createNewSale()}
                            className="w-9 h-9 bg-white text-primary border border-slate-200 rounded-[var(--ui-radius-md)] hover:bg-primary/5 transition-all shadow-sm active:scale-95"
                            title="New Ticket"
                        >
                            <Plus size={18} strokeWidth={2.5} />
                        </Button>
                        <Sheet>
                            <SheetTrigger
                                render={<Button className="h-9 px-4 bg-primary text-white rounded-[var(--ui-radius-md)] shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-xs font-bold" />}
                            >
                                <Search size={14} /> <span className="hidden sm:inline">Search Products</span>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:w-[500px] p-0 flex flex-col bg-slate-50 border-l border-slate-100">
                                <SheetHeader className="p-6 bg-white border-b border-slate-200 text-left">
                                    <SheetTitle>Search Products</SheetTitle>
                                    <div className="relative group mt-4">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors z-10" size={16} />
                                        <Input
                                            type="text"
                                            placeholder="Find products or scan..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[var(--ui-radius-md)] border-none focus-visible:ring-2 focus-visible:ring-primary/10 transition-all font-semibold text-[13px] text-slate-700 h-[44px] shadow-none"
                                        />
                                    </div>
                                </SheetHeader>
                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" style={{ contentVisibility: 'auto' } as any}>
                                    {loading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4, 5, 6].map(i => (
                                                <div key={i} className="h-16 bg-white rounded-[var(--ui-radius-md)] animate-pulse shadow-sm border border-slate-100" />
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
                                                <ProductCard 
                                                    key={product.id} 
                                                    product={product} 
                                                    addToCart={addToCart} 
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </header>

                {/* Ticket Body (High-Density Table) */}
                <main className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-primary/[0.02]">
                    <div className="glass-dark rounded-[var(--ui-radius-lg)] border border-primary/5 overflow-hidden max-w-7xl mx-auto w-full">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                    <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16">#</TableHead>
                                    <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Description</TableHead>
                                    <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center w-32">Price</TableHead>
                                    <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center w-32">Qty</TableHead>
                                    <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right w-32">Subtotal</TableHead>
                                    <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-slate-50">
                                {cart.length === 0 ? (
                                    <TableRow className="hover:bg-transparent">
                                        <TableCell colSpan={6} className="px-6 py-20 text-center border-b-0">
                                            <div className="flex flex-col items-center justify-center opacity-20">
                                                <div className="p-6 border-2 border-dashed border-slate-300 rounded-[var(--ui-radius-xl)] mb-4 inline-flex">
                                                    <ShoppingCart size={48} strokeWidth={1} />
                                                </div>
                                                <p className="text-xs font-bold uppercase tracking-[0.3em]">No items in ticket</p>
                                                <p className="text-[10px] mt-2 font-medium">Click "Search Products" to build the ticket</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cart.map((item, index) => (
                                        <CartItem 
                                            key={item.id} 
                                            item={item} 
                                            index={index} 
                                            updateItemPrice={updateItemPrice}
                                            updateQuantity={updateQuantity}
                                            removeFromCart={removeFromCart}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </main>

                {/* Bottom Summary Section */}
                <footer className="p-8 glass border-t border-primary/5 bg-primary/[0.02]">
                    <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-8 max-w-7xl mx-auto w-full">
                        <div className="flex flex-wrap items-center gap-3 w-full">
                            <div className="flex-1 min-w-[130px] p-3 bg-slate-50 rounded-[var(--ui-radius-md)] border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                                    <Hash size={11} /> Subtotal
                                </p>
                                <p className="text-lg font-bold text-slate-900 italic tracking-tight">${subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                            </div>
                            <div className="flex-1 min-w-[130px] p-3 bg-slate-50 rounded-[var(--ui-radius-md)] border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                                    <Percent size={11} /> Taxes
                                </p>
                                <p className="text-lg font-bold text-slate-900 italic tracking-tight">${tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                            </div>
                            <div className="flex-1 min-w-[130px] p-3 bg-slate-50 rounded-[var(--ui-radius-md)] border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                                    <DollarSign size={11} /> Discounts
                                </p>
                                <p className="text-lg font-bold text-slate-900 italic tracking-tight text-red-500">-${discount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex items-center gap-3 shrink-0 justify-end md:justify-start">
                            <div className="text-right flex flex-col items-end pr-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total to Charge</span>
                                <span className="text-3xl font-black text-primary italic tracking-tighter leading-none">${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                            <Button
                                disabled={cart.length === 0 || !currentSale}
                                onClick={() => generateInvoicePDF(currentSale, cart, subtotal, tax, total)}
                                className="h-[60px] px-5 bg-slate-100 text-slate-500 rounded-[var(--ui-radius-xl)] text-base font-bold flex items-center justify-center gap-2 hover:bg-slate-200 hover:text-slate-600 transition-all active:scale-95 disabled:opacity-20 disabled:scale-100 shadow-none border-none"
                                title="Print Invoice / PDF"
                            >
                                <Printer size={20} strokeWidth={2.5} />
                            </Button>
                            <Button
                                disabled={cart.length === 0 || processing || !currentSale}
                                onClick={handleCheckout}
                                className="h-[60px] px-8 bg-primary text-white rounded-[var(--ui-radius-xl)] text-base font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] hover:shadow-2xl transition-all active:scale-95 disabled:opacity-20 disabled:scale-100 uppercase tracking-tight"
                            >
                                {processing ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <CheckCircle2 size={20} strokeWidth={2.5} />
                                )}
                                <span>{processing ? "Processing" : "Finalize Order"}</span>
                            </Button>
                        </div>
                    </div>
                </footer>
            </section>
        </div>
    );
});
PosDesktopView.displayName = "PosDesktopView";

"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Package,
    Search,
    AlertCircle,
    Plus,
    SlidersHorizontal,
    X,
    Filter,
    Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { inventoryService } from "@/services/inventoryService";
import { InventoryDesktopView } from "./_components/InventoryDesktopView";
import { InventoryMobileView } from "./_components/InventoryMobileView";
import { ProductModal } from "./_components/ProductModal";
import { InventoryStats } from "./_components/InventoryStats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InventoryPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [pageError, setPageError] = useState<string | null>(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        sku: "",
        reference: "",
        brand: "",
        cost: "0",
        price: "0",
        stock: "0",
        min_stock: "0",
        max_stock: "0",
        category_id: "",
        taxable: true
    });
    const [categories, setCategories] = useState<any[]>([]);

    // Filter State
    const [showFilters, setShowFilters] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterMinPrice, setFilterMinPrice] = useState<string>("");
    const [filterMaxPrice, setFilterMaxPrice] = useState<string>("");
    const [filterOutOfStock, setFilterOutOfStock] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([fetchProducts(), fetchCategories()]);
        setLoading(false);
    };

    const fetchProducts = async () => {
        setPageError(null);
        try {
            const { data, error } = await inventoryService.fetchProducts();
            if (error) throw error;
            setProducts(data || []);
        } catch (err: any) {
            setPageError(err.message);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data, error } = await inventoryService.fetchCategories();
            if (error) throw error;
            setCategories(data || []);
            if (!isEditing && data && data.length > 0 && !formData.category_id) {
                setFormData(prev => ({ ...prev, category_id: data[0].id }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({
            id: "",
            name: "",
            sku: "AUTO-GENERATE",
            reference: "",
            brand: "",
            cost: "0",
            price: "0",
            stock: "0",
            min_stock: "0",
            max_stock: "0",
            category_id: categories[0]?.id || "",
            taxable: true
        });
        setShowModal(true);
    };

    const openEditModal = (product: any) => {
        setIsEditing(true);
        setFormData({
            id: product.id,
            name: product.name,
            sku: product.sku || "",
            reference: product.reference || "",
            brand: product.brand || "",
            cost: product.cost.toString(),
            price: product.price.toString(),
            stock: product.stock.toString(),
            min_stock: (product.min_stock || 0).toString(),
            max_stock: (product.max_stock || 0).toString(),
            category_id: product.category_id || "",
            taxable: product.taxable === true
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let finalSku = formData.sku;
            if (!isEditing) {
                const { data: generated, error: rpcErr } = await inventoryService.generateSku(formData.category_id, formData.brand);
                if (rpcErr) throw rpcErr;
                finalSku = generated;
            }
            const payload = {
                ...formData,
                sku: finalSku,
                cost: parseFloat(formData.cost),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                min_stock: parseInt(formData.min_stock),
                max_stock: parseInt(formData.max_stock)
            };
            if (isEditing) {
                await inventoryService.updateProduct(formData.id, payload);
            } else {
                await inventoryService.createProduct(payload);
            }
            setShowModal(false);
            fetchProducts();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete ${name}?`)) return;
        await inventoryService.deleteProduct(id);
        fetchProducts();
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === "all" || p.category_id === filterCategory;
            const price = parseFloat(p.price);
            const matchesMinPrice = filterMinPrice === "" || price >= parseFloat(filterMinPrice);
            const matchesMaxPrice = filterMaxPrice === "" || price <= parseFloat(filterMaxPrice);
            const matchesStock = !filterOutOfStock || parseInt(p.stock) <= 0;
            return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesStock;
        });
    }, [products, searchTerm, filterCategory, filterMinPrice, filterMaxPrice, filterOutOfStock]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterCategory !== "all") count++;
        if (filterMinPrice !== "" || filterMaxPrice !== "") count++;
        if (filterOutOfStock) count++;
        return count;
    }, [filterCategory, filterMinPrice, filterMaxPrice, filterOutOfStock]);

    const resetFilters = () => {
        setFilterCategory("all");
        setFilterMinPrice("");
        setFilterMaxPrice("");
        setFilterOutOfStock(false);
    };

    return (
        <div className="md:px-3 md:py-3 flex flex-col h-full gap-6 overflow-hidden md:bg-white rounded-[var(--sidebar-radius)] md:shadow-glass">
            {/* Header Section */}
            <header className="px-5 py-5 border-b border-primary/5 glass shrink-0 shadow-glass z-20 rounded-[var(--sidebar-radius)] mb-3">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 max-w-[1600px] mx-auto">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-[var(--ui-radius-lg)]">
                                <Package size={18} strokeWidth={2.5} />
                            </div>
                            <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase italic leading-none">Catalog Management</h1>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic ml-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Inventory Protocol • {filteredProducts.length} Active Nodes Deployment
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 w-full xl:w-auto">
                        <div className="relative flex-1 md:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={14} />
                            <Input
                                type="text"
                                placeholder="Search Catalog Matrix..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-8 pl-9 bg-slate-50 border-slate-200 rounded-[var(--ui-radius-md)] text-[11px] font-bold uppercase italic tracking-widest text-slate-600 focus:bg-white transition-all shadow-inner"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(true)}
                            className={cn(
                                "h-10 px-3 sm:px-5 border-slate-200 bg-white rounded-[var(--ui-radius-md)] font-black text-[11px] uppercase tracking-widest italic flex items-center gap-2 sm:gap-2.5 transition-all shadow-sm",
                                activeFilterCount > 0 ? "border-primary/40 text-primary bg-primary/5 ring-1 ring-primary/10" : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                            )}
                        >
                            <SlidersHorizontal size={14} className={activeFilterCount > 0 ? "animate-pulse" : ""} strokeWidth={2.5} />
                            <span className="hidden sm:inline">
                                {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters"}
                            </span>
                            {activeFilterCount > 0 && (
                                <span className="sm:hidden font-black">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>

                        <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-slate-400 hover:bg-slate-50 rounded-[var(--ui-radius-md)] border border-slate-100 shadow-sm"
                            >
                                <Download size={16} strokeWidth={2.5} />
                            </Button>
                            <Button
                                onClick={openAddModal}
                                className="h-10 w-10 bg-primary text-white rounded-[var(--ui-radius-md)] shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center"
                            >
                                <Plus size={20} strokeWidth={2.5} />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Bar */}
            <div className="px-0 py-2 shrink-0 overflow-x-auto no-scrollbar">
                <div className="max-w-[1600px] mx-auto">
                    <InventoryStats products={filteredProducts} />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 pb-3 overflow-hidden p-0 max-w-[1600px] mx-auto w-full flex flex-col">
                {pageError && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-[var(--ui-radius-md)] border border-red-100 flex items-center gap-3 shadow-sm shrink-0">
                        <AlertCircle size={18} strokeWidth={2.5} />
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none">Database Error</p>
                            <p className="text-[10px] font-bold opacity-80 mt-1">{pageError}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={fetchProducts} className="h-7 px-3 bg-red-600 text-white hover:bg-red-700 text-[9px] font-black uppercase tracking-widest rounded-[var(--ui-radius-sm)]">Retry</Button>
                    </div>
                )}

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <div className="hidden lg:flex flex-col flex-1 min-h-0">
                        <InventoryDesktopView 
                            products={filteredProducts} 
                            loading={loading} 
                            onEdit={openEditModal} 
                            onDelete={handleDelete} 
                        />
                    </div>
                    <div className="lg:hidden flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 flex flex-col">
                        <InventoryMobileView 
                            products={filteredProducts} 
                            loading={loading} 
                            onEdit={openEditModal} 
                            onDelete={handleDelete} 
                        />
                    </div>
                </div>
            </main>

            {/* Filters Popup */}
            {showFilters && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[110] p-0 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-t-[var(--ui-radius-xl)] sm:rounded-[var(--ui-radius-xl)] shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col p-6 sm:p-8 space-y-6 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 text-primary rounded-[var(--ui-radius-md)] shadow-inner">
                                    <SlidersHorizontal size={18} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight leading-none">Catalog Filters</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 italic">Specification Search Matrix</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-400">
                                <X size={20} />
                            </Button>
                        </div>

                        <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic opacity-70">Category Select</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setFilterCategory("all")}
                                        className={cn(
                                            "px-4 py-2.5 rounded-[var(--ui-radius-md)] text-[11px] font-black uppercase tracking-widest border transition-all italic",
                                            filterCategory === "all" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-slate-500 border-slate-200 hover:border-primary/20 hover:text-primary"
                                        )}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setFilterCategory(cat.id)}
                                            className={cn(
                                                "px-4 py-2.5 rounded-[var(--ui-radius-md)] text-[11px] font-black uppercase tracking-widest border transition-all italic truncate",
                                                filterCategory === cat.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-slate-500 border-slate-200 hover:border-primary/20 hover:text-primary"
                                            )}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic opacity-70">Price Boundary ($)</label>
                                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/50 rounded-[var(--ui-radius-lg)] border border-slate-200/60">
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filterMinPrice}
                                            onChange={(e) => setFilterMinPrice(e.target.value)}
                                            className="h-10 pl-8 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-600 focus:ring-primary/10"
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filterMaxPrice}
                                            onChange={(e) => setFilterMaxPrice(e.target.value)}
                                            className="h-10 pl-8 bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-600 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic opacity-70">Stock Availability</label>
                                <button
                                    onClick={() => setFilterOutOfStock(!filterOutOfStock)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-5 py-4 rounded-[var(--ui-radius-md)] border transition-all italic",
                                        filterOutOfStock ? "bg-red-50 border-red-200 text-red-600 shadow-inner" : "bg-white border-slate-200 text-slate-600"
                                    )}
                                >
                                    <span className="text-[11px] font-black uppercase tracking-widest">Show Out of Stock Only</span>
                                    <div className={cn(
                                        "w-10 h-6 rounded-full relative transition-all shadow-inner",
                                        filterOutOfStock ? "bg-red-500" : "bg-slate-200"
                                    )}>
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                            filterOutOfStock ? "left-5" : "left-1"
                                        )} />
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-100 mb-2">
                            <Button
                                variant="outline"
                                onClick={resetFilters}
                                className="flex-1 h-12 rounded-[var(--ui-radius-md)] border-slate-200 text-slate-400 text-[11px] font-black uppercase tracking-widest italic"
                            >
                                Reset Matrix
                            </Button>
                            <Button
                                onClick={() => setShowFilters(false)}
                                className="flex-[2] h-12 rounded-[var(--ui-radius-md)] bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-95 transition-all italic"
                            >
                                Apply Catalog Filters
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <ProductModal
                showModal={showModal}
                setShowModal={setShowModal}
                isEditing={isEditing}
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                handleSubmit={handleSubmit}
                submitting={submitting}
            />
        </div>
    );
}

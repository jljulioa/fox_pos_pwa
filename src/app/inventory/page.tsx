"use client";

import { useState, useEffect } from "react";
import {
    Package,
    Search,
    AlertCircle,
    Plus,
    SlidersHorizontal,
    X,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { inventoryService } from "@/services/inventoryService";
import { InventoryDesktopView } from "./_components/InventoryDesktopView";
import { InventoryMobileView } from "./_components/InventoryMobileView";
import { ProductModal } from "./_components/ProductModal";

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

    async function fetchInitialData() {
        setLoading(true);
        await Promise.all([fetchProducts(), fetchCategories()]);
        setLoading(false);
    }

    async function fetchProducts() {
        setPageError(null);
        try {
            const { data, error } = await inventoryService.fetchProducts();

            if (error) throw error;
            setProducts(data || []);
        } catch (err: any) {
            console.error("Error fetching products:", err);
            setPageError(err.message);
        }
    }

    async function fetchCategories() {
        try {
            const { data, error } = await inventoryService.fetchCategories();
            if (error) throw error;
            setCategories(data || []);
            // Set default category if creating
            if (!isEditing && data && data.length > 0 && !formData.category_id) {
                setFormData(prev => ({ ...prev, category_id: data[0].id }));
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    }

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

            // Handle SKU generation for new products
            if (!isEditing) {
                const { data: generated, error: rpcErr } = await inventoryService.generateSku(
                    formData.category_id,
                    formData.brand
                );
                if (rpcErr) throw rpcErr;
                finalSku = generated;
            }

            const payload: any = {
                name: formData.name,
                sku: finalSku,
                reference: formData.reference,
                brand: formData.brand,
                cost: parseFloat(formData.cost),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                min_stock: parseInt(formData.min_stock),
                max_stock: parseInt(formData.max_stock),
                category_id: formData.category_id,
                taxable: formData.taxable
            };

            if (isEditing) {
                const { error } = await inventoryService.updateProduct(formData.id, payload);
                if (error) throw error;
            } else {
                const { error } = await inventoryService.createProduct(payload);
                if (error) throw error;
            }

            setShowModal(false);
            fetchProducts();
        } catch (err: any) {
            alert("Error saving product: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

        try {
            const { error } = await inventoryService.deleteProduct(id);
            if (error) throw error;
            fetchProducts();
        } catch (err: any) {
            alert("Error deleting product: " + err.message);
        }
    };

    const filteredProducts = products.filter(p => {
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

    const resetFilters = () => {
        setFilterCategory("all");
        setFilterMinPrice("");
        setFilterMaxPrice("");
        setFilterOutOfStock(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-4rem)] lg:-m-4 gap-0 overflow-hidden bg-[#F8F9FA]">
            {/* Header Section */}
            <header className="p-3 md:p-6 lg:p-10 pb-2 md:pb-6 space-y-3 md:space-y-6 shrink-0">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex w-10 h-10 bg-primary rounded-xl items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                            <Package size={20} strokeWidth={1.5} />
                        </div>
                        <h1 className="text-xl md:text-3xl font-black tracking-tight text-primary uppercase italic">Inventory</h1>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="bg-primary text-white h-10 px-4 md:px-8 rounded-xl md:rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-[10px] md:text-xs uppercase tracking-widest shrink-0"
                    >
                        <Plus className="w-4 h-4" strokeWidth={3} />
                        <span className="hidden sm:inline">Add Part</span>
                        <span className="sm:hidden">New</span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={16} strokeWidth={2} />
                        <input
                            type="text"
                            placeholder="Search parts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white shadow-sm border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary text-xs cursor-text"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(true)}
                        className={cn(
                            "p-2.5 rounded-xl border transition-all flex items-center gap-2",
                            (filterCategory !== "all" || filterMinPrice !== "" || filterMaxPrice !== "" || filterOutOfStock)
                                ? "bg-primary text-white border-primary shadow-md"
                                : "bg-white text-primary border-primary/10 hover:bg-primary/5"
                        )}
                    >
                        <SlidersHorizontal size={18} strokeWidth={2} />
                        <span className="hidden md:inline text-xs font-black uppercase tracking-widest">Filters</span>
                    </button>
                </div>
            </header>

            {/* Main Catalog Space */}
            <main className="flex-1 overflow-y-auto px-3 md:px-6 lg:px-10 pb-6 md:pb-10 custom-scrollbar">
                {pageError && (
                    <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 shadow-sm">
                        <AlertCircle size={20} strokeWidth={2} />
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest">Database Error</p>
                            <p className="text-[10px] font-bold opacity-80">{pageError}</p>
                        </div>
                        <button onClick={fetchProducts} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Retry</button>
                    </div>
                )}

                <div className="hidden lg:block">
                    <InventoryDesktopView 
                        products={filteredProducts} 
                        loading={loading} 
                        onEdit={openEditModal} 
                        onDelete={handleDelete} 
                    />
                </div>
                <div className="block lg:hidden">
                    <InventoryMobileView 
                        products={filteredProducts} 
                        loading={loading} 
                        onEdit={openEditModal} 
                        onDelete={handleDelete} 
                    />
                </div>
            </main>

            {/* Filters Popup */}
            {showFilters && (
                <div className="fixed inset-0 bg-primary/20 backdrop-blur-md flex items-end sm:items-center justify-center z-[110] p-0 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl border border-primary/10 overflow-hidden relative flex flex-col p-6 sm:p-8 space-y-6 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/5 text-primary rounded-xl">
                                    <Filter size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-black text-primary uppercase italic">Search Filters</h3>
                            </div>
                            <button onClick={() => setShowFilters(false)} className="p-2 bg-secondary/50 rounded-xl hover:bg-primary/5 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                            {/* Category Filter */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Category</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setFilterCategory("all")}
                                        className={cn(
                                            "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                            filterCategory === "all" ? "bg-primary text-white border-primary" : "bg-white text-primary border-primary/10"
                                        )}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setFilterCategory(cat.id)}
                                            className={cn(
                                                "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all truncate",
                                                filterCategory === cat.id ? "bg-primary text-white border-primary" : "bg-white text-primary border-primary/10"
                                            )}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Price Range ($)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 font-bold">$</span>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filterMinPrice}
                                            onChange={(e) => setFilterMinPrice(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 rounded-xl bg-secondary/20 border-none font-bold text-primary text-xs"
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 font-bold">$</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filterMaxPrice}
                                            onChange={(e) => setFilterMaxPrice(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 rounded-xl bg-secondary/20 border-none font-bold text-primary text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stock Filter */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Stock Level</label>
                                <button
                                    onClick={() => setFilterOutOfStock(!filterOutOfStock)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all",
                                        filterOutOfStock ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-primary/10 text-primary"
                                    )}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Show Out of Stock Only</span>
                                    <div className={cn(
                                        "w-10 h-6 rounded-full relative transition-all",
                                        filterOutOfStock ? "bg-red-600" : "bg-secondary"
                                    )}>
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                            filterOutOfStock ? "left-5" : "left-1"
                                        )} />
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-primary/5">
                            <button
                                onClick={resetFilters}
                                className="flex-1 py-4 rounded-xl bg-secondary/50 text-primary/40 text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="flex-[2] py-4 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Extracted Product Modal */}
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

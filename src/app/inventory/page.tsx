"use client";

import { useState, useEffect } from "react";
import {
    Package,
    Search,
    Filter,
    AlertCircle,
    Plus,
    Edit3,
    X,
    Loader2,
    CheckCircle2,
    Trash2,
    Tag,
    Hash,
    Box,
    Receipt,
    FileText,
    DollarSign,
    Layers,
    ArrowRight,
    TrendingUp,
    Store
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

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
            const { data, error } = await supabase
                .from("products")
                .select("*, product_categories(name, sku_slug)")
                .order("name");

            if (error) throw error;
            setProducts(data || []);
        } catch (err: any) {
            console.error("Error fetching products:", err);
            setPageError(err.message);
        }
    }

    async function fetchCategories() {
        try {
            const { data, error } = await supabase.from("product_categories").select("*");
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
                const { data: generated, error: rpcErr } = await supabase.rpc('generate_moto_sku', {
                    cat_id: formData.category_id,
                    brand_name: formData.brand
                });
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
                const { error } = await supabase
                    .from("products")
                    .update(payload)
                    .eq("id", formData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("products")
                    .insert(payload);
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
            const { error } = await supabase.from("products").delete().eq("id", id);
            if (error) throw error;
            fetchProducts();
        } catch (err: any) {
            alert("Error deleting product: " + err.message);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] lg:-m-4 gap-0 overflow-hidden bg-[#F8F9FA]">
            {/* Header Section */}
            <header className="p-6 lg:p-10 space-y-8 shrink-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <Package size={24} strokeWidth={1.5} />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-primary">Inventory</h1>
                        </div>
                        <p className="text-muted-foreground font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                            Master Workshop Product Catalog
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="bg-primary text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
                    >
                        <Plus size={18} strokeWidth={1.5} />
                        Add New Part
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-6 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={20} strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Filter by name, SKU or brand..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 rounded-3xl bg-white shadow-sm border-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold italic text-primary"
                        />
                    </div>
                </div>
            </header>

            {/* Main Catalog Space */}
            <main className="flex-1 overflow-y-auto px-6 lg:px-10 pb-10 custom-scrollbar">
                {pageError && (
                    <div className="mb-8 p-6 bg-red-50 text-red-600 rounded-[2.5rem] border border-red-100 flex items-center gap-5 shadow-sm">
                        <AlertCircle size={24} strokeWidth={1.5} />
                        <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-widest mb-1">Database Connection Alert</p>
                            <p className="text-xs font-bold opacity-80">{pageError}</p>
                        </div>
                        <button onClick={fetchProducts} className="px-5 py-2.5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Retry</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-64 rounded-[2.5rem] bg-white animate-pulse shadow-sm" />)
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-30">
                            <div className="p-10 bg-primary/5 rounded-[3rem]">
                                <Box size={80} strokeWidth={1} className="text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-primary uppercase tracking-widest">Workshop Floor Empty</h3>
                                <p className="text-xs font-bold uppercase tracking-widest">No matching parts found in active catalog</p>
                            </div>
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="group relative bg-white rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-primary/5 flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-primary/5 text-primary text-[9px] font-black rounded-full uppercase tracking-widest border border-primary/10">
                                                {product.product_categories?.name || "General"}
                                            </span>
                                            {product.stock < 10 && (
                                                <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black rounded-full uppercase tracking-widest border border-red-100 animate-pulse">
                                                    Low Stock
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-black text-primary uppercase italic tracking-tight leading-tight group-hover:text-accent transition-colors">{product.name}</h3>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase">
                                            <span className="flex items-center gap-1"><Hash size={12} strokeWidth={1.5} /> {product.sku}</span>
                                            {product.brand && <span className="flex items-center gap-1"><Tag size={12} strokeWidth={1.5} /> {product.brand}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="p-3 bg-secondary/50 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all duration-300"
                                        >
                                            <Edit3 size={18} strokeWidth={1.5} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id, product.name)}
                                            className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-300"
                                        >
                                            <Trash2 size={18} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-2 gap-3 mb-6">
                                    <div className="p-4 bg-secondary/10 rounded-3xl border border-primary/5">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Price</p>
                                        <p className="text-xl font-black text-primary italic">${Number(product.price).toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 bg-primary/5 rounded-3xl border border-primary/10 transition-colors group-hover:bg-primary group-hover:text-white">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60 group-hover:text-white/60">Stock</p>
                                        <p className="text-xl font-black italic">{product.stock} <span className="text-[10px] uppercase group-hover:text-white/80">Units</span></p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-primary/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-secondary/30 rounded-xl flex items-center justify-center text-primary/40">
                                            <TrendingUp size={16} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-muted-foreground uppercase leading-none mb-1">Status</p>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-wider">Active Product</p>
                                        </div>
                                    </div>
                                    {product.taxable && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 rounded-xl text-accent">
                                            <Receipt size={12} strokeWidth={1.5} />
                                            <span className="text-[9px] font-black uppercase">Taxable</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* MODAL - High Fidelity Overlay */}
            {showModal && (
                <div className="fixed inset-0 bg-primary/20 backdrop-blur-xl flex items-center justify-center z-[100] p-4 lg:p-10 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-primary/10 overflow-hidden relative flex flex-col h-fit max-h-[90vh] animate-in zoom-in-95 duration-500">
                        {/* Modal Header */}
                        <div className="p-8 lg:p-10 border-b border-primary/5 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-primary text-white rounded-3xl flex items-center justify-center shadow-xl shadow-primary/30">
                                    {isEditing ? <Edit3 size={24} strokeWidth={1.5} /> : <Plus size={24} strokeWidth={1.5} />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-primary uppercase italic tracking-tight">
                                        {isEditing ? "Modify Catalog Entry" : "Register Spare Part"}
                                    </h3>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                        {isEditing ? `System UID: ${formData.id.split('-')[0]}...` : "System-wide inventory integration"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-3 bg-secondary/50 text-primary rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                            >
                                <X size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Product Name</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-6 py-4 rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary"
                                        placeholder="e.g. Master Brake Pad HD"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Brand / Manufacturer</label>
                                    <div className="relative">
                                        <Tag size={16} strokeWidth={1.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                                        <input
                                            required
                                            value={formData.brand}
                                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                            className="w-full pl-12 pr-6 py-4 rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary"
                                            placeholder="Brand Name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Workshop Category</label>
                                    <div className="relative">
                                        <Layers size={16} strokeWidth={1.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                                        <select
                                            value={formData.category_id}
                                            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                            className="w-full pl-12 pr-10 py-4 rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary appearance-none cursor-pointer"
                                        >
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Internal SKU Code</label>
                                    <div className="relative">
                                        <Hash size={16} strokeWidth={1.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                                        <input
                                            disabled={!isEditing}
                                            value={isEditing ? formData.sku : "AUTO-GENERATING..."}
                                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                            className="w-full pl-12 pr-6 py-4 rounded-3xl bg-secondary/40 border-none focus:ring-2 focus:ring-primary/20 transition-all font-black italic text-primary/60 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Manuf. Reference</label>
                                    <div className="relative">
                                        <FileText size={16} strokeWidth={1.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                                        <input
                                            value={formData.reference}
                                            onChange={e => setFormData({ ...formData, reference: e.target.value })}
                                            className="w-full pl-12 pr-6 py-4 rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary"
                                            placeholder="REF-00X"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-2 gap-4 p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] ml-2">Purchase Cost</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-primary/40">$</span>
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                value={formData.cost}
                                                onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                                className="w-full pl-10 pr-6 py-4 rounded-3xl bg-white border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic underline decoration-accent underline-offset-8">Public Retail Price</label>
                                        <div className="relative">
                                            <DollarSign size={18} strokeWidth={1.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-accent" />
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full pl-12 pr-6 py-4 rounded-3xl bg-white shadow-xl shadow-primary/5 border-none focus:ring-2 focus:ring-accent transition-all font-black text-2xl text-accent italic"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                                    <div className="space-y-2 p-6 bg-secondary/20 rounded-[2rem]">
                                        <label className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] block text-center mb-2">Available Stock</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full py-4 bg-white rounded-2xl border-none text-center text-2xl font-black text-primary italic shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2 p-6 bg-secondary/10 rounded-[2rem]">
                                        <label className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] block text-center mb-2">Minimum stock</label>
                                        <input
                                            type="number"
                                            value={formData.min_stock}
                                            onChange={e => setFormData({ ...formData, min_stock: e.target.value })}
                                            className="w-full py-4 bg-white/50 rounded-2xl border-none text-center text-xl font-bold text-primary/60 shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2 p-6 bg-secondary/10 rounded-[2rem]">
                                        <label className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] block text-center mb-2">Maximum stock</label>
                                        <input
                                            type="number"
                                            value={formData.max_stock}
                                            onChange={e => setFormData({ ...formData, max_stock: e.target.value })}
                                            className="w-full py-4 bg-white/50 rounded-2xl border-none text-center text-xl font-bold text-primary/60 shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div
                                    onClick={() => setFormData({ ...formData, taxable: !formData.taxable })}
                                    className={cn(
                                        "md:col-span-2 p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between group",
                                        formData.taxable ? "bg-accent/5 border-accent/20" : "bg-red-50/50 border-red-100"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                            formData.taxable ? "bg-accent text-white" : "bg-red-100 text-red-500"
                                        )}>
                                            <Receipt size={24} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className={cn(
                                                "text-sm font-black uppercase tracking-widest",
                                                formData.taxable ? "text-accent" : "text-red-500"
                                            )}>{formData.taxable ? "Taxable Product" : "Tax Exempt"}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Apply government sales tax on checkout</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "w-14 h-8 rounded-full relative transition-all shadow-inner border",
                                        formData.taxable ? "bg-accent border-accent/20" : "bg-red-100 border-red-200"
                                    )}>
                                        <div className={cn(
                                            "absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md shadow-black/10",
                                            formData.taxable ? "left-7" : "left-1"
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="p-8 lg:p-10 border-t border-primary/5 bg-secondary/10 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-5 rounded-[1.5rem] border border-primary/10 font-black text-xs uppercase tracking-widest text-primary/40 hover:bg-white transition-all active:scale-95"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-[2] py-5 bg-primary text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} strokeWidth={1.5} />}
                                {isEditing ? "Update Workshop Catalog" : "Commit to Inventory"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

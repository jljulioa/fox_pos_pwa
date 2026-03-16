"use client";

import { useState, useEffect } from "react";
import {
    Package,
    Search,
    AlertCircle,
    Plus
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

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] lg:-m-4 gap-0 overflow-hidden bg-[#F8F9FA]">
            {/* Header Section */}
            <header className="p-4 md:p-6 lg:p-10 pb-4 md:pb-6 space-y-4 md:space-y-8 shrink-0">
                <div className="flex flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex w-12 h-12 bg-primary rounded-2xl items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                            <Package size={24} strokeWidth={1.5} />
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">Inventory</h1>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="bg-primary text-white p-4 md:px-8 md:py-4 rounded-full md:rounded-[1.5rem] font-black flex items-center justify-center gap-0 md:gap-3 shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest fixed bottom-6 right-6 md:static z-50 md:z-auto aspect-square md:aspect-auto"
                    >
                        <Plus className="w-6 h-6 md:w-[18px] md:h-[18px]" strokeWidth={2.5} />
                        <span className="hidden md:inline">Add New Part</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-center">
                    <div className="lg:col-span-6 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={20} strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Filter by name, SKU or brand..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3 md:pl-14 md:py-4 rounded-full md:rounded-3xl bg-white shadow-sm border-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold italic text-primary text-sm md:text-base cursor-text"
                        />
                    </div>
                </div>
            </header>

            {/* Main Catalog Space */}
            <main className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-10 pb-20 md:pb-10 custom-scrollbar">
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

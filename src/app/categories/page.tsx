"use client";

import { useState, useEffect } from "react";
import {
    Plus, Search, AlertCircle, LayoutGrid, Layers, PackageSearch, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { categoriesService } from "@/services/categoriesService";
import { CategoryDesktopView } from "./_components/CategoryDesktopView";
import { CategoryMobileView } from "./_components/CategoryMobileView";
import { CategoryModal } from "./_components/CategoryModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [taxes, setTaxes] = useState<any[]>([]);
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
        sku_slug: "",
        tax_id: "",
        description: ""
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        await Promise.all([fetchCategories(), fetchTaxes()]);
        setLoading(false);
    }

    async function fetchCategories() {
        setPageError(null);
        try {
            const { data, error } = await categoriesService.fetchCategories();
            if (error) throw error;
            setCategories(data || []);
        } catch (err: any) {
            console.error("Error fetching categories:", err);
            setPageError(err.message);
        }
    }

    async function fetchTaxes() {
        try {
            const { data, error } = await categoriesService.fetchTaxes();
            if (error) throw error;
            setTaxes(data || []);
        } catch (err) {
            console.error("Error fetching taxes:", err);
        }
    }

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({
            id: "",
            name: "",
            sku_slug: "",
            tax_id: taxes[0]?.id || "",
            description: ""
        });
        setShowModal(true);
    };

    const openEditModal = (category: any) => {
        setIsEditing(true);
        setFormData({
            id: category.id,
            name: category.name,
            sku_slug: category.sku_slug || "",
            tax_id: category.tax_id || "",
            description: category.description || ""
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload: any = {
                name: formData.name,
                sku_slug: formData.sku_slug.toUpperCase(),
                tax_id: formData.tax_id || null,
                description: formData.description,
                slug: formData.name.toLowerCase().replace(/ /g, '-')
            };

            if (isEditing) {
                const { error } = await categoriesService.updateCategory(formData.id, payload);
                if (error) throw error;
            } else {
                const { error } = await categoriesService.createCategory(payload);
                if (error) throw error;
            }

            setShowModal(false);
            fetchCategories();
        } catch (err: any) {
            alert("Error saving category: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the "${name}" category? This may affect products linked to it.`)) return;

        try {
            const { error } = await categoriesService.deleteCategory(id);
            if (error) throw error;
            fetchCategories();
        } catch (err: any) {
            alert("Error deleting category: " + err.message);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.sku_slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="md:px-3 md:py-3 flex flex-col h-full gap-6 overflow-hidden md:bg-white rounded-[var(--sidebar-radius)] md:shadow-glass">
            {/* Header Section */}
            <header className="px-5 py-5 border-b border-primary/5 glass shrink-0 shadow-glass z-20 rounded-[var(--sidebar-radius)] mb-3">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 max-w-[1600px] mx-auto">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-[var(--ui-radius-lg)] shadow-inner">
                                <LayoutGrid size={18} strokeWidth={2.5} />
                            </div>
                            <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase italic leading-none">Hierarchy Control</h1>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic ml-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Active Taxonomy Protocol • {filteredCategories.length} Nodes Configured
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 w-full xl:w-auto">
                        <div className="relative flex-1 md:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={14} />
                            <Input
                                type="text"
                                placeholder="Filter Hierarchy..."
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
                            onClick={openAddModal}
                            className="h-10 px-6 bg-primary text-white rounded-[var(--ui-radius-md)] font-black flex items-center gap-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all text-[11px] uppercase tracking-widest italic"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            Commit Node
                        </Button>
                    </div>
                </div>
            </header>

            {/* Error Message */}
            {pageError && (
                <div className="mx-6 p-4 bg-red-50 text-red-600 rounded-[var(--ui-radius-lg)] border border-red-100 flex items-center gap-4 animate-in slide-in-from-top duration-300 shrink-0">
                    <AlertCircle size={18} />
                    <p className="text-[11px] font-bold uppercase tracking-widest leading-none">{pageError}</p>
                    <button onClick={fetchCategories} className="ml-auto px-4 py-1.5 bg-red-600 text-white rounded-[0.4rem] text-[9px] font-black uppercase tracking-widest">Retry Sync</button>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 pb-3 overflow-hidden p-0 max-w-[1600px] mx-auto w-full flex flex-col">
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {/* Desktop View */}
                    <div className="hidden lg:flex flex-col flex-1 min-h-0">
                        <CategoryDesktopView 
                            categories={filteredCategories}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                        />
                    </div>

                    {/* Mobile View */}
                    <div className="lg:hidden flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 flex flex-col">
                        <CategoryMobileView 
                            categories={filteredCategories}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>
            </main>

            <CategoryModal 
                showModal={showModal}
                setShowModal={setShowModal}
                isEditing={isEditing}
                formData={formData}
                setFormData={setFormData}
                taxes={taxes}
                handleSubmit={handleSubmit}
                submitting={submitting}
            />
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Edit3,
    X,
    Loader2,
    CheckCircle2,
    Tag,
    Layers,
    Type,
    Hash,
    Receipt,
    LayoutGrid,
    Search,
    AlertCircle,
    Info,
    ArrowRight,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { categoriesService } from "@/services/categoriesService";

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
        <div className="flex flex-col h-[calc(100vh-4rem)] lg:-m-4 gap-0 overflow-hidden bg-[#F8F9FA]">
            {/* Header Section */}
            <header className="p-6 lg:p-10 space-y-8 shrink-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <LayoutGrid size={24} strokeWidth={1.5} />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-primary">Categories</h1>
                        </div>
                        <p className="text-muted-foreground font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                            Global Inventory Classification System
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="bg-primary text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
                    >
                        <Plus size={18} strokeWidth={1.5} />
                        Define Category
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-6 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={20} strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Filter by classification or slug..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 rounded-3xl bg-white shadow-sm border-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold italic text-primary"
                        />
                    </div>
                </div>
            </header>

            {/* Main Content Space */}
            <main className="flex-1 overflow-y-auto px-6 lg:px-10 pb-10 custom-scrollbar">
                {pageError && (
                    <div className="mb-8 p-6 bg-red-50 text-red-600 rounded-[2.5rem] border border-red-100 flex items-center gap-5 shadow-sm">
                        <AlertCircle size={24} strokeWidth={1.5} />
                        <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-widest mb-1">Database Sync Alert</p>
                            <p className="text-xs font-bold opacity-80">{pageError}</p>
                        </div>
                        <button onClick={fetchCategories} className="px-5 py-2.5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Retry Sync</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-64 rounded-[2.5rem] bg-white animate-pulse shadow-sm" />)
                    ) : filteredCategories.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-30">
                            <div className="p-10 bg-primary/5 rounded-[3rem]">
                                <Layers size={80} strokeWidth={1} className="text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-primary uppercase tracking-widest">Hierarchy Empty</h3>
                                <p className="text-xs font-bold uppercase tracking-widest">No product classifications defined yet</p>
                            </div>
                        </div>
                    ) : (
                        filteredCategories.map((category) => (
                            <div
                                key={category.id}
                                className="group relative bg-white rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-primary/5 flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-primary/5 text-primary text-[9px] font-black rounded-full uppercase tracking-widest border border-primary/10">
                                                {category.sku_slug}
                                            </span>
                                            {category.taxes && (
                                                <span className="px-3 py-1 bg-accent/5 text-accent text-[9px] font-black rounded-full uppercase tracking-widest border border-accent/10">
                                                    {category.taxes.name} ({category.taxes.rate}%)
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-black text-primary uppercase italic tracking-tight leading-tight group-hover:text-accent transition-colors">{category.name}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(category)}
                                            className="p-3 bg-secondary/50 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all duration-300"
                                        >
                                            <Edit3 size={18} strokeWidth={1.5} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id, category.name)}
                                            className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-300"
                                        >
                                            <Trash2 size={18} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 mb-6">
                                    <p className="text-xs font-bold text-muted-foreground/60 leading-relaxed italic line-clamp-2">
                                        {category.description || "No classification description provided for this inventory group."}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-primary/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                                            <Receipt size={18} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1">Standard Tax</p>
                                            <p className="text-sm font-black text-primary italic">
                                                {category.taxes ? `${category.taxes.rate}%` : "0%"} <span className="text-[10px] opacity-40">Rate</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-secondary/30 rounded-full flex items-center justify-center text-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                                        <ArrowRight size={18} strokeWidth={1.5} />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* MODAL - High Fidelity Overlay */}
            {showModal && (
                <div className="fixed inset-0 bg-primary/20 backdrop-blur-xl flex items-center justify-center z-[100] p-4 lg:p-10 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl border border-primary/10 overflow-hidden relative flex flex-col h-fit max-h-[90vh] animate-in zoom-in-95 duration-500">
                        {/* Modal Header */}
                        <div className="p-8 lg:p-10 border-b border-primary/5 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-primary text-white rounded-3xl flex items-center justify-center shadow-xl shadow-primary/30">
                                    {isEditing ? <Edit3 size={24} strokeWidth={1.5} /> : <Plus size={24} strokeWidth={1.5} />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-primary uppercase italic tracking-tight">
                                        {isEditing ? "Modify Definition" : "New Classification"}
                                    </h3>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                        Global Inventory Taxonomy Entry
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
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Classification Name</label>
                                    <div className="relative">
                                        <Type size={16} strokeWidth={1.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-12 pr-6 py-4 rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary"
                                            placeholder="e.g. Engine Components"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">SKU Prefix / Slug</label>
                                        <div className="relative">
                                            <Hash size={16} strokeWidth={1.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                                            <input
                                                required
                                                maxLength={4}
                                                value={formData.sku_slug}
                                                onChange={e => setFormData({ ...formData, sku_slug: e.target.value.toUpperCase() })}
                                                className="w-full pl-12 pr-6 py-4 rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-black italic text-primary uppercase placeholder:normal-case"
                                                placeholder="e.g. MOT"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Attached Tax Rule</label>
                                        <div className="relative">
                                            <Receipt size={16} strokeWidth={1.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                                            <select
                                                value={formData.tax_id}
                                                onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
                                                className="w-full pl-12 pr-10 py-4 rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary appearance-none cursor-pointer"
                                            >
                                                {taxes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Integration Description</label>
                                    <div className="relative">
                                        <Info size={16} strokeWidth={1.5} className="absolute left-5 top-5 text-primary/40" />
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            rows={4}
                                            className="w-full pl-12 pr-6 py-4 rounded-[2rem] bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-primary resize-none"
                                            placeholder="Technical specification groups for this class..."
                                        />
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
                                {isEditing ? "Sync Definition" : "Commit to System"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit3,
    X,
    Loader2,
    CheckCircle2,
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    SearchCode,
    Users,
    ArrowRight,
    AlertCircle,
    Info,
    Package,
    TrendingUp,
    Hash,
    UserCheck,
    CreditCard,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { customerService } from "@/services/customerService";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
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
        email: "",
        phone: "",
        address: "",
        identification_number: "",
        credit_limit: "0"
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        setLoading(true);
        setPageError(null);
        try {
            const { data, error } = await customerService.fetchCustomers();

            if (error) throw error;
            setCustomers(data || []);
        } catch (err: any) {
            console.error("Error fetching customers:", err);
            setPageError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({
            id: "",
            name: "",
            email: "",
            phone: "",
            address: "",
            identification_number: "",
            credit_limit: "0"
        });
        setShowModal(true);
    };

    const openEditModal = (customer: any) => {
        setIsEditing(true);
        setFormData({
            id: customer.id,
            name: customer.name,
            email: customer.email || "",
            phone: customer.phone || "",
            address: customer.address || "",
            identification_number: customer.identification_number || "",
            credit_limit: (customer.credit_limit || 0).toString()
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload: any = {
                name: formData.name,
                email: formData.email || null,
                phone: formData.phone || null,
                address: formData.address || null,
                identification_number: formData.identification_number || null,
                credit_limit: parseFloat(formData.credit_limit)
            };

            if (isEditing) {
                const { error } = await customerService.updateCustomer(formData.id, payload);
                if (error) throw error;
            } else {
                const { error } = await customerService.createCustomer(payload);
                if (error) throw error;
            }

            setShowModal(false);
            fetchCustomers();
        } catch (err: any) {
            alert("Error saving customer: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

        try {
            const { error } = await customerService.deleteCustomer(id);
            if (error) throw error;
            fetchCustomers();
        } catch (err: any) {
            alert("Error deleting customer: " + err.message);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.identification_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] lg:-m-4 gap-0 overflow-hidden bg-[#F8F9FA]">
            {/* Header Section */}
            <header className="p-6 lg:p-10 space-y-8 shrink-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <Users size={24} strokeWidth={1.5} />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-primary">Customers</h1>
                        </div>
                        <p className="text-muted-foreground font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                            Client Registry & Engagement Portal
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="bg-primary text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
                    >
                        <Plus size={18} strokeWidth={1.5} />
                        Register Customer
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-6 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={20} strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Search by name, ID or contact detail..."
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
                            <p className="text-xs font-black uppercase tracking-widest mb-1">System Error</p>
                            <p className="text-xs font-bold opacity-80">{pageError}</p>
                        </div>
                        <button onClick={fetchCustomers} className="px-5 py-2.5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Retry Sync</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-72 rounded-[2.5rem] bg-white animate-pulse shadow-sm" />)
                    ) : filteredCustomers.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-30">
                            <div className="p-10 bg-primary/5 rounded-[3rem]">
                                <User size={80} strokeWidth={1} className="text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-primary uppercase tracking-widest">Base Empty</h3>
                                <p className="text-xs font-bold uppercase tracking-widest">No customers registered in the system</p>
                            </div>
                        </div>
                    ) : (
                        filteredCustomers.map((customer) => (
                            <div
                                key={customer.id}
                                className="group relative bg-white rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-primary/5 flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-secondary/50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                        <User size={24} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(customer)}
                                            className="p-3 bg-secondary/30 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                                        >
                                            <Edit3 size={16} strokeWidth={1.5} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(customer.id, customer.name)}
                                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <Trash2 size={16} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h3 className="text-xl font-black text-primary uppercase tracking-tight leading-tight group-hover:text-accent transition-colors truncate">
                                        {customer.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-primary/5 text-primary text-[9px] font-black rounded-full uppercase tracking-widest border border-primary/10">
                                            ID: {customer.identification_number || "NO ID"}
                                        </span>
                                        {customer.total_spent > 0 && (
                                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-full uppercase tracking-widest border border-green-100">
                                                VIP
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 group/item">
                                        <div className="p-2 bg-primary/5 rounded-lg text-primary/40 group-hover/item:text-primary transition-colors">
                                            <Phone size={14} strokeWidth={1.5} />
                                        </div>
                                        <p className="text-[11px] font-black text-primary/60">{customer.phone || "No Contact"}</p>
                                    </div>
                                    <div className="flex items-center gap-3 group/item">
                                        <div className="p-2 bg-primary/5 rounded-lg text-primary/40 group-hover/item:text-primary transition-colors">
                                            <Mail size={14} strokeWidth={1.5} />
                                        </div>
                                        <p className="text-[11px] font-black text-primary/60 truncate">{customer.email || "No Email"}</p>
                                    </div>
                                    <div className="flex items-center gap-3 group/item">
                                        <div className="p-2 bg-primary/5 rounded-lg text-primary/40 group-hover/item:text-primary transition-colors">
                                            <CreditCard size={14} strokeWidth={1.5} />
                                        </div>
                                        <p className="text-[11px] font-black text-primary/60 italic">Limit: ${Number(customer.credit_limit || 0).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="mt-auto grid grid-cols-2 gap-3 pt-6 border-t border-primary/5">
                                    <div className="px-4 py-3 bg-primary/5 rounded-2xl border border-primary/10">
                                        <p className="text-[9px] font-black text-primary uppercase opacity-60 leading-none mb-1">Orders</p>
                                        <div className="flex items-center gap-2">
                                            <Package size={12} className="text-primary/40" />
                                            <p className="text-lg font-black italic text-primary">{customer.purchase_history_count || 0}</p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-3 bg-green-50 rounded-2xl border border-green-100">
                                        <p className="text-[9px] font-black text-green-600 uppercase opacity-60 leading-none mb-1">Spent</p>
                                        <p className="text-lg font-black italic text-green-700">${Number(customer.total_spent || 0).toLocaleString()}</p>
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
                                        {isEditing ? "Modify Profile" : "Register Prospect"}
                                    </h3>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                        Client Engagement System Entry
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
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Full Legal Name</label>
                                    <div className="relative">
                                        <UserCheck size={16} strokeWidth={1.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-12 pr-6 py-4 rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary"
                                            placeholder="e.g. Johnathan Sterling"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Tax ID / Identification</label>
                                        <div className="relative">
                                            <Hash size={16} strokeWidth={1.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                                            <input
                                                value={formData.identification_number}
                                                onChange={e => setFormData({ ...formData, identification_number: e.target.value })}
                                                className="w-full pl-12 pr-6 py-4 rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-black italic text-primary"
                                                placeholder="e.g. 12345678-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Primary Phone</label>
                                        <div className="relative">
                                            <Phone size={16} strokeWidth={1.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                                            <input
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-12 pr-6 py-4 rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-black text-primary italic"
                                                placeholder="+56 9 ..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Email Address</label>
                                    <div className="relative">
                                        <Mail size={16} strokeWidth={1.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-12 pr-6 py-4 rounded-3xl bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Registered Address</label>
                                    <div className="relative">
                                        <MapPin size={16} strokeWidth={1.5} className="absolute left-5 top-5 text-primary/40" />
                                        <textarea
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            rows={2}
                                            className="w-full pl-12 pr-6 py-4 rounded-[2rem] bg-secondary/20 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-primary resize-none"
                                            placeholder="Street, City, Building..."
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-[1.2rem] flex items-center justify-center text-primary shadow-sm">
                                            <CreditCard size={20} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Financial Credit Limit</p>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">System Trust Level</p>
                                        </div>
                                    </div>
                                    <div className="relative w-32">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary/30">$</span>
                                        <input
                                            type="number"
                                            value={formData.credit_limit}
                                            onChange={e => setFormData({ ...formData, credit_limit: e.target.value })}
                                            className="w-full pl-8 pr-4 py-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-primary/20 transition-all text-center text-lg font-black text-primary italic"
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
                                {isEditing ? "Sync Profile" : "Commit to Registry"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

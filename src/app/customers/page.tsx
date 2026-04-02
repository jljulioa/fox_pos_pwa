"use client";

import { useState, useEffect } from "react";
import {
    Plus, Search, Edit3, X, Loader2, CheckCircle2,
    User, Mail, Phone, MapPin, Users, AlertCircle,
    Hash, UserCheck, CreditCard, Trash2, Package,
    SlidersHorizontal, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { customerService } from "@/services/customerService";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
            setPageError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ id: "", name: "", email: "", phone: "", address: "", identification_number: "", credit_limit: "0" });
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

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
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
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
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
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="md:px-3 md:py-3 flex flex-col h-full gap-5 overflow-hidden md:bg-white rounded-[var(--sidebar-radius)] md:shadow-glass">

            {/* ── Header ── */}
            <header className="px-5 py-5 border-b border-primary/5 glass shrink-0 shadow-glass z-20 rounded-[var(--sidebar-radius)] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5">
                <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-[var(--ui-radius-lg)] shadow-inner">
                            <Users size={18} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase italic leading-none">
                            Client Registry
                        </h1>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic ml-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Active Engagement Protocol • {filteredCustomers.length} Accounts
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full xl:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={14} />
                        <Input
                            type="text"
                            placeholder="Search by name, ID or contact..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
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
                        Add Client
                    </Button>
                </div>
            </header>

            {/* ── Error ── */}
            {pageError && (
                <div className="mx-4 p-4 bg-rose-50 text-rose-600 rounded-[var(--ui-radius-lg)] border border-rose-100 flex items-center gap-4 shrink-0">
                    <AlertCircle size={18} />
                    <p className="text-[11px] font-bold uppercase tracking-widest flex-1">{pageError}</p>
                    <button onClick={fetchCustomers} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-rose-600 text-white rounded-md">
                        Retry
                    </button>
                </div>
            )}

            {/* ── Main Content ── */}
            <main className="flex-1 overflow-hidden flex flex-col min-h-0 pb-3">

                {/* Desktop Table */}
                <div className="hidden lg:flex flex-col flex-1 min-h-0">
                    <div className="flex-1 min-h-0 bg-white rounded-[var(--ui-radius-lg)] border border-slate-200 flex flex-col overflow-hidden shadow-sm mx-4">
                        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                            <Table>
                                <TableHeader className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                                    <TableRow className="hover:bg-transparent border-slate-200">
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 w-[280px]">Client & Identity</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11">Contact</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11">Address</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 text-right">Credit Limit</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 text-right">Orders</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 text-right">Total Spent</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-11 text-right px-6">Ops</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 6 }).map((_, i) => (
                                            <TableRow key={i} className="border-slate-100">
                                                {Array.from({ length: 7 }).map((__, j) => (
                                                    <TableCell key={j} className="px-4 py-3">
                                                        <div className="h-4 bg-slate-100 animate-pulse rounded-md" />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : filteredCustomers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-20 text-center">
                                                <div className="flex flex-col items-center opacity-30">
                                                    <User size={48} strokeWidth={1} className="text-slate-400 mb-3" />
                                                    <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-600 italic">No Clients Found</h3>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCustomers.map(customer => (
                                            <TableRow key={customer.id} className="group border-slate-100 hover:bg-slate-50/80 transition-colors">
                                                {/* Client Identity */}
                                                <TableCell className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-[var(--ui-radius-md)] bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner shrink-0">
                                                            <User size={16} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-[13px] font-black text-slate-900 uppercase italic tracking-tight truncate group-hover:text-primary transition-colors">
                                                                {customer.name}
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ID:</span>
                                                                <span className="text-[8px] font-black text-slate-500 tracking-wider">{customer.identification_number || "—"}</span>
                                                                {Number(customer.total_spent) > 0 && (
                                                                    <span className="ml-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[7px] font-black rounded-full border border-emerald-100 uppercase tracking-widest">VIP</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Contact */}
                                                <TableCell className="px-4 py-3">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone size={10} className="text-slate-300 shrink-0" />
                                                            <span className="text-[11px] font-bold text-slate-600 italic">{customer.phone || "—"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Mail size={10} className="text-slate-300 shrink-0" />
                                                            <span className="text-[10px] font-bold text-slate-500 truncate max-w-[160px]">{customer.email || "—"}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Address */}
                                                <TableCell className="px-4 py-3 max-w-[200px]">
                                                    <span className="text-[10px] font-bold text-slate-400 italic line-clamp-2">{customer.address || "—"}</span>
                                                </TableCell>

                                                {/* Credit Limit */}
                                                <TableCell className="px-4 py-3 text-right">
                                                    <span className="text-[12px] font-black italic text-slate-700">
                                                        ${Number(customer.credit_limit || 0).toLocaleString()}
                                                    </span>
                                                </TableCell>

                                                {/* Orders */}
                                                <TableCell className="px-4 py-3 text-right">
                                                    <span className="text-[12px] font-black italic text-slate-600">
                                                        {customer.purchase_history_count || 0}
                                                    </span>
                                                </TableCell>

                                                {/* Total Spent */}
                                                <TableCell className="px-4 py-3 text-right">
                                                    <span className="text-[12px] font-black italic text-emerald-600">
                                                        ${Number(customer.total_spent || 0).toLocaleString()}
                                                    </span>
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 px-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openEditModal(customer)}
                                                            className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                                                            <Edit3 size={13} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id, customer.name)}
                                                            className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                                                            <Trash2 size={13} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0 h-10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                Total Accounts: <span className="text-primary font-black">{filteredCustomers.length}</span> Clients Registered
                            </span>
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] italic">Client Engagement V2.0</span>
                        </div>
                    </div>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden flex-1 overflow-y-auto custom-scrollbar px-4 flex flex-col gap-3 min-h-0">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-36 rounded-[var(--ui-radius-xl)] bg-slate-100/60 animate-pulse border border-slate-200/50" />
                        ))
                    ) : filteredCustomers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 py-20">
                            <User size={56} strokeWidth={1} className="text-slate-400 mb-3" />
                            <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-600 italic">No Clients Found</h3>
                        </div>
                    ) : (
                        filteredCustomers.map(customer => (
                            <div key={customer.id} className="group bg-white rounded-[var(--ui-radius-xl)] p-5 border border-slate-200 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-[var(--ui-radius-md)] bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-black text-slate-800 uppercase italic tracking-tight">{customer.name}</h3>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {customer.identification_number || "—"}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEditModal(customer)} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg hover:bg-blue-50 hover:border-blue-100 text-slate-400 hover:text-blue-600 transition-all">
                                            <Edit3 size={13} />
                                        </button>
                                        <button onClick={() => handleDelete(customer.id, customer.name)} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg hover:bg-rose-50 hover:border-rose-100 text-slate-400 hover:text-rose-500 transition-all">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-50/70 rounded-[var(--ui-radius-md)] border border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                        <Phone size={10} className="text-slate-300" />
                                        <span className="text-[10px] font-bold text-slate-600">{customer.phone || "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CreditCard size={10} className="text-slate-300" />
                                        <span className="text-[10px] font-bold text-slate-600">${Number(customer.credit_limit || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                    <div>
                                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Orders</div>
                                        <div className="text-[13px] font-black italic text-slate-700">{customer.purchase_history_count || 0}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">Total Spent</div>
                                        <div className="text-[13px] font-black italic text-emerald-600">${Number(customer.total_spent || 0).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* ── Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[110] p-0 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-t-[var(--ui-radius-xl)] sm:rounded-[var(--ui-radius-xl)] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">

                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2.5 rounded-[var(--ui-radius-md)] shadow-inner",
                                    isEditing ? "bg-blue-50 text-blue-600" : "bg-primary/10 text-primary"
                                )}>
                                    {isEditing ? <Edit3 size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-black text-slate-900 uppercase italic tracking-tight leading-none">
                                        {isEditing ? "Modify Profile" : "Register Client"}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        {isEditing ? `UID: ${formData.id?.split("-")[0]}...` : "Client Engagement Entry"}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}
                                className="h-8 w-8 rounded-[var(--ui-radius-sm)] text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                                <X size={18} />
                            </Button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[65vh] custom-scrollbar">
                            <div className="p-6 space-y-5">
                                {/* Full Name */}
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Full Legal Name *</Label>
                                    <div className="relative">
                                        <UserCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Johnathan Sterling"
                                            className="h-10 pl-9 bg-slate-50 border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-bold text-slate-700 focus:ring-primary/10 italic" />
                                    </div>
                                </div>

                                {/* ID + Phone */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Tax ID / RUT</Label>
                                        <div className="relative">
                                            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <Input value={formData.identification_number} onChange={e => setFormData({ ...formData, identification_number: e.target.value })}
                                                placeholder="12345678-9"
                                                className="h-10 pl-9 bg-slate-50 border-slate-200 rounded-[var(--ui-radius-md)] text-[12px] font-black italic text-slate-700 tracking-widest focus:ring-primary/10" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Phone</Label>
                                        <div className="relative">
                                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+56 9 ..."
                                                className="h-10 pl-9 bg-slate-50 border-slate-200 rounded-[var(--ui-radius-md)] text-[12px] font-bold italic text-slate-700 focus:ring-primary/10" />
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Email Address</Label>
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                            className="h-10 pl-9 bg-slate-50 border-slate-200 rounded-[var(--ui-radius-md)] text-[12px] font-bold text-slate-700 focus:ring-primary/10" />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Registered Address</Label>
                                    <div className="relative">
                                        <MapPin size={14} className="absolute left-3 top-3 text-slate-300" />
                                        <textarea
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            rows={2}
                                            placeholder="Street, City, Building..."
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[var(--ui-radius-md)] text-[12px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Credit Limit */}
                                <div className="p-4 bg-slate-50 rounded-[var(--ui-radius-lg)] border border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-[var(--ui-radius-md)] text-primary shadow-sm border border-slate-100">
                                            <CreditCard size={16} strokeWidth={2} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none italic">Financial Credit Limit</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">System Trust Level</p>
                                        </div>
                                    </div>
                                    <div className="relative w-28">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">$</span>
                                        <Input
                                            type="number"
                                            value={formData.credit_limit}
                                            onChange={e => setFormData({ ...formData, credit_limit: e.target.value })}
                                            className="h-9 pl-6 pr-2 text-right bg-white border-slate-200 rounded-[var(--ui-radius-md)] text-[14px] font-black text-slate-800 italic focus:ring-primary/10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                            <Button type="button" variant="ghost" onClick={() => setShowModal(false)} disabled={submitting}
                                className="flex-1 h-11 rounded-[var(--ui-radius-md)] text-slate-400 text-[11px] font-black uppercase tracking-widest italic hover:bg-slate-100 transition-all">
                                Discard
                            </Button>
                            <Button onClick={() => handleSubmit()} disabled={submitting}
                                className={cn(
                                    "flex-[2] h-11 text-white text-[11px] font-black uppercase tracking-widest rounded-[var(--ui-radius-md)] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 italic",
                                    isEditing ? "bg-blue-600 shadow-blue-500/20 hover:shadow-blue-500/30" : "bg-primary shadow-primary/20 hover:shadow-primary/30"
                                )}>
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={15} strokeWidth={2.5} />}
                                {isEditing ? "Sync Profile" : "Commit to Registry"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

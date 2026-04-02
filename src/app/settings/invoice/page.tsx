"use client";

import { useState, useEffect } from "react";
import { settingsService } from "@/services/settingsService";
import { Building2, MapPin, FileText, FileSignature, Loader2, Save, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface InvoiceSettings {
    company_name: string;
    nit: string;
    address: string;
    footer_message: string;
}

const fieldConfig = [
    { key: "company_name", label: "Company / Store Name", icon: <Building2 size={14} />, placeholder: "e.g. Fox Moto Parts", type: "input", required: true },
    { key: "nit", label: "NIT / Tax ID", icon: <FileSignature size={14} />, placeholder: "e.g. 123456789-0", type: "input", required: true },
    { key: "address", label: "Store Address", icon: <MapPin size={14} />, placeholder: "e.g. 123 Main St, City, State, ZIP", type: "textarea", rows: 2, required: true },
    { key: "footer_message", label: "Footer Message (Receipts)", icon: <FileText size={14} />, placeholder: "e.g. Thank you! No returns after 30 days.", type: "textarea", rows: 3, required: false },
];

export default function InvoiceSettingsPage() {
    const [settings, setSettings] = useState<InvoiceSettings>({
        company_name: "",
        nit: "",
        address: "",
        footer_message: "",
    });
    const [originalName, setOriginalName] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await settingsService.fetchInvoiceSettings();
            if (error) throw error;
            if (data && data.length > 0) {
                setSettings({
                    company_name: data[0].company_name || "",
                    nit: data[0].nit || "",
                    address: data[0].address || "",
                    footer_message: data[0].footer_message || "",
                });
                setOriginalName(data[0].company_name);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            setSuccess(false);
            const { error } = await settingsService.saveInvoiceSettings(settings, originalName);
            if (error) throw error;
            setOriginalName(settings.company_name);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3 opacity-40">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Config...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="md:px-3 md:py-3 flex flex-col h-full gap-4 overflow-hidden md:bg-white rounded-[var(--sidebar-radius)] md:shadow-glass">

            {/* ── Header ── */}
            <header className="px-5 py-5 border-b border-primary/5 glass shrink-0 shadow-glass z-20 rounded-[var(--sidebar-radius)] flex items-center gap-4">
                <Link href="/settings">
                    <button className="w-9 h-9 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-[var(--ui-radius-md)] text-slate-400 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all shadow-sm">
                        <ArrowLeft size={16} strokeWidth={2.5} />
                    </button>
                </Link>
                <div className="flex items-center gap-3 flex-1">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-[var(--ui-radius-lg)] shadow-inner">
                        <FileText size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase italic leading-none">
                            Invoice Settings
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic mt-1">
                            Receipt &amp; Invoice Configuration
                        </p>
                    </div>
                </div>
            </header>

            {/* ── Form ── */}
            <main className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6">
                <form onSubmit={handleSave} className="max-w-3xl space-y-6 pt-2">

                    {/* Fields card */}
                    <div className="glass rounded-[var(--ui-radius-xl)] border border-primary/5 shadow-glass overflow-hidden">

                        {/* Card header */}
                        <div className="px-6 py-4 border-b border-primary/5 bg-primary/[0.02]">
                            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                                <div className="w-1 h-4 bg-primary rounded-full" />
                                Business Identity — appears on all printed receipts
                            </h2>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Top 2-col grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {fieldConfig.slice(0, 2).map((f) => (
                                    <div key={f.key} className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-1.5">
                                            <span className="text-primary/60">{f.icon}</span>
                                            {f.label}
                                            {f.required && <span className="text-primary">*</span>}
                                        </Label>
                                        <Input
                                            type="text"
                                            name={f.key}
                                            value={(settings as any)[f.key]}
                                            onChange={handleChange}
                                            placeholder={f.placeholder}
                                            required={f.required}
                                            className="h-10 bg-slate-50 border-slate-200 rounded-[var(--ui-radius-md)] text-[13px] font-semibold text-slate-700 focus:bg-white transition-all"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Textareas */}
                            {fieldConfig.slice(2).map((f) => (
                                <div key={f.key} className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-1.5">
                                        <span className="text-primary/60">{f.icon}</span>
                                        {f.label}
                                        {f.required && <span className="text-primary">*</span>}
                                    </Label>
                                    <textarea
                                        name={f.key}
                                        value={(settings as any)[f.key]}
                                        onChange={handleChange}
                                        placeholder={f.placeholder}
                                        rows={f.rows}
                                        required={f.required}
                                        className="w-full p-3 rounded-[var(--ui-radius-md)] border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[13px] font-semibold text-slate-700 outline-none resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Save footer */}
                    <div className="flex items-center justify-between py-4 px-1">
                        {success ? (
                            <span className="flex items-center gap-2 text-emerald-600 text-[11px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-1">
                                <CheckCircle2 size={16} />
                                Settings saved successfully
                            </span>
                        ) : (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                                * Required fields
                            </p>
                        )}
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="h-10 px-6 rounded-[var(--ui-radius-md)] bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-95 transition-all italic flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} strokeWidth={2.5} />}
                            {isSaving ? "Saving..." : "Save Settings"}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}

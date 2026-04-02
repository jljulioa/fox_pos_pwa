"use client";

import React, { useState } from "react";
import {
    UploadCloud, FileText, CheckCircle2, AlertCircle, X,
    Loader2, ArrowLeft, Settings2, TableProperties
} from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { importService, ColumnMapping } from "@/services/importService";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mappingFields = [
    { label: "SKU / Code", key: "sku" as keyof ColumnMapping, required: true },
    { label: "Product Name", key: "name" as keyof ColumnMapping, required: true },
    { label: "Sale Price", key: "price" as keyof ColumnMapping, required: true },
    { label: "Cost Price", key: "cost" as keyof ColumnMapping, required: false },
    { label: "Current Stock", key: "stock" as keyof ColumnMapping, required: false },
    { label: "Min. Stock", key: "min_stock" as keyof ColumnMapping, required: false },
    { label: "Category ID", key: "category_id" as keyof ColumnMapping, required: false },
    { label: "Category Name", key: "category_name" as keyof ColumnMapping, required: false },
    { label: "Brand", key: "brand" as keyof ColumnMapping, required: false },
];

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [preview, setPreview] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mapping, setMapping] = useState<ColumnMapping>({
        sku: "", name: "", cost: "", price: "",
        stock: "", min_stock: "", category_id: "", category_name: "", brand: ""
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setError(null);
            setSuccess(false);

            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                preview: 5,
                complete: (results) => {
                    if (results.meta.fields) {
                        setHeaders(results.meta.fields);
                        setPreview(results.data);
                        const findMatch = (terms: string[]) =>
                            results.meta.fields?.find(f => terms.some(t => f.toLowerCase().includes(t))) || "";
                        setMapping({
                            sku: findMatch(["sku", "codigo", "code"]),
                            name: findMatch(["name", "descripcion", "nombre", "description"]),
                            cost: findMatch(["cost", "costo"]),
                            price: findMatch(["price", "venta", "precio"]),
                            stock: findMatch(["stock", "inventario", "cantidad"]),
                            min_stock: findMatch(["min", "minimo"]),
                            category_id: findMatch(["category_id", "id_categoria"]),
                            category_name: findMatch(["category", "categoria", "departamento", "depto"]),
                            brand: findMatch(["brand", "marca"])
                        });
                    }
                },
                error: (err: any) => setError(`Error parsing CSV headers: ${err.message}`)
            });
        }
    };

    const handleImport = async () => {
        if (!file) return;
        if (!mapping.sku || !mapping.name || !mapping.price) {
            setError("Please map at least SKU, Name, and Price columns.");
            return;
        }
        setLoading(true);
        setError(null);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    await importService.processImport(results.data, mapping);
                    setSuccess(true);
                    setFile(null);
                    setHeaders([]);
                    setPreview([]);
                } catch (err: any) {
                    setError(err.message || "An error occurred during import.");
                } finally {
                    setLoading(false);
                }
            },
            error: (err: any) => {
                setError(`Error parsing CSV: ${err.message}`);
                setLoading(false);
            }
        });
    };

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
                        <UploadCloud size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase italic leading-none">
                            Data Import
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic mt-1">
                            CSV Inventory Import Protocol
                        </p>
                    </div>
                </div>
            </header>

            {/* ── Body ── */}
            <main className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6 space-y-4 pt-2">

                {/* ── Success Banner ── */}
                {success && (
                    <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-[var(--ui-radius-xl)] text-emerald-700 animate-in slide-in-from-top-2">
                        <CheckCircle2 size={22} strokeWidth={2} className="shrink-0" />
                        <div>
                            <p className="text-[12px] font-black uppercase tracking-widest">Import Successful</p>
                            <p className="text-[11px] font-semibold opacity-80 mt-0.5">Your inventory data has been loaded into the system.</p>
                        </div>
                    </div>
                )}

                {/* ── Error Banner ── */}
                {error && (
                    <div className="flex items-center gap-4 p-4 bg-rose-50 border border-rose-200 rounded-[var(--ui-radius-xl)] text-rose-600 animate-in slide-in-from-top-2">
                        <AlertCircle size={22} strokeWidth={2} className="shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-black uppercase tracking-widest">Import Failed</p>
                            <p className="text-[11px] font-semibold opacity-80 mt-0.5 truncate">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="shrink-0 text-rose-400 hover:text-rose-600">
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* ── Drop Zone ── */}
                {!success && !file && (
                    <label className="block cursor-pointer group">
                        <div className="glass rounded-[var(--ui-radius-xl)] border-2 border-dashed border-primary/20 hover:border-primary/40 p-10 flex flex-col items-center justify-center text-center transition-all hover:bg-primary/[0.02] shadow-glass">
                            <div className="w-14 h-14 bg-primary/10 rounded-[var(--ui-radius-xl)] flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-4 shadow-inner">
                                <FileText size={26} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-[14px] font-black text-slate-800 uppercase italic tracking-tight mb-1">Select CSV File</h3>
                            <p className="text-[11px] text-slate-400 font-semibold max-w-xs">
                                Upload any CSV product list. You will map the columns in the next step.
                            </p>
                            <span className="mt-4 px-4 py-2 bg-primary/10 text-primary text-[10px] font-black rounded-[var(--ui-radius-md)] uppercase tracking-widest italic">
                                Browse Files
                            </span>
                        </div>
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                    </label>
                )}

                {/* ── Column Mapping + Preview ── */}
                {file && headers.length > 0 && !success && (
                    <div className="space-y-4">

                        {/* Card: mapping */}
                        <div className="glass rounded-[var(--ui-radius-xl)] border border-primary/5 shadow-glass overflow-hidden">
                            <div className="px-5 py-4 border-b border-primary/5 bg-primary/[0.02] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-[var(--ui-radius-md)] text-primary">
                                        <Settings2 size={15} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h2 className="text-[12px] font-black text-slate-800 uppercase italic tracking-tight leading-none">Column Mapping</h2>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Map CSV headers → Supabase Products</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setFile(null); setHeaders([]); setError(null); }}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100"
                                >
                                    <X size={13} />
                                </button>
                            </div>

                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {mappingFields.map((field) => (
                                    <div key={field.key} className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-0.5 flex items-center gap-1">
                                            {field.label}
                                            {field.required && <span className="text-primary">*</span>}
                                        </label>
                                        <select
                                            className={cn(
                                                "w-full h-9 bg-slate-50 rounded-[var(--ui-radius-md)] border px-3 text-[12px] font-semibold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer transition-all",
                                                mapping[field.key] ? "border-primary/30 bg-primary/[0.02] text-primary" : "border-slate-200"
                                            )}
                                            value={mapping[field.key] || ""}
                                            onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                                        >
                                            <option value="">— Select column —</option>
                                            {headers.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Card: preview */}
                        <div className="glass rounded-[var(--ui-radius-xl)] border border-primary/5 shadow-glass overflow-hidden">
                            <div className="px-5 py-4 border-b border-primary/5 bg-primary/[0.02] flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-[var(--ui-radius-md)] text-primary">
                                    <TableProperties size={15} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-[12px] font-black text-slate-800 uppercase italic tracking-tight leading-none">Data Preview</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">First 5 rows of {file.name}</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="border-b border-primary/5 bg-primary/[0.02]">
                                        <tr>
                                            {headers.map(h => (
                                                <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary/5">
                                        {preview.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-primary/[0.02] transition-colors">
                                                {headers.map(h => (
                                                    <td key={h} className="px-4 py-2.5 text-[12px] font-semibold text-slate-600 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                                                        {row[h]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Import action */}
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={handleImport}
                                disabled={loading}
                                className="w-full h-12 rounded-[var(--ui-radius-xl)] bg-primary text-white text-[12px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 italic"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} strokeWidth={2.5} />}
                                {loading ? "Processing Import..." : "Execute Import"}
                            </Button>
                            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                                Ready to process {file.name}
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

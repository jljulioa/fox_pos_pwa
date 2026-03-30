"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2, ArrowLeft, Settings2 } from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { importService, ColumnMapping } from "@/services/importService";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [mapping, setMapping] = useState<ColumnMapping>({
    sku: "",
    name: "",
    cost: "",
    price: "",
    stock: "",
    min_stock: "",
    category_id: "",
    category_name: "",
    brand: ""
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
            
            // Auto-mapping attempt
            const h = results.meta.fields.map(f => f.toLowerCase().trim());
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
        error: (err: any) => {
          setError(`Error parsing CSV headers: ${err.message}`);
        }
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    // Validate required mappings
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

  const mappingFields = [
    { label: "SKU / Code *", key: "sku" as keyof ColumnMapping },
    { label: "Product Name *", key: "name" as keyof ColumnMapping },
    { label: "Cost Price", key: "cost" as keyof ColumnMapping },
    { label: "Sale Price *", key: "price" as keyof ColumnMapping },
    { label: "Current Stock", key: "stock" as keyof ColumnMapping },
    { label: "Min. Stock", key: "min_stock" as keyof ColumnMapping },
    { label: "Category ID (Direct)", key: "category_id" as keyof ColumnMapping },
    { label: "Category/Dept Name", key: "category_name" as keyof ColumnMapping },
    { label: "Brand", key: "brand" as keyof ColumnMapping },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-20 lg:pt-8 custom-scrollbar bg-[#F8F9FA]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <button className="p-3 bg-white rounded-2xl hover:bg-secondary/50 text-primary transition-all shadow-sm border border-transparent hover:border-primary/10">
              <ArrowLeft size={20} strokeWidth={2} />
            </button>
          </Link>
          <div className="space-y-1">
             <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                     <UploadCloud size={24} strokeWidth={1.5} />
                 </div>
                 <h1 className="text-4xl font-black tracking-tight text-primary">Data Import</h1>
             </div>
             <p className="text-muted-foreground font-semibold flex items-center gap-2">
                 Import Inventory from CSV with custom mapping
             </p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-sm border border-primary/5 space-y-8">
          
          {success && (
            <div className="p-6 bg-accent/10 border border-accent/20 rounded-2xl flex items-center gap-4 text-accent">
              <CheckCircle2 className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Import Successful</h3>
                <p className="text-sm opacity-90">Your inventory data has been successfully imported into the system.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-500">
              <AlertCircle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Import Failed</h3>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          )}

          {!success && !file && (
            <label className="border-2 border-dashed border-primary/20 hover:border-primary/40 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-secondary/10 hover:bg-secondary/20 group">
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Select CSV File</h3>
              <p className="text-muted-foreground text-sm text-center max-w-sm">
                Upload any CSV product list. You will be able to map the columns in the next step.
              </p>
            </label>
          )}

          {file && headers.length > 0 && !success && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                    <Settings2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-primary">Map Your Columns</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Target: Supabase Products</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setFile(null); setHeaders([]); }}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary/30 p-6 rounded-3xl border border-primary/5">
                {mappingFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-xs font-black text-primary/60 uppercase ml-1">{field.label}</label>
                    <select 
                      className="w-full h-12 bg-white rounded-xl border border-primary/10 px-4 text-sm font-semibold focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
                      value={mapping[field.key as keyof ColumnMapping] || ""}
                      onChange={(e) => setMapping({...mapping, [field.key]: e.target.value})}
                    >
                      <option value="">Select CSV Column...</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-primary uppercase tracking-wider text-sm flex items-center gap-2">
                   <div className="w-2 h-4 bg-accent rounded-full" />
                   Data Preview (First 5 rows)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-primary/10 shadow-sm bg-white custom-scrollbar">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#fcfcfc] text-xs text-primary/60 uppercase font-black">
                      <tr>
                        {headers.map(h => <th key={h} className="px-4 py-4">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {preview.map((row, idx) => (
                        <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                          {headers.map(h => (
                            <td key={h} className="px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] font-medium text-primary/80">
                              {row[h]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleImport}
                  disabled={loading}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
                  {loading ? "Processing Information..." : "Start System Import"}
                </button>
                <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  Ready to process {file.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

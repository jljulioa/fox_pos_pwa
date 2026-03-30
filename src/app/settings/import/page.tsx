"use client";

import React, { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { importService, ImportRecord } from "@/services/importService";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      setSuccess(false);

      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setPreview(results.data.slice(0, 5) as ImportRecord[]);
          }
        },
        error: (err: any) => {
          setError(`Error parsing CSV: ${err.message}`);
        }
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const records = results.data as ImportRecord[];
          await importService.processImport(records);
          setSuccess(true);
          setFile(null);
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
                 Import Inventory from CSV
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

          {!success && (
            <div className="space-y-6">
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
                  Upload your INVENTARIO 2025.csv file here. Ensure columns match: Codigo, Descripcion, Precio Costo, Precio Venta, Inventario, Inv. Minim, Departamento.
                </p>
                {file && (
                  <div className="mt-6 px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    {file.name}
                  </div>
                )}
              </label>

              {preview.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-black text-primary uppercase tracking-wider text-sm">Data Preview (First 5 rows)</h4>
                  <div className="overflow-x-auto rounded-xl border border-primary/10 custom-scrollbar">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-secondary/50 text-xs text-primary/60 uppercase font-black">
                        <tr>
                          <th className="px-4 py-3">Codigo</th>
                          <th className="px-4 py-3">Descripcion</th>
                          <th className="px-4 py-3">Costo</th>
                          <th className="px-4 py-3">Venta</th>
                          <th className="px-4 py-3">Stock</th>
                          <th className="px-4 py-3">Depto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/5">
                        {preview.map((row, idx) => (
                          <tr key={idx} className="bg-white">
                            <td className="px-4 py-3 font-medium">{row.Codigo}</td>
                            <td className="px-4 py-3 truncate max-w-[200px]">{row.Descripcion}</td>
                            <td className="px-4 py-3">{row["Precio Costo"]}</td>
                            <td className="px-4 py-3">{row["Precio Venta"]}</td>
                            <td className="px-4 py-3">{row.Inventario}</td>
                            <td className="px-4 py-3">{row.Departamento}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <button 
                    onClick={handleImport}
                    disabled={loading}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
                    Confirm and Import All Data
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { settingsService } from "@/services/settingsService";
import { Building2, MapPin, FileText, FileSignature, Loader2, Save, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface InvoiceSettings {
  company_name: string;
  nit: string;
  address: string;
  footer_message: string;
}

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

  useEffect(() => {
    fetchSettings();
  }, []);

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
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-20 lg:pt-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/settings" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800 shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Invoice Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Configure your invoice templates and business information</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Invoice Configuration
            </h2>
            <p className="text-sm text-slate-500 mt-1">This information will appear on all printed tickets and receipts.</p>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company / Store Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={settings.company_name}
                  onChange={handleChange}
                  placeholder="e.g. Fox Moto Parts"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileSignature className="w-4 h-4" />
                  NIT / Tax ID
                </label>
                <input
                  type="text"
                  name="nit"
                  value={settings.nit}
                  onChange={handleChange}
                  placeholder="e.g. 123456789-0"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Store Address
              </label>
              <textarea
                name="address"
                value={settings.address}
                onChange={handleChange}
                placeholder="e.g. 123 Main St, City, State, ZIP"
                rows={2}
                required
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Footer Message (Receipts)
              </label>
              <textarea
                name="footer_message"
                value={settings.footer_message}
                onChange={handleChange}
                placeholder="e.g. Thank you for your business! No returns after 30 days."
                rows={3}
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none resize-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100">
              {success && (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Settings saved successfully
                </span>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="h-11 px-6 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl shadow-sm shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

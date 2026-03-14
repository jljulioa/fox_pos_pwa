import { supabase } from "@/lib/supabase";

export const settingsService = {
  async fetchInvoiceSettings() {
    return await supabase
      .from("invoice_settings")
      .select("*")
      .limit(1);
  },

  async saveInvoiceSettings(settings: any, originalName: string) {
    if (originalName) {
      return await supabase
        .from("invoice_settings")
        .update(settings)
        .eq("company_name", originalName);
    } else {
      return await supabase
        .from("invoice_settings")
        .insert([settings]);
    }
  }
};

import { supabase } from "@/lib/supabase";

export const reportService = {
  async fetchSalesData() {
    return await supabase
      .from("sales")
      .select("total_amount, date")
      .order('date', { ascending: true });
  },

  async fetchCategorySalesData() {
    return await supabase
      .from("sale_items")
      .select(`
        total_price,
        products (
          product_categories (name)
        )
      `);
  }
};

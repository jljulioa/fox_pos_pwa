import { supabase } from "@/lib/supabase";

export const categoriesService = {
  async fetchCategories() {
    return await supabase
      .from("product_categories")
      .select("*, taxes(name, rate)")
      .order("name");
  },

  async fetchTaxes() {
    return await supabase.from("taxes").select("*").eq("is_active", true);
  },

  async createCategory(payload: any) {
    return await supabase.from("product_categories").insert(payload);
  },

  async updateCategory(id: string, payload: any) {
    return await supabase.from("product_categories").update(payload).eq("id", id);
  },

  async deleteCategory(id: string) {
    return await supabase.from("product_categories").delete().eq("id", id);
  },
};

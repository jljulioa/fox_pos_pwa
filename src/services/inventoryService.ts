import { supabase } from "@/lib/supabase";

export const inventoryService = {
  async fetchProducts() {
    return await supabase
      .from("products")
      .select("*, product_categories(name, sku_slug)")
      .order("name");
  },

  async fetchCategories() {
    return await supabase.from("product_categories").select("*");
  },

  async generateSku(categoryId: string, brandName: string) {
    return await supabase.rpc("generate_moto_sku", {
      cat_id: categoryId,
      brand_name: brandName,
    });
  },

  async createProduct(payload: any) {
    return await supabase.from("products").insert(payload);
  },

  async updateProduct(id: string, payload: any) {
    return await supabase.from("products").update(payload).eq("id", id);
  },

  async deleteProduct(id: string) {
    return await supabase.from("products").delete().eq("id", id);
  },
};

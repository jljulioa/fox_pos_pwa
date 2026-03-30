import { supabase } from "@/lib/supabase";

export const posService = {
  async fetchProducts(query: string = "") {
    let supabaseQuery = supabase
      .from("products")
      .select("*, product_categories(id, name, taxes(id, name, rate, is_active))")
      .gt("stock", 0)
      .order("name");

    if (query) {
      supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
    }

    supabaseQuery = supabaseQuery.limit(12);
    return await supabaseQuery;
  },

  async fetchOpenSales() {
    return await supabase
      .from("sales")
      .select(`id, sale_ref, status, customer_id, total_amount, created_at, customers ( name, id )`)
      .eq("status", "open")
      .order("created_at", { ascending: false });
  },

  async fetchCustomers() {
    return await supabase.from("customers").select("id, name").order("name");
  },

  async fetchSaleItems(saleId: string) {
    return await supabase
      .from("sale_items")
      .select("*, products(*, product_categories(*, taxes(*)))")
      .eq("sale_id", saleId);
  },

  async getAdminUser() {
    return await supabase.from("users").select("id").eq("email", "admin@foxpos.com").single();
  },

  async createSale(customerId: string, cashierId: string | undefined) {
    return await supabase
      .from("sales")
      .insert({
        status: "open",
        customer_id: customerId,
        cashier_id: cashierId,
        total_amount: 0,
        payment_method: "cash",
      })
      .select("*, customers(name)")
      .single();
  },

  async updateSaleCustomer(saleId: string, customerId: string) {
    return await supabase.from("sales").update({ customer_id: customerId }).eq("id", saleId);
  },

  async updateSaleTotal(saleId: string, totalAmount: number) {
    return await supabase.from("sales").update({ total_amount: totalAmount }).eq("id", saleId);
  },

  async updateSaleItem(saleId: string, productId: string, updates: { 
    quantity?: number; 
    unit_price?: number;
    total_price: number; 
    tax_amount: number;
  }) {
    return await supabase
      .from("sale_items")
      .update(updates)
      .match({ sale_id: saleId, product_id: productId });
  },

  async insertSaleItem(saleId: string, productId: string, quantity: number, unitPrice: number, totalPrice: number, taxAmount: number) {
    return await supabase
      .from("sale_items")
      .insert({
        sale_id: saleId,
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        tax_amount: taxAmount,
      })
      .select()
      .single();
  },

  async deleteSaleItem(saleId: string, productId: string) {
    return await supabase
      .from("sale_items")
      .delete()
      .match({ sale_id: saleId, product_id: productId });
  },

  async finalizeSale(saleId: string, paymentMethod: string) {
    return await supabase.rpc("finalize_sale_and_log_stock", {
      p_sale_id: saleId,
      p_payment_method: paymentMethod,
    });
  },
};

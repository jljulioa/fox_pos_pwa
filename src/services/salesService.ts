import { supabase } from "@/lib/supabase";

export type FilterType = 'all' | 'today' | '7days' | 'month' | 'custom';

export const salesService = {
  async fetchSales({
    dateFilter,
    startDate,
    endDate,
    searchTerm,
    page,
    pageSize,
  }: {
    dateFilter: FilterType;
    startDate: string;
    endDate: string;
    searchTerm: string;
    page: number;
    pageSize: number;
  }) {
    let query = supabase
      .from("sales")
      .select("*, customers(name)", { count: 'exact' })
      .eq("status", "closed");

    // Apply Filters
    const now = new Date();
    if (dateFilter === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      query = query.gte('date', startOfDay);
    } else if (dateFilter === '7days') {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
      query = query.gte('date', sevenDaysAgo);
    } else if (dateFilter === 'month') {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      query = query.gte('date', firstDayOfMonth);
    } else if (dateFilter === 'custom' && startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    }

    // Search
    if (searchTerm) {
      query = query.ilike('sale_ref', `%${searchTerm}%`);
    }

    // Pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;

    return await query
      .order('date', { ascending: false })
      .range(from, to);
  },

  async fetchSaleDetails(saleId: string) {
    return await supabase
      .from("sale_items")
      .select("*, products(name, sku, stock)")
      .eq("sale_id", saleId);
  },

  async processReturn(item: any, selectedSale: any, returningQty: number = 1) {
    const taxPerUnit = item.tax_amount / item.quantity;
    const returningTax = taxPerUnit * returningQty;
    const returningTotalWithTax = (item.unit_price * returningQty) + returningTax;

    // 1. Update Sale Item
    if (item.quantity <= returningQty) {
      const { error: delErr } = await supabase.from("sale_items").delete().eq("id", item.id);
      if (delErr) throw delErr;
    } else {
      const newQty = item.quantity - returningQty;
      const newSubtotal = item.unit_price * newQty;
      const newTax = taxPerUnit * newQty;

      const { error: updErr } = await supabase
        .from("sale_items")
        .update({
          quantity: newQty,
          total_price: newSubtotal,
          tax_amount: newTax
        })
        .eq("id", item.id);
      if (updErr) throw updErr;
    }

    // 2. Increase Product Stock
    const { data: product } = await supabase.from("products").select("stock").eq("id", item.product_id).single();
    const newStock = (product?.stock || 0) + returningQty;

    // We use an RPC to bypass the auto-trigger which generates "MANUAL" transactions
    const { error: stockErr } = await supabase.rpc("set_stock_skip_trigger", { 
      p_product_id: item.product_id, 
      p_new_stock: newStock 
    });
    if (stockErr) throw stockErr;

    // 3. Log Inventory Transaction (Return)
    const { error: transErr } = await supabase.from("inventory_transactions").insert({
      product_id: item.product_id,
      product_name: item.products.name,
      transaction_type: 'return',
      quantity_change: returningQty,
      stock_before: product?.stock || 0,
      stock_after: newStock,
      related_document_id: selectedSale.sale_ref,
      notes: `Customer return from ${selectedSale.sale_ref}`
    });
    if (transErr) throw transErr;

    // 4. Update Sale Total (Subtract price + tax)
    const newTotal = selectedSale.total_amount - returningTotalWithTax;
    const { error: updateSaleErr } = await supabase.from("sales").update({ total_amount: newTotal }).eq("id", selectedSale.id);
    if (updateSaleErr) throw updateSaleErr;

    return newTotal;
  },

  async fetchSalesStats({
    dateFilter,
    startDate,
    endDate,
    searchTerm,
  }: {
    dateFilter: FilterType;
    startDate: string;
    endDate: string;
    searchTerm: string;
  }) {
    let salesQuery = supabase
      .from("sales")
      .select("id, total_amount")
      .eq("status", "closed");

    // Apply Filters (Shared logic with fetchSales)
    const now = new Date();
    if (dateFilter === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      salesQuery = salesQuery.gte('date', startOfDay);
    } else if (dateFilter === '7days') {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
      salesQuery = salesQuery.gte('date', sevenDaysAgo);
    } else if (dateFilter === 'month') {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      salesQuery = salesQuery.gte('date', firstDayOfMonth);
    } else if (dateFilter === 'custom' && startDate && endDate) {
      salesQuery = salesQuery.gte('date', startDate).lte('date', endDate);
    }

    if (searchTerm) {
      salesQuery = salesQuery.ilike('sale_ref', `%${searchTerm}%`);
    }

    const { data: sales, error: salesError } = await salesQuery;
    if (salesError) throw salesError;

    const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.total_amount), 0);
    const saleIds = sales.map(s => s.id);

    let totalUnits = 0;
    if (saleIds.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from("sale_items")
        .select("quantity")
        .in("sale_id", saleIds);
      
      if (itemsError) throw itemsError;
      totalUnits = items.reduce((acc, item) => acc + Number(item.quantity), 0);
    }

    return { totalRevenue, totalUnits };
  }
};

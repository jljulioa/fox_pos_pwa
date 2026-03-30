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
    const { data, error } = await supabase.rpc('process_sale_return', {
      p_sale_item_id: item.id,
      p_sale_id: selectedSale.id,
      p_product_id: item.product_id,
      p_returning_qty: returningQty,
      p_sale_ref: selectedSale.sale_ref
    });

    if (error) throw error;
    return data;
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
    // Shared Date Filter mapping logic
    const now = new Date();
    let p_start_date: string | null = null;
    let p_end_date: string | null = null;

    if (dateFilter === 'today') {
      p_start_date = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    } else if (dateFilter === '7days') {
      p_start_date = new Date(now.setDate(now.getDate() - 7)).toISOString();
    } else if (dateFilter === 'month') {
      p_start_date = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    } else if (dateFilter === 'custom' && startDate && endDate) {
      p_start_date = startDate;
      p_end_date = endDate;
    }

    const { data, error } = await supabase.rpc('get_sales_stats', {
      p_start_date,
      p_end_date,
      p_search_term: searchTerm || ''
    });

    if (error) throw error;
    return data; // Returns { totalRevenue, totalUnits }
  }
};

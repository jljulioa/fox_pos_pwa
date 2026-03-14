import { supabase } from "@/lib/supabase";

export type HistoryFilterType = "all" | "today" | "7days" | "month" | "custom";

export const historyService = {
  async fetchTransactions({
    dateFilter,
    startDate,
    endDate,
    searchTerm,
    page,
    pageSize,
  }: {
    dateFilter: string;
    startDate: string;
    endDate: string;
    searchTerm: string;
    page: number;
    pageSize: number;
  }) {
    let query = supabase
      .from("inventory_transactions")
      .select("*", { count: "exact" })
      .order("transaction_date", { ascending: false });

    // Date Filtering Logic
    const now = new Date();
    if (dateFilter === "today") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      query = query.gte("transaction_date", startOfDay);
    } else if (dateFilter === "7days") {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
      query = query.gte("transaction_date", sevenDaysAgo);
    } else if (dateFilter === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      query = query.gte("transaction_date", startOfMonth);
    } else if (dateFilter === "custom" && startDate && endDate) {
      query = query.gte("transaction_date", startDate).lte("transaction_date", endDate);
    }

    // Search
    if (searchTerm) {
      query = query.ilike("product_name", `%${searchTerm}%`);
    }

    // Pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    return await query;
  },
};

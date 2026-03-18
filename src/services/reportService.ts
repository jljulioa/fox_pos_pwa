import { supabase } from "@/lib/supabase";

export const reportService = {
  // Existing methods for Overview
  async fetchSalesData() {
    return await supabase
      .from("sales")
      .select("total_amount, date")
      .eq("status", "closed")
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
  },

  // 1. Stock / Inventory Reports
  async fetchStockStats() {
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, stock, min_stock, cost, price, product_categories(name)");
    
    if (error) throw error;

    let totalItems = 0;
    let totalStockValue = 0;
    let totalRetailValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const categoriesMap: Record<string, number> = {};

    products.forEach((p: any) => {
      const stock = Number(p.stock) || 0;
      totalItems += stock;
      totalStockValue += stock * (Number(p.cost) || 0);
      totalRetailValue += stock * (Number(p.price) || 0);
      
      if (stock === 0) outOfStockCount++;
      else if (stock <= (Number(p.min_stock) || 0)) lowStockCount++;

      const catName = p.product_categories?.name || "Uncategorized";
      categoriesMap[catName] = (categoriesMap[catName] || 0) + stock;
    });

    const categoryDistribution = Object.keys(categoriesMap).map(name => ({
      name,
      value: categoriesMap[name]
    })).sort((a, b) => b.value - a.value);

    return {
      totalItems,
      totalStockValue,
      totalRetailValue,
      potentialProfit: totalRetailValue - totalStockValue,
      lowStockCount,
      outOfStockCount,
      categoryDistribution: categoryDistribution.slice(0, 5),
      topLowStock: products.filter((p: any) => Number(p.stock) <= Number(p.min_stock) && Number(p.stock) > 0).slice(0, 10),
      topOutOfStock: products.filter((p: any) => Number(p.stock) === 0).slice(0, 10)
    };
  },

  // 2. Financial Reports
  async fetchFinancialStats(days: number = 30, customStartDate?: string, customEndDate?: string) {
    const now = new Date();
    let startDate = new Date(now.setDate(now.getDate() - days)).toISOString();
    let endDate = new Date().toISOString();

    if (customStartDate && customEndDate) {
        startDate = new Date(customStartDate).toISOString();
        const endDay = new Date(customEndDate);
        endDay.setHours(23, 59, 59, 999);
        endDate = endDay.toISOString();
    }

    const { data: sales, error: salesError } = await supabase
      .from("sales")
      .select("total_amount, date")
      .eq("status", "closed")
      .gte("date", startDate)
      .lte("date", endDate);

    if (salesError) throw salesError;

    const { data: purchases, error: purError } = await supabase
      .from("purchases")
      .select("total_amount, created_at")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (purError) throw purError;

    const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.total_amount || 0), 0);
    const totalExpenses = purchases.reduce((acc, pur) => acc + Number(pur.total_amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

    // Grouping by date for chart
    const dailyMap: Record<string, { income: number, expense: number }> = {};
    
    sales.forEach((s: any) => {
      if(!s.date) return;
      const d = s.date.split("T")[0];
      if (!dailyMap[d]) dailyMap[d] = { income: 0, expense: 0 };
      dailyMap[d].income += Number(s.total_amount || 0);
    });

    purchases.forEach((p: any) => {
      if(!p.created_at) return;
      const d = p.created_at.split("T")[0];
      if (!dailyMap[d]) dailyMap[d] = { income: 0, expense: 0 };
      dailyMap[d].expense += Number(p.total_amount || 0);
    });

    const dailyTrends = Object.keys(dailyMap).sort().map(date => ({
      date,
      income: dailyMap[date].income,
      expense: dailyMap[date].expense,
      profit: dailyMap[date].income - dailyMap[date].expense
    }));

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      avgOrderValue,
      dailyTrends
    };
  },

  // 3. Detailed Sales Stats
  async fetchDetailedSalesStats(days: number = 30, customStartDate?: string, customEndDate?: string) {
    const now = new Date();
    let startDate = new Date(now.setDate(now.getDate() - days)).toISOString();
    let endDate = new Date().toISOString();

    if (customStartDate && customEndDate) {
        startDate = new Date(customStartDate).toISOString();
        const endDay = new Date(customEndDate);
        endDay.setHours(23, 59, 59, 999);
        endDate = endDay.toISOString();
    }

    const { data: sales, error: salesError } = await supabase
      .from("sales")
      .select("id, total_amount, date")
      .eq("status", "closed")
      .gte("date", startDate)
      .lte("date", endDate);
      
    if (salesError) throw salesError;
    const saleIds = sales.map((s: any) => s.id);

    let totalSoldItems = 0;
    const productSalesMap: Record<string, { name: string, qty: number, revenue: number }> = {};

    if (saleIds.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from("sale_items")
        .select("quantity, total_price, products(name)")
        .in("sale_id", saleIds);

      if (itemsError) throw itemsError;

      items.forEach((item: any) => {
        const qty = Number(item.quantity || 0);
        const rev = Number(item.total_price || 0);
        const pName = item.products?.name || "Unknown";

        totalSoldItems += qty;

        if (!productSalesMap[pName]) {
          productSalesMap[pName] = { name: pName, qty: 0, revenue: 0 };
        }
        productSalesMap[pName].qty += qty;
        productSalesMap[pName].revenue += rev;
      });
    }

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    return {
      totalOrders: sales.length,
      totalSoldItems,
      topSellingProducts
    };
  }
};

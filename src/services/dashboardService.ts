import { supabase } from "@/lib/supabase";

export const dashboardService = {
  async fetchDashboardData() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
    
    // Fetch Sales (all closed)
    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select(`
        total_amount,
        date,
        customers (name)
      `)
      .eq("status", "closed")
      .order('date', { ascending: false });

    // Fetch Purchases (expenses)
    const { data: purchasesData, error: purchasesError } = await supabase
      .from("purchases")
      .select("total_amount, created_at")
      .order('created_at', { ascending: false });

    // Fetch Products (inventory)
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id, name, stock, min_stock, cost");

    if (salesError) throw salesError;
    if (productsError) throw productsError;
    if (purchasesError) throw purchasesError;

    // Basic Stats
    const totalRevenueSum = salesData?.reduce((acc, sale) => acc + Number(sale.total_amount || 0), 0) || 0;
    const orderCount = salesData?.length || 0;
    const productCount = productsData?.length || 0;
    const avgTicket = orderCount > 0 ? totalRevenueSum / orderCount : 0;
    
    // Low stock calculation
    const stockAlerts = productsData?.filter(p => Number(p.stock || 0) <= Number(p.min_stock || 0)) || [];
    
    // Calculate Weekly Cash Flow (Last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const cashFlowMap = new Map();
    
    // Initialize map with last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      cashFlowMap.set(dayName, { name: dayName, income: 0, expense: 0, date: d.toISOString().split('T')[0] });
    }

    // Process Sales into Map
    salesData?.forEach(sale => {
      if (!sale.date) return;
      const dateStr = sale.date.split('T')[0];
      const saleDay = new Date(sale.date);
      const dayName = days[saleDay.getDay()];
      if (cashFlowMap.has(dayName) && cashFlowMap.get(dayName).date === dateStr) {
        const entry = cashFlowMap.get(dayName);
        entry.income += Number(sale.total_amount || 0);
      }
    });

    // Process Purchases into Map
    purchasesData?.forEach(purchase => {
      if (!purchase.created_at) return;
      const dateStr = purchase.created_at.split('T')[0];
      const purchaseDay = new Date(purchase.created_at);
      const dayName = days[purchaseDay.getDay()];
      if (cashFlowMap.has(dayName) && cashFlowMap.get(dayName).date === dateStr) {
        const entry = cashFlowMap.get(dayName);
        entry.expense += Number(purchase.total_amount || 0);
      }
    });

    const cashFlowData = Array.from(cashFlowMap.values());


    return {
      totalRevenue: totalRevenueSum,
      orderCount,
      productCount,
      avgTicket,
      stockAlerts: stockAlerts.slice(0, 5),
      recentSales: salesData?.slice(0, 5) || [],
      cashFlowData
    };
  }
};

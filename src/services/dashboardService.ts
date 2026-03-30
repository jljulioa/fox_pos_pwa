import { supabase } from "@/lib/supabase";

export const dashboardService = {
  async fetchDashboardData() {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (error) throw error;
    
    // The data already contains totalRevenue, orderCount, productCount, avgTicket, stockAlerts, recentSales, cashFlowData.
    // They are correctly formatted from the database side.
    return data;
  }
};

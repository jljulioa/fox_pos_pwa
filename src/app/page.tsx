"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const cashFlowData = [
  { name: "Mon", income: 4000, expense: 2400 },
  { name: "Tue", income: 3000, expense: 1398 },
  { name: "Wed", income: 2000, expense: 9800 },
  { name: "Thu", income: 2780, expense: 3908 },
  { name: "Fri", income: 1890, expense: 4800 },
  { name: "Sat", income: 2390, expense: 3800 },
  { name: "Sun", income: 3490, expense: 4300 },
];

export default function Home() {
  const [stats, setStats] = useState([
    { label: "Total Revenue", value: "$0", icon: DollarSign, trend: "+12%", color: "text-primary", bg: "bg-primary/10" },
    { label: "Orders Count", value: "0", icon: ShoppingCart, trend: "+5%", color: "text-accent", bg: "bg-accent/10" },
    { label: "Total Products", value: "0", icon: Package, trend: "Stable", color: "text-emerald-700", bg: "bg-emerald-100" },
    { label: "Avg. Ticket", value: "$0", icon: TrendingUp, trend: "+8%", color: "text-teal-600", bg: "bg-teal-100" },
  ]);
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select(`
          total_amount,
          date,
          customers (name)
        `)
        .order('date', { ascending: false });

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, stock, min_stock");

      if (salesData && productsData) {
        const totalRevenueSum = salesData.reduce((acc, sale) => acc + Number(sale.total_amount), 0);
        const orderCount = salesData.length;
        const productCount = productsData.length;
        const avgTicket = orderCount > 0 ? totalRevenueSum / orderCount : 0;

        setStats([
          { label: "Total Revenue", value: `$${totalRevenueSum.toLocaleString()}`, icon: DollarSign, trend: "+12.5%", color: "text-primary", bg: "bg-primary/10" },
          { label: "Orders Count", value: orderCount.toString(), icon: ShoppingCart, trend: "+4.2%", color: "text-accent", bg: "bg-accent/10" },
          { label: "Total Products", value: productCount.toString(), icon: Package, trend: "Inventory", color: "text-emerald-700", bg: "bg-emerald-100" },
          { label: "Avg. Ticket", value: `$${avgTicket.toFixed(0)}`, icon: TrendingUp, trend: "+2.1%", color: "text-teal-600", bg: "bg-teal-100" },
        ]);

        const alerts = productsData.filter(p => p.stock <= p.min_stock);
        setStockAlerts(alerts.slice(0, 5));
        setRecentSales(salesData.slice(0, 5));
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Store Insights</h1>
          <p className="text-muted-foreground font-medium mt-1">Sleek performance tracking for your forest-themed POS.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 glass-dark rounded-2xl text-primary font-bold text-sm transition-all hover:scale-105 active:scale-95">
            <Filter size={18} />
            Filters
          </button>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 font-bold text-sm transition-all hover:scale-105 active:scale-95"
          >
            <Calendar size={18} strokeWidth={1.5} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="group glass p-7 rounded-[2.5rem] flex flex-col gap-4 transition-all hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon size={28} strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 bg-accent/10 text-accent rounded-full">
                <ArrowUpRight size={12} />
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black mt-1 text-primary">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Central Dual-Bar Cash Flow Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-[3rem] shadow-glass relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-black text-primary">Cash Flow Analysis</h3>
              <p className="text-sm text-muted-foreground font-medium">Weekly revenue vs expenses overview</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <div className="w-3 h-3 bg-accent rounded-full" />
                <span>Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 77, 64, 0.05)' }}
                  contentStyle={{
                    borderRadius: '20px',
                    border: 'none',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    padding: '15px'
                  }}
                />
                <Bar
                  dataKey="income"
                  fill="#004D40"
                  radius={[10, 10, 10, 10]}
                  barSize={18}
                />
                <Bar
                  dataKey="expense"
                  fill="#10B981"
                  radius={[10, 10, 10, 10]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Actions / Secondary Stats */}
        <div className="space-y-8">
          {/* Stock Alerts Section */}
          <div className="p-8 glass rounded-[3rem] h-full shadow-glass">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-primary">Low Stock</h3>
              <span className="px-3 py-1 bg-destructive/10 text-destructive text-[10px] font-black rounded-full uppercase tracking-tighter animate-pulse">Critical</span>
            </div>
            <div className="space-y-5">
              {stockAlerts.length > 0 ? (
                stockAlerts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 rounded-3xl bg-primary/5 border border-primary/5 hover:bg-white/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <p className="font-black text-sm text-primary">{product.name}</p>
                        <p className="text-[11px] text-muted-foreground font-bold">Qty: {product.stock} <span className="opacity-50">/ {product.min_stock}</span></p>
                      </div>
                    </div>
                    <button className="text-[10px] font-black text-white px-4 py-2 bg-primary rounded-xl hover:bg-emerald-800 transition-all shadow-md active:scale-95 uppercase tracking-tight">Restock</button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-30">
                  <Package size={64} strokeWidth={1} className="mb-4" />
                  <p className="text-sm font-bold">Inventory is stable</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-1">
        {/* Recent Sales Section (Full Width Bottom) */}
        <div className="p-8 glass rounded-[3.5rem] shadow-glass relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-primary">Live Transactions</h3>
              <p className="text-sm text-muted-foreground font-medium">Real-time sale stream</p>
            </div>
            <button className="text-xs font-black text-accent bg-accent/10 px-4 py-2 rounded-xl uppercase tracking-tighter">View All History</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {recentSales.length > 0 ? (
              recentSales.map((sale, i) => (
                <div key={i} className="flex flex-col p-5 rounded-3xl bg-secondary/20 border border-white/40 hover:scale-105 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white text-primary rounded-2xl flex items-center justify-center font-black text-lg shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                      {sale.customers?.name?.charAt(0) || "W"}
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-muted-foreground uppercase opacity-50 block">Amount</span>
                      <p className="font-black text-lg text-primary">${Number(sale.total_amount).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <p className="font-black text-sm text-primary truncate">{sale.customers?.name || "Walk-in Guest"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                      <p className="text-[10px] text-muted-foreground font-bold">{new Date(sale.date).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground opacity-30">
                <ShoppingCart size={64} strokeWidth={1} className="mb-4" />
                <p className="text-sm font-bold">No sales today yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


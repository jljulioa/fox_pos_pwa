"use client";

import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from "recharts";
import { Download, Calendar, TrendingUp, ArrowUpRight, Loader2 } from "lucide-react";
import { reportService } from "@/services/reportService";

export default function ReportsPage() {
    const [salesData, setSalesData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        fetchReportData();
    }, []);

    async function fetchReportData() {
        setLoading(true);
        try {
            // 1. Fetch Weekly Sales Data
            const { data: sales, error: salesError } = await reportService.fetchSalesData();

            if (sales) {
                const total = sales.reduce((acc, s) => acc + Number(s.total_amount), 0);
                setTotalRevenue(total);

                // Group by day for the line chart
                const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const grouped = sales.reduce((acc: any, sale) => {
                    const day = days[new Date(sale.date).getDay()];
                    acc[day] = (acc[day] || 0) + Number(sale.total_amount);
                    return acc;
                }, {});

                const chartData = days.map(day => ({
                    name: day,
                    sales: grouped[day] || 0
                }));
                // Reorder to start from Monday or current week? Let's just use the order as is for now.
                setSalesData(chartData);
            }

            // 2. Fetch Sales by Category
            const { data: categorySales, error: catError } = await reportService.fetchCategorySalesData();

            if (categorySales) {
                const groupedCat = categorySales.reduce((acc: any, item: any) => {
                    const catName = item.products?.product_categories?.name || "Uncategorized";
                    acc[catName] = (acc[catName] || 0) + Number(item.total_price);
                    return acc;
                }, {});

                const colors = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];
                const catChartData = Object.keys(groupedCat).map((key, i) => ({
                    name: key,
                    value: groupedCat[key],
                    color: colors[i % colors.length]
                }));
                setCategoryData(catChartData);
            }

        } catch (err) {
            console.error("Error fetching reports:", err);
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
        <div className="space-y-6">
            <div className="flex justify-end gap-3 mb-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-card hover:bg-secondary transition-colors text-sm font-medium">
                    <Calendar size={18} />
                    Last 7 Days
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm shadow-lg shadow-primary/20">
                    <Download size={18} />
                    Export Data
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Weekly Revenue Chart */}
                <div className="p-8 bg-card rounded-[2rem] border shadow-sm">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue (All Time)</p>
                            <h3 className="text-3xl font-bold">${totalRevenue.toFixed(2)}</h3>
                        </div>
                        <div className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-lg text-xs font-bold">
                            <ArrowUpRight size={14} /> +Real-time
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#4f46e5"
                                    strokeWidth={4}
                                    dot={{ r: 6, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Categories */}
                <div className="p-8 bg-card rounded-[2rem] border shadow-sm">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Sales by Category</p>
                            <h3 className="text-3xl font-bold">Category Distribution</h3>
                        </div>
                        <TrendingUp size={24} className="text-indigo-600" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#1f2937", fontSize: 12, fontWeight: 500 }}
                                    width={100}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

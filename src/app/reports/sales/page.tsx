"use client";

import { useState, useEffect } from "react";
import { reportService } from "@/services/reportService";
import { Loader2, TrendingUp, PackageSearch, Calendar } from "lucide-react";
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

export default function SalesReportPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState<number | "custom">(30);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

    useEffect(() => {
        async function fetchSales() {
            setLoading(true);
            try {
                if (days === "custom") {
                    const result = await reportService.fetchDetailedSalesStats(0, startDate, endDate);
                    setData(result);
                } else {
                    const result = await reportService.fetchDetailedSalesStats(days);
                    setData(result);
                }
            } catch (error) {
                console.error("Error fetching sales reports:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSales();
    }, [days, startDate, endDate]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!data) return null;

    const colors = ["#4f46e5", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#84cc16"];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-end gap-3 mb-4">
                {days === "custom" && (
                    <div className="flex items-center gap-2">
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-4 py-2 rounded-xl border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="text-muted-foreground text-sm">to</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-4 py-2 rounded-xl border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                )}
                <select 
                    value={days}
                    onChange={(e) => setDays(e.target.value === "custom" ? "custom" : Number(e.target.value))}
                    className="px-4 py-2 rounded-xl border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <option value={7}>Last 7 Days</option>
                    <option value={30}>Last 30 Days</option>
                    <option value={90}>Last 90 Days</option>
                    <option value={365}>Last Year</option>
                    <option value="custom">Custom Range</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-card rounded-[2rem] border shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
                        <h3 className="text-4xl font-black">{data.totalOrders}</h3>
                    </div>
                </div>

                <div className="p-6 bg-card rounded-[2rem] border shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <PackageSearch size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Items Sold</p>
                        <h3 className="text-4xl font-black">{data.totalSoldItems}</h3>
                    </div>
                </div>
            </div>

            {/* Top Selling Products */}
            <div className="p-8 bg-card rounded-[2rem] border shadow-sm">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-xl font-bold">Top Selling Products</h3>
                        <p className="text-sm font-medium text-muted-foreground mb-1">By quantity sold</p>
                    </div>
                </div>
                <div className="h-[400px] w-full mt-4">
                    {data.topSellingProducts.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topSellingProducts} margin={{ left: -20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: "#6b7280", fontSize: 11 }}
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    height={80}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                />
                                <Bar dataKey="qty" radius={[8, 8, 0, 0]} maxBarSize={50}>
                                     {data.topSellingProducts.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No sales data for this period
                        </div>
                    )}
                </div>
            </div>
            
            <div className="p-8 bg-card rounded-[2rem] border shadow-sm">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold">Product Performance</h3>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Revenue breakdown</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl">Product</th>
                                <th className="px-6 py-4">Quantity Sold</th>
                                <th className="px-6 py-4 rounded-tr-xl">Total Revenue generated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topSellingProducts.map((product: any, idx: number) => (
                                <tr key={idx} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4 font-medium">{product.name}</td>
                                    <td className="px-6 py-4">{product.qty} units</td>
                                    <td className="px-6 py-4 font-bold text-green-600">${product.revenue.toFixed(2)}</td>
                                </tr>
                            ))}
                            {data.topSellingProducts.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground">
                                        No sales data found for the selected period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

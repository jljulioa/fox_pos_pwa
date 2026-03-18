"use client";

import { useState, useEffect } from "react";
import { reportService } from "@/services/reportService";
import { Loader2, Package, AlertTriangle, Briefcase, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

export default function StockReportPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStock() {
            setLoading(true);
            try {
                const result = await reportService.fetchStockStats();
                setData(result);
            } catch (error) {
                console.error("Error fetching stock reports:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStock();
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!data) return null;

    const pieColors = ["#4f46e5", "#8b5cf6", "#d946ef", "#f43f5e", "#f97316"];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-card rounded-[2rem] border shadow-sm group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-3">Total Items in Stock</p>
                            <h3 className="text-3xl font-black text-primary">{data.totalItems}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                            <Package size={24} />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-card rounded-[2rem] border shadow-sm group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-3">Total Inventory Value</p>
                            <h3 className="text-3xl font-black text-emerald-600">${data.totalStockValue.toFixed(2)}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
                            <Briefcase size={24} />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-card rounded-[2rem] border shadow-sm group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-3">Retail Potential Value</p>
                            <h3 className="text-3xl font-black text-blue-600">${data.totalRetailValue.toFixed(2)}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                            <Activity size={24} />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-card rounded-[2rem] border shadow-sm group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-3">Low Stock Alerts</p>
                            <h3 className="text-3xl font-black text-amber-500">{data.lowStockCount}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 transition-transform group-hover:scale-110">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Category Distribution */}
                <div className="p-8 bg-card rounded-[2rem] border shadow-sm lg:col-span-1">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold">Category Distribution</h3>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Top categories by quantity</p>
                        </div>
                    </div>
                    {data.categoryDistribution.length > 0 ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.categoryDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.categoryDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                    />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-muted-foreground py-8">No category data</div>
                    )}
                </div>

                {/* Top Low Stock Alerts */}
                <div className="p-8 bg-card rounded-[2rem] border shadow-sm lg:col-span-2 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-amber-600 flex items-center gap-2">
                                <AlertTriangle size={20} /> Action Required: Low Stock
                            </h3>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Products running low on stock</p>
                        </div>
                        <div className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-xs font-bold uppercase tracking-widest">
                            {data.lowStockCount} Items
                        </div>
                    </div>
                    <div className="overflow-x-auto flex-1 h-[300px] custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase sticky top-0 bg-card z-10">
                                <tr>
                                    <th className="px-6 py-4">Product Name</th>
                                    <th className="px-6 py-4">Current Stock</th>
                                    <th className="px-6 py-4">Min Stock Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topLowStock.map((product: any, idx: number) => (
                                    <tr key={idx} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4 font-medium">{product.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md font-bold">{product.stock} units</span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{product.min_stock} units</td>
                                    </tr>
                                ))}
                                {data.topLowStock.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground">
                                            No low stock items! You're fully stocked.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
             {/* Top Out of Stock Alerts */}
             <div className="p-8 bg-card rounded-[2rem] border shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-red-600">Out of Stock Inventory</h3>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Products with exactly zero stock</p>
                    </div>
                    <div className="px-3 py-1 bg-red-500/10 text-red-600 rounded-lg text-xs font-bold uppercase tracking-widest">
                        {data.outOfStockCount} Items
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl">Product Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 rounded-tr-xl">Loss of Potential Revenue (Per unit)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topOutOfStock.map((product: any, idx: number) => (
                                <tr key={idx} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4 font-medium">{product.name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{product.product_categories?.name || 'Uncategorized'}</td>
                                    <td className="px-6 py-4 text-red-600 font-bold">${product.price}</td>
                                </tr>
                            ))}
                            {data.topOutOfStock.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground">
                                        No out of stock items found.
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

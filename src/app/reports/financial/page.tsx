"use client";

import { useState, useEffect } from "react";
import { reportService } from "@/services/reportService";
import { Loader2, DollarSign, Wallet, Percent, MoveUpRight, MoveDownRight } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function FinancialReportPage() {
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
        async function fetchData() {
            setLoading(true);
            try {
                if (days === "custom") {
                    const result = await reportService.fetchFinancialStats(0, startDate, endDate);
                    setData(result);
                } else {
                    const result = await reportService.fetchFinancialStats(days);
                    setData(result);
                }
            } catch (error) {
                console.error("Error fetching financial reports:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [days, startDate, endDate]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 rounded-[1.5rem] border shadow-sm gap-4">
                <p className="px-4 text-sm font-medium text-muted-foreground w-full sm:w-auto">Financial summary metrics</p>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {days === "custom" && (
                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-4 py-2 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <span className="text-muted-foreground text-sm">to</span>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-4 py-2 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    )}
                    <select 
                        value={days}
                        onChange={(e) => setDays(e.target.value === "custom" ? "custom" : Number(e.target.value))}
                        className="px-4 py-2 w-full sm:w-auto rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-secondary/50 transition-colors"
                    >
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={90}>Last 90 Days</option>
                        <option value={365}>Last Year</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-card rounded-[2rem] border shadow-sm group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-3">Total Revenue</p>
                            <h3 className="text-3xl font-black text-green-600">${data.totalRevenue.toFixed(2)}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 transition-transform group-hover:scale-110">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-card rounded-[2rem] border shadow-sm group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-3">Total Expenses</p>
                            <h3 className="text-3xl font-black text-red-600">${data.totalExpenses.toFixed(2)}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 transition-transform group-hover:scale-110">
                            <Wallet size={24} />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-card rounded-[2rem] border shadow-sm group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-3">Net Profit</p>
                            <h3 className={`text-3xl font-black ${data.netProfit >= 0 ? "text-primary" : "text-red-500"}`}>
                                ${Math.abs(data.netProfit).toFixed(2)}
                            </h3>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${data.netProfit >= 0 ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                            {data.netProfit >= 0 ? <MoveUpRight size={24} /> : <MoveDownRight size={24} />}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-card rounded-[2rem] border shadow-sm group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-3">Profit Margin</p>
                            <h3 className="text-3xl font-black text-orange-600">{data.margin.toFixed(1)}%</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 transition-transform group-hover:scale-110">
                            <Percent size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Income vs Expenses Chart */}
            <div className="p-8 bg-card rounded-[2rem] border shadow-sm">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-xl font-bold">Cash Flow Overview</h3>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Income and Expenses day by day</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-green-600"><span className="w-3 h-3 rounded-full bg-green-500"></span> Income</div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-red-600"><span className="w-3 h-3 rounded-full bg-red-500"></span> Expense</div>
                    </div>
                </div>
                
                <div className="h-[400px] w-full mt-4">
                    {data.dailyTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.dailyTrends} margin={{ left: -20, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: "#6b7280", fontSize: 11 }}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    dy={10}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                    formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`]}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}
                                />
                                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No financial data for this period
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    );
}

"use client";
import { useState, useEffect } from "react";
import { getCustomers, getAllTransactions } from "@/lib/firebase/db";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Users, DollarSign, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalDue: 0,
        totalPaid: 0,
        chartData: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [customers, transactions] = await Promise.all([
                getCustomers(),
                getAllTransactions()
            ]);

            const validCustomerIds = new Set(customers.map(c => c.id));

            // Filter out transactions from deleted (orphaned) customers
            const validTransactions = transactions.filter(t => validCustomerIds.has(t.customerId));

            const totalDue = customers.reduce((sum, c) => sum + (c.totalBaki || 0), 0);
            const totalPaid = validTransactions
                .filter(t => t.type === 'PAID')
                .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

            // Process Chart Data
            // Process Chart Data
            const monthlyData = {};
            validTransactions.forEach(t => {
                const date = t.date?.toDate ? t.date.toDate() : new Date(t.date?.seconds * 1000);
                if (isNaN(date.getTime())) return;

                const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });

                if (!monthlyData[key]) {
                    monthlyData[key] = {
                        name: key,
                        Baki: 0,
                        Porishodh: 0,
                        dateObj: date // stored for sorting
                    };
                }

                if (t.type === 'DUE') {
                    monthlyData[key].Baki += (Number(t.amount) || 0);
                } else {
                    monthlyData[key].Porishodh += (Number(t.amount) || 0);
                }
            });

            // Convert to array and sort by date
            const chartData = Object.values(monthlyData)
                .sort((a, b) => a.dateObj - b.dateObj)
                .map(({ dateObj, ...rest }) => rest); // remove dateObj before setting state

            setStats({
                totalCustomers: customers.length,
                totalDue,
                totalPaid,
                chartData
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="space-y-6">
                <header>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500">Welcome back!</p>
                </header>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading stats...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Total Customers Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <Users className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase">Total Customers</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
                                </div>
                            </div>

                            {/* Total Due Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                                    <DollarSign className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase">Total Market Due</p>
                                    <p className="text-3xl font-bold text-gray-900">৳ {stats.totalDue.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Total Porishodh Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                    <TrendingUp className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase">Total Porishodh</p>
                                    <p className="text-3xl font-bold text-gray-900">৳ {stats.totalPaid.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Summary Graph */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Monthly Baki vs Porishodh</h2>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                            tickFormatter={(value) => `৳${value}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F3F4F6' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => `৳ ${value?.toLocaleString()}`}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="Baki" name="Total Baki Given" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                        <Bar dataKey="Porishodh" name="Total Collected" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default Dashboard;

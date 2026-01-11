"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Users, Phone, Plus } from "lucide-react";
import { getCustomers } from "@/lib/firebase/db";
import ProtectedRoute from "@/components/ProtectedRoute";

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        const results = customers.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search)
        );
        setFilteredCustomers(results);
    }, [search, customers]);

    const fetchCustomers = async () => {
        const data = await getCustomers();
        setCustomers(data);
        setLoading(false);
    };

    return (
        <ProtectedRoute>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">All Customers</h1>
                    <Link
                        href="/add-customer"
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Add New Customer</span>
                    </Link>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading customers...</div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium text-gray-900">No customers found</p>
                            <p className="text-sm">Try adding a new customer or change search query.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredCustomers.map((customer) => (
                                <div
                                    key={customer.id}
                                    className="block p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 transition-colors">
                                                    {customer.name}
                                                </h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                                    <Phone className="h-3 w-3" />
                                                    {customer.phone}
                                                </div>
                                                <div className="mt-3">
                                                    <Link
                                                        href={`/customer/${customer.id}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Current Due</p>
                                                <p className={`font-bold ${customer.totalBaki > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                    ৳ {customer.totalBaki?.toLocaleString() || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default Customers;

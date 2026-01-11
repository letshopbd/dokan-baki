"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Calendar, Clock, Save, User } from "lucide-react";
import { addTransaction, getCustomers } from "@/lib/firebase/db";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

const GlobalAddBakiClient = () => {
    const router = useRouter();
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [items, setItems] = useState([{ id: 1, name: "", amount: "" }]);
    const [loading, setLoading] = useState(false);
    const [fetchingCustomers, setFetchingCustomers] = useState(true);

    useEffect(() => {
        // Set default date and time to now
        const now = new Date();
        setDate(now.toISOString().split('T')[0]);
        const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        setTime(timeString);

        fetchCustomersList();
    }, []);

    const fetchCustomersList = async () => {
        const data = await getCustomers();
        setCustomers(data);
        setFetchingCustomers(false);
    };

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), name: "", amount: "" }]);
    };

    const handleRemoveItem = (itemId) => {
        if (items.length === 1) return;
        setItems(items.filter(item => item.id !== itemId));
    };

    const handleItemChange = (id, field, value) => {
        const newItems = items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCustomerId) {
            alert("Please select a customer.");
            return;
        }

        const totalAmount = calculateTotal();
        if (totalAmount <= 0) {
            alert("Please add at least one item with an amount.");
            return;
        }

        if (items.some(item => !item.name.trim())) {
            alert("Please enter a name for all items.");
            return;
        }

        setLoading(true);
        try {
            // Combine date and time
            const dateTime = new Date(`${date}T${time}`);

            await addTransaction(selectedCustomerId, {
                type: "DUE",
                amount: totalAmount,
                description: `Baki: ${items.map(i => i.name).join(", ")}`,
                date: dateTime.toISOString(),
                items: items.map(({ name, amount }) => ({ name, amount: parseFloat(amount) }))
            });
            router.push("/customers");
        } catch (error) {
            console.error("Error adding baki:", error);
            alert("Failed to add baki. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingCustomers) {
        return <div className="p-12 text-center text-gray-500">Loading customers...</div>;
    }

    return (
        <ProtectedRoute>
            <div className="max-w-2xl mx-auto">
                <Link
                    href="/customers"
                    className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Customers
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h1 className="text-xl font-bold text-gray-900">Add New Baki</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Select a customer and add their due details
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Customer Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <User className="h-4 w-4" /> Select Customer
                            </label>
                            <div className="relative">
                                <select
                                    required
                                    value={selectedCustomerId}
                                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white"
                                >
                                    <option value="">-- Choose a Customer --</option>
                                    {customers.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.phone})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Date and Time Section */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Time
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-sm font-medium text-gray-700">Items (Products)</label>
                            </div>

                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={item.id} className="flex gap-3 items-start animate-fadeIn">
                                        <div className="flex-grow">
                                            <input
                                                type="text"
                                                placeholder="Item Name (e.g. Rice, Oil)"
                                                required
                                                value={item.name}
                                                onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={item.amount}
                                                onChange={(e) => handleItemChange(item.id, 'amount', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all text-right"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(item.id)}
                                            className={`p-3 rounded-xl border border-gray-200 transition-all ${items.length === 1
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-red-500 hover:bg-red-50 hover:border-red-200'
                                                }`}
                                            disabled={items.length === 1}
                                            title="Remove Item"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                            >
                                <Plus className="h-4 w-4" /> Add Another Item
                            </button>
                        </div>

                        {/* Total Section */}
                        <div className="bg-red-50 rounded-xl p-4 flex justify-between items-center border border-red-100">
                            <span className="font-semibold text-red-900">Total Baki Amount</span>
                            <span className="text-2xl font-bold text-red-600">
                                ৳ {calculateTotal().toLocaleString()}
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    Save Baki Record
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default GlobalAddBakiClient;

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Calendar, Clock, User, History } from "lucide-react";
import { addTransaction, getCustomers, getTransactions } from "@/lib/firebase/db";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

const GlobalAddPaymentClient = () => {
    const router = useRouter();
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
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
        // Only show customers who have due > 0
        const customersWithDue = data.filter(c => parseFloat(c.totalBaki) > 0);
        setCustomers(customersWithDue);
        setFetchingCustomers(false);
    };

    // When customer changes, fetch their details and transactions
    useEffect(() => {
        if (selectedCustomerId) {
            const customer = customers.find(c => c.id === selectedCustomerId);
            setSelectedCustomer(customer);
            fetchCustomerHistory(selectedCustomerId);
        } else {
            setSelectedCustomer(null);
            setRecentTransactions([]);
        }
    }, [selectedCustomerId, customers]);

    const fetchCustomerHistory = async (id) => {
        const txs = await getTransactions(id);
        // Filter for DUE transactions to show what needs to be paid? 
        // Or just show recent history. User said "baki date & time, Product name and amount show korbe"
        // Showing last 5 transactions seems appropriate for context.
        setRecentTransactions(txs.slice(0, 5));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCustomerId) {
            alert("Please select a customer.");
            return;
        }

        if (parseFloat(amount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        const currentDue = selectedCustomer ? (parseFloat(selectedCustomer.totalBaki) || 0) : 0;

        if (parseFloat(amount) > currentDue) {
            alert(`Payment amount cannot exceed the total due of ৳${currentDue}`);
            return;
        }

        setLoading(true);
        try {
            const dateTime = new Date(`${date}T${time}`);

            await addTransaction(selectedCustomerId, {
                type: "PAID",
                amount: parseFloat(amount),
                description: note || "Payment Received",
                date: dateTime.toISOString(),
            });
            router.push("/customers");
        } catch (error) {
            console.error("Error adding payment:", error);
            alert("Failed to add payment. Please try again.");
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
                        <h1 className="text-xl font-bold text-gray-900">Add Porishodh (Payment)</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Record a payment from a customer
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Customer Selection */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <User className="h-4 w-4" /> Select Customer
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={selectedCustomerId}
                                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white font-medium"
                                    >
                                        <option value="">-- Choose a Customer --</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.phone}) - Due: ৳{c.totalBaki}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Summary & Recent Due Items */}
                            {selectedCustomer && (
                                <div className="animate-fadeIn">
                                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 mb-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-indigo-900 text-opacity-70 font-medium">Current Total Due</p>
                                                <p className="text-3xl font-bold text-indigo-700 mt-1">
                                                    ৳ {selectedCustomer.totalBaki?.toLocaleString() || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {recentTransactions.length > 0 && (
                                        <div className="mb-6">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                                                <History className="h-3 w-3" /> Recent Transactions
                                            </label>
                                            <div className="space-y-2 bg-gray-50 rounded-xl p-3 max-h-48 overflow-y-auto custom-scrollbar border border-gray-100">
                                                {recentTransactions.map(tx => (
                                                    <div key={tx.id} className="flex justify-between items-start text-sm p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {tx.description || (tx.type === 'DUE' ? 'Baki' : 'Payment')}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                {new Date(tx.date.seconds * 1000).toLocaleDateString()} at {new Date(tx.date.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                        <span className={`font-semibold ${tx.type === 'DUE' ? 'text-red-600' : 'text-emerald-600'}`}>
                                                            {tx.type === 'DUE' ? '+' : '-'}৳{tx.amount}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Payment Entry Section */}
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-emerald-600" /> Enter Payment Details
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
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
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Porishodh Amount (৳)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">৳</span>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-2xl font-bold text-emerald-600 placeholder-gray-300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                                    <input
                                        type="text"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="e.g. Cash payment, bkash..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !selectedCustomerId}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="h-6 w-6" />
                                    Confirm Payment
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default GlobalAddPaymentClient;

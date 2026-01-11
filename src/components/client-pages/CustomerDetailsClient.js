"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Plus, Minus, Calendar } from "lucide-react";
import { getTransactions, deleteCustomer, updateCustomer } from "@/lib/firebase/db";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import ProtectedRoute from "@/components/ProtectedRoute";

const CustomerDetailsClient = ({ id }) => {
    const router = useRouter();
    const [customer, setCustomer] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit/Delete States
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");

    useEffect(() => {
        // Real-time listener for customer details
        const unsubCustomer = onSnapshot(doc(db, "customers", id), (doc) => {
            if (doc.exists()) {
                setCustomer({ id: doc.id, ...doc.data() });
                setEditName(doc.data().name);
                setEditPhone(doc.data().phone);
            } else {
                router.push("/");
            }
        });

        // Fetch transactions (non-realtime for now as per previous implementation)
        fetchTransactions();

        return () => unsubCustomer();
    }, [id, router]);

    const fetchTransactions = async () => {
        const data = await getTransactions(id);
        setTransactions(data);
        setLoading(false);
    };

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();
        if (!confirm("Update customer details?")) return;

        await updateCustomer(id, { name: editName, phone: editPhone });
        setShowEditModal(false);
    };

    // Delete Confirmation State
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteCustomer = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const result = await deleteCustomer(id);
            if (result.error) {
                alert("Error deleting customer: " + result.error);
                console.error("Delete error:", result.error);
                setShowDeleteModal(false);
            } else {
                router.push("/");
            }
        } catch (error) {
            console.error("Unexpected error during deletion:", error);
            alert("An unexpected error occurred.");
            setShowDeleteModal(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!customer) return null;

    return (
        <ProtectedRoute>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/")}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
                </div>

                {/* Customer Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row justify-between gap-6">
                        <div className="flex items-start gap-5">
                            <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-2xl shrink-0">
                                {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                                <div className="flex items-center gap-2 text-gray-500 mt-1">
                                    <Phone className="h-4 w-4" />
                                    <span>{customer.phone}</span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                                    >
                                        Edit Details
                                    </button>
                                    <button
                                        onClick={handleDeleteCustomer}
                                        className="px-3 py-1.5 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                                    >
                                        Delete Customer
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="text-left sm:text-right p-4 bg-gray-50 rounded-xl sm:bg-transparent sm:p-0">
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">Total Due Amount</p>
                            <p className={`text-3xl font-bold ${customer.totalBaki > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ৳ {customer.totalBaki?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <Link
                            href={`/customer/${id}/transaction?type=DUE`}
                            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium transition shadow-lg shadow-red-600/20"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Add Baki (Due)</span>
                        </Link>
                        <Link
                            href={`/customer/${id}/transaction?type=PAID`}
                            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-medium transition shadow-lg shadow-emerald-600/20"
                        >
                            <Minus className="h-5 w-5" />
                            <span>Add Payment</span>
                        </Link>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 pl-1">Transaction History</h3>

                    {transactions.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-100 shadow-sm">
                            <p>No transactions found.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                            {transactions.map((t) => (
                                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${t.type === 'DUE' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {t.type === 'DUE' ? <Plus className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">
                                                {t.description || (t.type === 'DUE' ? 'Baki Added' : 'Payment Received')}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                <Calendar className="h-3 w-3" />
                                                {t.date?.toDate ? t.date.toDate().toLocaleString() : new Date(t.date?.seconds * 1000).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-bold text-lg ${t.type === 'DUE' ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {t.type === 'DUE' ? '+' : '-'} ৳ {t.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Customer</h3>
                            <form onSubmit={handleUpdateCustomer} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold">!</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Customer?</h3>
                            <p className="text-gray-500 mb-8">
                                Are you sure you want to delete this customer? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
                                >
                                    No, Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/20"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default CustomerDetailsClient;

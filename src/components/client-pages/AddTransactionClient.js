"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { addTransaction } from "@/lib/firebase/db";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import ProtectedRoute from "@/components/ProtectedRoute";

const AddTransactionClient = ({ id, type }) => {
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [customerName, setCustomerName] = useState("");

    const isDue = type === 'DUE';

    useEffect(() => {
        // Validate type
        if (type !== 'DUE' && type !== 'PAID') {
            router.push("/");
            return;
        }

        // Fetch customer name for context
        const fetchCustomer = async () => {
            const docRef = doc(db, "customers", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setCustomerName(docSnap.data().name);
            } else {
                router.push("/");
            }
        };
        fetchCustomer();
    }, [id, type, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await addTransaction(id, {
            amount,
            type,
            description
        });

        if (!error) {
            router.push(`/customer/${id}`);
        } else {
            alert("Failed to add transaction: " + error);
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="max-w-xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/customer/${id}`)}
                        className="p-2 -ml-2 hover:bg-white rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isDue ? "Add Baki (Due)" : "Add Payment (Joma)"}
                        </h1>
                        <p className="text-sm text-gray-500">for {customerName}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                    <div className={`mb-8 flex justify-center`}>
                        <div className={`h-20 w-20 rounded-full flex items-center justify-center ${isDue ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {isDue ? <Plus className="h-10 w-10" /> : <Minus className="h-10 w-10" />}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">৳</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    autoFocus
                                    className={`w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-4 transition-all outline-none text-2xl font-bold ${isDue
                                        ? 'focus:border-red-500 focus:ring-red-100 text-red-600'
                                        : 'focus:border-emerald-500 focus:ring-emerald-100 text-emerald-600'
                                        }`}
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                                placeholder={isDue ? "e.g., Rice 5kg, Oil 1L" : "e.g., Cash, bKash"}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full text-white font-semibold py-4 rounded-xl transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 ${isDue
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                }`}
                        >
                            {loading ? "Saving..." : (isDue ? "Confirm Due" : "Confirm Payment")}
                        </button>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AddTransactionClient;

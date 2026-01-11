"use client";
import { useState } from "react";
import { addCustomer } from "@/lib/firebase/db";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Save } from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

const AddCustomer = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (!name.trim()) {
            alert("Customer name is required");
            setLoading(false);
            return;
        }

        const { id, error } = await addCustomer({
            name: name.trim(),
            phone: phone.trim()
        });

        if (error) {
            alert("Error adding customer: " + error);
        } else {
            router.push(`/customer/${id}`);
        }
        setLoading(false);
    };

    return (
        <ProtectedRoute>
            <div className="max-w-xl mx-auto">
                <Link href="/" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-indigo-600" />
                            Add New Customer
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                            <input
                                type="text"
                                required
                                placeholder="Enter full name"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number (Optional)</label>
                            <input
                                type="tel"
                                placeholder="Enter mobile number"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    Save Customer
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AddCustomer;

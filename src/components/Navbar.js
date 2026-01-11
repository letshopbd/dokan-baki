"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/lib/firebase/auth";
import { LayoutDashboard, LogOut, PlusCircle, MinusCircle, Users } from "lucide-react";

const Navbar = () => {
    const { user } = useAuth();
    const pathname = usePathname();

    const handleLogout = async () => {
        await logoutUser();
    };

    if (!user) return null;

    const isActive = (path) => pathname === path ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50";

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-all duration-300">
                            <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Dokan Baki
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/')}`}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>

                        <Link
                            href="/customers"
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/customers')}`}
                        >
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Customers</span>
                        </Link>



                        <Link
                            href="/add-baki"
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/add-baki')}`}
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Baki</span>
                        </Link>

                        <Link
                            href="/add-payment"
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/add-payment')}`}
                        >
                            <MinusCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Porishodh</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-colors ml-2"
                            title="Log Out"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

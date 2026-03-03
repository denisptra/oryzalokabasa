"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminSidebar from "@/components/AdminSidebar";

export default function DashboardLayout({ children }) {
    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-slate-50">
                <AdminSidebar />
                <div className="flex-1 min-w-0">
                    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
                        {children}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

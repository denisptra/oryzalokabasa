"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { logAPI } from "@/lib/api";
import {
    ScrollText,
    Loader,
    AlertCircle,
    Clock,
    User,
    Info,
    X,
    Filter,
} from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminTable from "@/components/admin/AdminTable";

const ACTION_COLORS = {
    CREATE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    UPDATE: "bg-blue-50 text-blue-700 border-blue-200",
    DELETE: "bg-red-50 text-red-700 border-red-200",
    LOGIN: "bg-violet-50 text-violet-700 border-violet-200",
    LOGOUT: "bg-slate-50 text-slate-700 border-slate-200",
    REGISTER: "bg-amber-50 text-amber-700 border-amber-200",
};

const MODULE_COLORS = {
    AUTH: "text-violet-600",
    POST: "text-blue-600",
    GALLERY: "text-emerald-600",
    HERO_SLIDER: "text-amber-600",
    CONTACT: "text-pink-600",
    SETTING: "text-cyan-600",
    USER: "text-indigo-600",
    CATEGORY: "text-teal-600",
};

export default function LogsPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filters
    const [search, setSearch] = useState("");
    const [moduleFilter, setModuleFilter] = useState("all");

    // Modal
    const [detailLog, setDetailLog] = useState(null);

    const fetchData = async () => {
        // // setLoading(true);
        try {
            const params = moduleFilter !== "all" ? `module=${moduleFilter}` : "";
            const res = await logAPI.getAll(params);
            setLogs(res.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [moduleFilter]);

    const filteredLogs = logs.filter((log) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            log.action?.toLowerCase().includes(s) ||
            log.module?.toLowerCase().includes(s) ||
            log.user?.name?.toLowerCase().includes(s) ||
            log.user?.email?.toLowerCase().includes(s)
        );
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
            " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <AdminPageHeader 
                title="Log Aktivitas" 
                subtitle="Riwayat semua aktivitas di sistem"
                icon={ScrollText}
                stats={[{ label: "Total Aktivitas", value: logs.length }]}
            />

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
            )}

            <AdminFilters 
                search={search}
                onSearchChange={setSearch}
                placeholder="Cari aktivitas, user, atau module..."
                dropdowns={[
                    {
                        label: "Modul",
                        value: moduleFilter,
                        onChange: setModuleFilter,
                        options: [
                            { id: "AUTH", name: "AUTH" },
                            { id: "POST", name: "POST" },
                            { id: "GALLERY", name: "GALLERY" },
                            { id: "HERO_SLIDER", name: "HERO_SLIDER" },
                            { id: "USER", name: "USER" },
                            { id: "SETTING", name: "SETTING" }
                        ],
                        icon: Filter,
                        allLabel: "Semua Modul"
                    }
                ]}
            />

            <AdminTable 
                columns={[
                    { label: "#", className: "w-12 text-center" },
                    { label: "Aksi", className: "w-32" },
                    { label: "Modul", className: "w-32" },
                    { label: "Pengguna" },
                    { label: "Waktu", className: "w-48" },
                    { label: "Detail", className: "text-right w-24" }
                ]}
                data={filteredLogs}
                loading={loading}
                selectedIds={[]}
                renderRow={(log, index) => (
                    <tr 
                        key={log.id} 
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        onClick={() => setDetailLog(log)}
                    >
                        <td className="px-4 py-4 text-center text-sm font-bold text-slate-400">
                            {index + 1}
                        </td>
                        <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-xs ${ACTION_COLORS[log.action] || ACTION_COLORS.CREATE}`}>
                                {log.action}
                            </span>
                        </td>
                        <td className="px-4 py-4">
                            <span className={`text-xs font-bold ${MODULE_COLORS[log.module] || "text-slate-500"}`}>
                                {log.module}
                            </span>
                        </td>
                        <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex w-8 h-8 rounded-full bg-slate-100 items-center justify-center shrink-0 border border-slate-200">
                                    <User size={14} className="text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">
                                        {log.user?.name || "System"}
                                    </p>
                                    <p className="text-[10px] text-slate-500 truncate font-medium">
                                        {log.user?.email || "-"}
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold whitespace-nowrap">
                                <Clock size={14} className="text-slate-400" />
                                <span>{formatDate(log.createdAt)}</span>
                            </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                            <button className="p-2 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all border border-transparent group-hover:border-blue-100">
                                <Info size={16} />
                            </button>
                        </td>
                    </tr>
                )}
            />

            {/* Detail Modal */}
            {detailLog && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Info size={20} className="text-blue-600" />
                                Detail Log
                            </h3>
                            <button onClick={() => setDetailLog(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Aksi</p>
                                    <span className={`inline-flex text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${ACTION_COLORS[detailLog.action] || ""}`}>
                                        {detailLog.action}
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Modul</p>
                                    <p className={`text-sm font-bold ${MODULE_COLORS[detailLog.module] || "text-slate-700"}`}>
                                        {detailLog.module}
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pengguna</p>
                                    <p className="text-sm font-medium text-slate-800">{detailLog.user?.name || "System"}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Waktu</p>
                                    <p className="text-sm font-medium text-slate-800">{formatDate(detailLog.createdAt)}</p>
                                </div>
                            </div>

                            {detailLog.entityId && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-700 mb-1.5 pl-1">Target Entity ID</p>
                                    <p className="text-sm text-slate-600 font-mono bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 break-all">
                                        {detailLog.entityId}
                                    </p>
                                </div>
                            )}

                            {detailLog.details && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-700 mb-1.5 pl-1">Data Tambahan (Details)</p>
                                    <div className="bg-slate-50 max-h-48 overflow-auto rounded-xl border border-slate-100 p-1">
                                        <pre className="text-[11px] text-slate-600 font-mono p-3 leading-relaxed">
                                            {JSON.stringify(detailLog.details, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {detailLog.ipAddress && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-700 mb-1.5 pl-1">IP Address</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-mono bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                                        <span>{detailLog.ipAddress}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

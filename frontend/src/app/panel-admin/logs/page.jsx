"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { logAPI } from "@/lib/api";
import {
    ScrollText,
    Search,
    Loader,
    AlertCircle,
    Clock,
    User,
    Info,
    X,
    Filter,
} from "lucide-react";

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
        setLoading(true);
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
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <ScrollText size={28} className="text-blue-600" />
                    Log Aktivitas
                </h1>
                <p className="text-slate-500 mt-1">Riwayat semua aktivitas di sistem</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Filter & Search */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari aktivitas, user, atau module..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400 hidden sm:block" />
                        <span className="text-sm font-medium text-slate-500 hidden sm:block">Filter:</span>
                    </div>
                    <button
                        onClick={() => setModuleFilter("all")}
                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border ${moduleFilter === "all" ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                    >
                        Semua
                    </button>
                    {["AUTH", "POST", "GALLERY", "HERO_SLIDER", "USER", "SETTING"].map((mod) => (
                        <button
                            key={mod}
                            onClick={() => setModuleFilter(mod)}
                            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border ${moduleFilter === mod ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                        >
                            {mod}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs Table List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-16">
                        <ScrollText size={48} className="text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Belum ada log aktivitas ditemukan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12 text-center">#</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Modul</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengguna</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Waktu</th>
                                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.map((log, index) => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                        onClick={() => setDetailLog(log)}
                                    >
                                        <td className="px-4 py-4 text-center text-sm font-medium text-slate-400">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${ACTION_COLORS[log.action] || ACTION_COLORS.CREATE}`}>
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
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 hidden sm:flex">
                                                    <User size={14} className="text-slate-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 truncate">
                                                        {log.user?.name || "System"}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {log.user?.email || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-500 hidden md:table-cell">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-slate-400" />
                                                <span>{formatDate(log.createdAt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                className="p-2 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors inline-block"
                                                title="Lihat Detail"
                                            >
                                                <Info size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

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

"use client";

import { useState, useEffect } from "react";
import { contactAPI } from "@/lib/api";
import {
    MessageSquare,
    Search,
    Trash2,
    X,
    Loader,
    CheckCircle,
    Mail,
    MailOpen,
    Archive,
    Eye,
    Clock,
    User,
    AlertCircle,
    Filter,
} from "lucide-react";

export default function ContactsPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters and Selection
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedIds, setSelectedIds] = useState([]);

    // Modals
    const [viewMessage, setViewMessage] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

    // Feedback
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const fetchMessages = async () => {
        // // setLoading(true);
        try {
            const res = await contactAPI.getAll();
            setMessages(res.data || []);
            setSelectedIds([]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const filteredMessages = messages.filter((m) => {
        const matchSearch =
            m.name?.toLowerCase().includes(search.toLowerCase()) ||
            m.email?.toLowerCase().includes(search.toLowerCase()) ||
            m.topic?.toLowerCase().includes(search.toLowerCase()) ||
            m.message?.toLowerCase().includes(search.toLowerCase());

        if (filter === "unread") return matchSearch && m.status === "UNREAD";
        if (filter === "read") return matchSearch && m.status === "READ";
        if (filter === "archived") return matchSearch && m.status === "ARCHIVED";
        return matchSearch;
    });

    // Checkbox toggles
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredMessages.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredMessages.map(item => item.id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await contactAPI.markAsRead(id);
            setSuccess("Pesan ditandai sebagai dibaca!");
            fetchMessages();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleArchive = async (id) => {
        try {
            await contactAPI.markAsArchived(id);
            setSuccess("Pesan diarsipkan!");
            fetchMessages();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await contactAPI.delete(id);
            setSuccess("Pesan berhasil dihapus!");
            setDeleteConfirm(null);
            setViewMessage(null);
            fetchMessages();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        try {
            // Note: Replace this with actual bulk delete API call if available
            await Promise.all(selectedIds.map(id => contactAPI.delete(id)));
            setSuccess(`${selectedIds.length} Pesan berhasil dihapus!`);
            setBulkDeleteConfirm(false);
            setSelectedIds([]);
            fetchMessages();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Gagal menghapus beberapa pesan: " + err.message);
        }
    };

    // Handle bulk archive
    const handleBulkArchive = async () => {
        try {
            await Promise.all(selectedIds.map(id => contactAPI.markAsArchived(id)));
            setSuccess(`${selectedIds.length} Pesan berhasil diarsipkan!`);
            setSelectedIds([]);
            fetchMessages();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Gagal mengarsipkan beberapa pesan: " + err.message);
        }
    };

    const handleView = async (msg) => {
        setViewMessage(msg);
        if (msg.status === "UNREAD") {
            try {
                await contactAPI.markAsRead(msg.id);
                fetchMessages();
            } catch (err) {
                console.error("Mark as read error:", err);
            }
        }
    };

    const unreadCount = messages.filter((m) => m.status === "UNREAD").length;

    const getStatusBadge = (status) => {
        switch (status) {
            case "UNREAD":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "READ":
                return "bg-slate-100 text-slate-600 border-slate-200";
            case "ARCHIVED":
                return "bg-amber-50 text-amber-700 border-amber-200";
            default:
                return "bg-slate-50 text-slate-500 border-slate-200";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "UNREAD": return "Belum Dibaca";
            case "READ": return "Dibaca";
            case "ARCHIVED": return "Diarsipkan";
            default: return status;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare size={28} className="text-blue-600" />
                        Pesan Kontak
                        {unreadCount > 0 && (
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold ml-2 shadow-sm shadow-red-500/20">
                                {unreadCount} Baru
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 mt-1">Kelola pesan dari pengunjung website</p>
                </div>
                <div className="flex items-center">
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold flex items-center gap-2">
                        <span>Total:</span>
                        <span className="bg-white px-2 py-0.5 rounded-lg border border-blue-100">{messages.length}</span>
                    </div>
                </div>
            </div>

            {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top">
                    <CheckCircle size={20} className="text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-800">{success}</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
            )}

            {/* Search & Filter */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari pesan berdasarkan nama, email, topik..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <div className="relative w-full">
                            <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm appearance-none font-bold text-slate-700 transition-all"
                            >
                                <option value="all">Semua Status</option>
                                <option value="unread">Belum Dibaca</option>
                                <option value="read">Dibaca</option>
                                <option value="archived">Diarsipkan</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-bold text-blue-800 ml-2">
                        {selectedIds.length} pesan dipilih
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleBulkArchive}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Archive size={16} className="text-amber-500" />
                            Arsipkan
                        </button>
                        <button
                            onClick={() => setBulkDeleteConfirm(true)}
                            className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Hapus
                        </button>
                    </div>
                </div>
            )}

            {/* Messages Table List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-16">
                        <MessageSquare size={48} className="text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Tidak ada pesan ditemukan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-5 py-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredMessages.length && filteredMessages.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16"></th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[200px]">Pengirim</th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[250px]">Pesan</th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMessages.map((msg) => (
                                    <tr
                                        key={msg.id}
                                        className={`hover:bg-slate-50/80 transition-colors group ${selectedIds.includes(msg.id) ? 'bg-blue-50/50' : ''} ${msg.status === "UNREAD" ? 'bg-slate-50/30' : ''}`}
                                    >
                                        <td className="px-5 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(msg.id)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    toggleSelect(msg.id);
                                                }}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handleView(msg)}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mx-auto transition-transform group-hover:scale-110 shadow-sm ${msg.status === "UNREAD"
                                                        ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                                        : msg.status === "ARCHIVED"
                                                            ? "bg-gradient-to-br from-amber-400 to-amber-500"
                                                            : "bg-gradient-to-br from-slate-300 to-slate-400"
                                                    }`}
                                            >
                                                {msg.status === "UNREAD" ? (
                                                    <Mail size={16} className="text-white" />
                                                ) : msg.status === "ARCHIVED" ? (
                                                    <Archive size={16} className="text-white" />
                                                ) : (
                                                    <MailOpen size={16} className="text-white" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 cursor-pointer" onClick={() => handleView(msg)}>
                                            <div className="flex flex-col">
                                                <span className={`text-sm truncate max-w-[180px] ${msg.status === "UNREAD" ? "font-bold text-slate-900" : "font-bold text-slate-700"}`}>
                                                    {msg.name || "Anonim"}
                                                </span>
                                                <span className="text-xs text-slate-500 truncate max-w-[180px] mt-0.5">
                                                    {msg.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 cursor-pointer" onClick={() => handleView(msg)}>
                                            <div className="flex flex-col">
                                                {msg.topic && (
                                                    <span className={`text-sm truncate max-w-[250px] ${msg.status === "UNREAD" ? "font-bold text-slate-800" : "font-bold text-slate-600"}`}>
                                                        {msg.topic}
                                                    </span>
                                                )}
                                                <span className={`text-sm line-clamp-1 max-w-[300px] ${msg.topic ? 'mt-0.5' : ''} ${msg.status === "UNREAD" ? "text-slate-700" : "text-slate-500"}`}>
                                                    {msg.message}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 cursor-pointer" onClick={() => handleView(msg)}>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${getStatusBadge(msg.status)}`}>
                                                {getStatusLabel(msg.status)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right cursor-pointer" onClick={() => handleView(msg)}>
                                            <div className="flex items-center justify-end gap-1.5 text-sm text-slate-500 font-medium">
                                                <Clock size={14} className="text-slate-400" />
                                                {msg.createdAt
                                                    ? new Date(msg.createdAt).toLocaleDateString("id-ID", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })
                                                    : "-"}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Message Modal */}
            {viewMessage && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <MailOpen className="text-blue-600" />
                                Detail Pesan
                            </h3>
                            <button onClick={() => setViewMessage(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                                    {viewMessage.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <p className="font-bold text-slate-900 text-lg truncate">{viewMessage.name}</p>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border w-fit ${getStatusBadge(viewMessage.status)}`}>
                                            {getStatusLabel(viewMessage.status)}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                                        <p className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {viewMessage.email}</p>
                                        {viewMessage.phone && (
                                            <p className="flex items-center gap-1.5"><User size={14} className="text-slate-400" /> {viewMessage.phone}</p>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                                        <Clock size={12} />
                                        Dikirim pada{" "}
                                        {viewMessage.createdAt
                                            ? new Date(viewMessage.createdAt).toLocaleDateString("id-ID", {
                                                weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                                            })
                                            : "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 px-2">
                                {viewMessage.topic && (
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Topik</h4>
                                        <p className="text-base font-bold text-slate-800 bg-white p-3 rounded-lg border border-slate-200">{viewMessage.topic}</p>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Isi Pesan</h4>
                                    <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{viewMessage.message}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3 justify-end items-center">
                            {viewMessage.status !== "READ" && viewMessage.status !== "ARCHIVED" && (
                                <button
                                    onClick={() => { handleMarkRead(viewMessage.id); setViewMessage({ ...viewMessage, status: "READ" }); }}
                                    className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors shadow-sm"
                                >
                                    <MailOpen size={16} /> Tandai Dibaca
                                </button>
                            )}
                            {viewMessage.status !== "ARCHIVED" && (
                                <button
                                    onClick={() => { handleArchive(viewMessage.id); setViewMessage({ ...viewMessage, status: "ARCHIVED" }); }}
                                    className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors shadow-sm"
                                >
                                    <Archive size={16} /> Arsipkan
                                </button>
                            )}
                            <button
                                onClick={() => setDeleteConfirm(viewMessage.id)}
                                className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors shadow-sm ml-auto"
                            >
                                <Trash2 size={16} /> Hapus Pesan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
                            <Trash2 size={24} className="text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Pesan?</h3>
                        <p className="text-sm text-slate-500 mb-6 px-4">Pesan ini akan dihapus permanen dari sistem.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">Batal</button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-sm shadow-lg shadow-red-600/20">Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Confirm Modal */}
            {bulkDeleteConfirm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
                            <Trash2 size={24} className="text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus {selectedIds.length} Pesan?</h3>
                        <p className="text-sm text-slate-500 mb-6 px-4">Semua pesan yang dipilih akan dihapus permanen.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setBulkDeleteConfirm(false)} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">Batal</button>
                            <button onClick={handleBulkDelete} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-sm shadow-lg shadow-red-600/20">Hapus Semua</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

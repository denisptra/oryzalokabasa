"use client";

import { useState, useEffect } from "react";
import { contactAPI } from "@/lib/api";
import {
    MessageSquare,
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

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminTable from "@/components/admin/AdminTable";
import DeleteModal from "@/components/admin/DeleteModal";

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
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <AdminPageHeader 
                title="Pesan Kontak" 
                subtitle="Kelola pesan dari pengunjung website"
                icon={MessageSquare}
                stats={[
                    { label: "Total", value: messages.length },
                    { label: "Baru", value: unreadCount, color: "text-red-600 bg-red-50" }
                ]}
            />

            {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
                    <CheckCircle size={20} className="text-emerald-600" />
                    <p className="text-sm font-bold text-emerald-700">{success}</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
            )}

            <AdminFilters 
                search={search}
                onSearchChange={setSearch}
                placeholder="Cari pesan berdasarkan nama, email, topik..."
                dropdowns={[
                    {
                        label: "Status",
                        value: filter,
                        onChange: setFilter,
                        options: [
                            { id: "unread", name: "Belum Dibaca" },
                            { id: "read", name: "Dibaca" },
                            { id: "archived", name: "Diarsipkan" }
                        ],
                        icon: Filter,
                        allLabel: "Semua Status"
                    }
                ]}
            />

            {selectedIds.length > 0 && (
                <div className="bg-blue-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-blue-600/20 animate-in zoom-in duration-200 mb-6 font-bold">
                    <p className="text-sm ml-2">
                        {selectedIds.length} pesan dipilih
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleBulkArchive}
                            className="px-5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 backdrop-blur-md border border-white/30"
                        >
                            <Archive size={16} /> Arsipkan
                        </button>
                        <button
                            onClick={() => setBulkDeleteConfirm(true)}
                            className="px-5 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 backdrop-blur-md border border-red-500/30"
                        >
                            <Trash2 size={16} /> Hapus
                        </button>
                    </div>
                </div>
            )}

            <AdminTable 
                columns={[
                    { label: "", className: "w-16" },
                    { label: "Pengirim", className: "min-w-[200px]" },
                    { label: "Pesan", className: "min-w-[250px]" },
                    { label: "Status" },
                    { label: "Waktu", className: "text-right w-40" }
                ]}
                data={filteredMessages}
                loading={loading}
                selectedIds={selectedIds}
                onSelectAll={toggleSelectAll}
                onSelectOne={toggleSelect}
                renderRow={(msg, idx, isSelected) => (
                    <tr 
                        key={msg.id} 
                        className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''} ${msg.status === "UNREAD" ? 'bg-blue-50/20' : ''}`}
                        onClick={() => handleView(msg)}
                    >
                        <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(msg.id)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                        </td>
                        <td className="px-4 py-4">
                            <div className="flex items-center justify-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                                    msg.status === "UNREAD" ? "bg-linear-to-br from-blue-500 to-blue-600" : 
                                    msg.status === "ARCHIVED" ? "bg-linear-to-br from-amber-400 to-amber-500" : 
                                    "bg-linear-to-br from-slate-300 to-slate-400"
                                }`}>
                                    {msg.status === "UNREAD" ? <Mail size={16} className="text-white" /> : 
                                     msg.status === "ARCHIVED" ? <Archive size={16} className="text-white" /> : 
                                     <MailOpen size={16} className="text-white" />}
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-4">
                            <div className="flex flex-col">
                                <span className={`text-sm truncate max-w-[180px] ${msg.status === "UNREAD" ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                                    {msg.name || "Anonim"}
                                </span>
                                <span className="text-xs text-slate-500 truncate max-w-[180px] mt-0.5 font-medium">
                                    {msg.email}
                                </span>
                            </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                            <div className="flex flex-col">
                                {msg.topic && (
                                    <span className={`truncate max-w-[250px] ${msg.status === "UNREAD" ? "font-bold text-slate-800" : "font-semibold text-slate-600"}`}>
                                        {msg.topic}
                                    </span>
                                )}
                                <span className={`line-clamp-1 max-w-[300px] ${msg.topic ? 'mt-0.5' : ''} ${msg.status === "UNREAD" ? "text-slate-700 font-medium" : "text-slate-500"}`}>
                                    {msg.message}
                                </span>
                            </div>
                        </td>
                        <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(msg.status)} shadow-xs`}>
                                {getStatusLabel(msg.status)}
                            </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 font-bold whitespace-nowrap">
                                <Clock size={14} className="text-slate-400" />
                                {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                            </div>
                        </td>
                    </tr>
                )}
            />

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
                                <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
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

            {/* Modals */}
            <DeleteModal 
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm)}
                title="Hapus Pesan?"
                message="Pesan ini akan dihapus secara permanen dari galeri sistem."
            />

            <DeleteModal 
                isOpen={bulkDeleteConfirm}
                onClose={() => setBulkDeleteConfirm(false)}
                onConfirm={handleBulkDelete}
                isBulk={true}
                count={selectedIds.length}
                message="Semua pesan yang dipilih akan dihapus permanen dari sistem."
            />
        </div>
    );
}

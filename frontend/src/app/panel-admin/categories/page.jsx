"use client";

import { useState, useEffect } from "react";
import { categoryAPI } from "@/lib/api";
import {
    FolderOpen,
    Plus,
    Edit3,
    Trash2,
    Search,
    X,
    Loader,
    AlertCircle,
    CheckCircle,
} from "lucide-react";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters and Selection
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [editingCat, setEditingCat] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "" });

    // Feedback
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

    const fetchCategories = async () => {
        // // setLoading(true);
        try {
            const res = await categoryAPI.getAll();
            setCategories(res.data || []);
            setSelectedIds([]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = categories.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
    );

    // Checkbox toggles
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredCategories.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredCategories.map(c => c.id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const openCreate = () => {
        setEditingCat(null);
        setFormData({ name: "", description: "" });
        setError("");
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditingCat(cat);
        setFormData({ name: cat.name || "", description: cat.description || "" });
        setError("");
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // setSaving(true);
        setError("");
        try {
            if (editingCat) {
                await categoryAPI.update(editingCat.id, formData);
                setSuccess("Kategori berhasil diperbarui!");
            } else {
                await categoryAPI.create(formData);
                setSuccess("Kategori berhasil dibuat!");
            }
            setShowModal(false);
            fetchCategories();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await categoryAPI.delete(id);
            setSuccess("Kategori berhasil dihapus!");
            setDeleteConfirm(null);
            fetchCategories();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        try {
            // Note: Replace this with actual bulk delete API call if available
            await Promise.all(selectedIds.map(id => categoryAPI.delete(id)));
            setSuccess(`${selectedIds.length} Kategori berhasil dihapus!`);
            setBulkDeleteConfirm(false);
            setSelectedIds([]);
            fetchCategories();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Gagal menghapus beberapa kategori: " + err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FolderOpen size={28} className="text-blue-600" />
                        Kelola Kategori
                    </h1>
                    <p className="text-slate-500 mt-1">Atur kategori untuk artikel dan galeri</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold flex items-center gap-2">
                        <span>Total:</span>
                        <span className="bg-white px-2 py-0.5 rounded-lg border border-blue-100">{categories.length}</span>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Plus size={18} />
                        Tambah Kategori
                    </button>
                </div>
            </div>

            {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top">
                    <CheckCircle size={20} className="text-emerald-600" />
                    <p className="text-sm text-emerald-700">{success}</p>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari kategori berdasarkan nama atau deskripsi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm"
                    />
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-medium text-blue-800 ml-2">
                        {selectedIds.length} kategori dipilih
                    </p>
                    <button
                        onClick={() => setBulkDeleteConfirm(true)}
                        className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        Hapus Terpilih
                    </button>
                </div>
            )}

            {/* Categories Table List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-16">
                        <FolderOpen size={48} className="text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Belum ada kategori ditemukan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-4 py-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredCategories.length && filteredCategories.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deskripsi</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dibuat Pada</th>
                                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCategories.map((cat) => (
                                    <tr
                                        key={cat.id}
                                        className={`hover:bg-slate-50/80 transition-colors ${selectedIds.includes(cat.id) ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(cat.id)}
                                                onChange={() => toggleSelect(cat.id)}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                                                    <FolderOpen size={18} className="text-blue-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-sm font-bold text-slate-800">{cat.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600 max-w-[300px]">
                                            <div className="truncate">
                                                {cat.description || <span className="italic text-slate-400">Tanpa deskripsi</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-500">
                                            {cat.createdAt
                                                ? new Date(cat.createdAt).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(cat)}
                                                    className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(cat.id)}
                                                    className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">{editingCat ? "Edit Kategori" : "Tambah Kategori Baru"}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                                    <AlertCircle size={16} className="text-red-500" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Kategori</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all"
                                    placeholder="Nama kategori"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm resize-y transition-all"
                                    placeholder="Deskripsi singkat kategori"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">Batal</button>
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                                    {saving ? <Loader size={16} className="animate-spin" /> : <FolderOpen size={16} />}
                                    {editingCat ? "Simpan Perubahan" : "Simpan Kategori"}
                                </button>
                            </div>
                        </form>
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
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Kategori?</h3>
                        <p className="text-sm text-slate-500 mb-6 px-4">Kategori ini dan semua relasinya akan dihapus secara permanen.</p>
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
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus {selectedIds.length} Kategori?</h3>
                        <p className="text-sm text-slate-500 mb-6 px-4">Tindakan ini tidak dapat dibatalkan. Semua kategori yang dipilih akan dihapus.</p>
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

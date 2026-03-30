"use client";

import { useState, useEffect } from "react";
import { categoryAPI } from "@/lib/api";
import {
    FolderOpen,
    Plus,
    Edit3,
    Trash2,
    X,
    Loader,
    AlertCircle,
    CheckCircle,
} from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminTable from "@/components/admin/AdminTable";
import DeleteModal from "@/components/admin/DeleteModal";

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
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <AdminPageHeader 
                title="Kelola Kategori" 
                subtitle="Atur kategori untuk artikel dan galeri"
                icon={FolderOpen}
                stats={[{ label: "Total", value: categories.length }]}
                actions={[
                    { label: "Tambah Kategori", icon: Plus, onClick: openCreate }
                ]}
            />

            {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
                    <CheckCircle size={20} className="text-emerald-600" />
                    <p className="text-sm font-bold text-emerald-700">{success}</p>
                </div>
            )}

            <AdminFilters 
                search={search}
                onSearchChange={setSearch}
                placeholder="Cari kategori berdasarkan nama atau deskripsi..."
            />

            {selectedIds.length > 0 && (
                <div className="bg-blue-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-blue-600/20 animate-in zoom-in duration-200 mb-6 font-bold">
                    <p className="text-sm ml-2">
                        {selectedIds.length} kategori dipilih
                    </p>
                    <button
                        onClick={() => setBulkDeleteConfirm(true)}
                        className="px-5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 backdrop-blur-md border border-white/30"
                    >
                        <Trash2 size={16} />
                        Hapus Terpilih
                    </button>
                </div>
            )}

            <AdminTable 
                columns={[
                    { label: "Kategori" },
                    { label: "Deskripsi", className: "max-w-[300px]" },
                    { label: "Dibuat Pada", className: "w-40" },
                    { label: "Aksi", className: "text-right w-24" }
                ]}
                data={filteredCategories}
                loading={loading}
                selectedIds={selectedIds}
                onSelectAll={toggleSelectAll}
                onSelectOne={toggleSelect}
                renderRow={(cat, idx, isSelected) => (
                    <tr key={cat.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-4 text-center">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(cat.id)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                        </td>
                        <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                                    <FolderOpen size={18} className="text-blue-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-800">{cat.name}</span>
                            </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 font-medium">
                            {cat.description || <span className="italic text-slate-400 font-normal">Tanpa deskripsi</span>}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                            {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                        </td>
                        <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEdit(cat)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => setDeleteConfirm(cat.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
            />

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

            {/* Modals */}
            <DeleteModal 
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm)}
                title="Hapus Kategori?"
                message="Kategori ini dan semua relasinya akan dihapus secara permanen dari sistem."
            />

            <DeleteModal 
                isOpen={bulkDeleteConfirm}
                onClose={() => setBulkDeleteConfirm(false)}
                onConfirm={handleBulkDelete}
                isBulk={true}
                count={selectedIds.length}
                message="Semua kategori yang dipilih akan dihapus permanen dari sistem."
            />
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { galleryAPI, categoryAPI, getImageUrl } from "@/lib/api";
import {
    ImageIcon,
    Plus,
    Edit3,
    Trash2,
    X,
    Loader,
    AlertCircle,
    CheckCircle,
    Upload,
    Calendar,
    Filter,
} from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminTable from "@/components/admin/AdminTable";
import DeleteModal from "@/components/admin/DeleteModal";

export default function GalleryDashboardPage() {
    const { user } = useAuth();
    const [gallery, setGallery] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters and Selection
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [selectedIds, setSelectedIds] = useState([]);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [previewItem, setPreviewItem] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        categoryId: "",
        eventDate: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    // Feedback
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

    const fetchData = async () => {
        // // setLoading(true);
        try {
            const [galRes, catRes] = await Promise.all([
                galleryAPI.getAll(),
                categoryAPI.getAll(),
            ]);
            setGallery(galRes.data || []);
            setCategories(catRes.data || []);
            setSelectedIds([]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredGallery = gallery.filter((item) => {
        const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "all" || item.categoryId === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Checkbox toggles
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredGallery.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredGallery.map(item => item.id));
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
        setEditingItem(null);
        setFormData({ title: "", categoryId: "", eventDate: "" });
        setImageFile(null);
        setImagePreview("");
        setError("");
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title || "",
            categoryId: item.categoryId || "",
            eventDate: item.eventDate
                ? new Date(item.eventDate).toISOString().split("T")[0]
                : "",
        });
        setImageFile(null);
        setImagePreview(item.image ? getImageUrl(item.image) : "");
        setError("");
        setShowModal(true);
    };

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            setError(`Ukuran file terlalu besar (${sizeMB}MB). Maksimal 10MB per file. Silakan kompres gambar terlebih dahulu.`);
            e.target.value = "";
            return;
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
        if (!allowedTypes.includes(file.type)) {
            setError("Format file tidak didukung. Gunakan JPEG, PNG, GIF, WebP, atau SVG.");
            e.target.value = "";
            return;
        }

        setError("");
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile && !editingItem) {
            setError("Pilih gambar untuk diupload");
            return;
        }

        // Double-check file size before submitting
        if (imageFile && imageFile.size > MAX_FILE_SIZE) {
            const sizeMB = (imageFile.size / (1024 * 1024)).toFixed(1);
            setError(`Ukuran file terlalu besar (${sizeMB}MB). Maksimal 10MB per file.`);
            return;
        }

        setSaving(true);
        setError("");
        try {
            const data = { ...formData };
            if (imageFile) data.imageFile = imageFile;

            if (editingItem) {
                await galleryAPI.update(editingItem.id, data);
                setSuccess("Foto berhasil diperbarui!");
            } else {
                await galleryAPI.upload(data);
                setSuccess("Foto berhasil diupload!");
            }
            setShowModal(false);
            fetchData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            // Parse and display more helpful error messages
            let errorMsg = err.message;
            if (errorMsg.includes("LIMIT_FILE_SIZE") || errorMsg.includes("terlalu besar")) {
                errorMsg = "Ukuran file terlalu besar. Maksimal 10MB per file. Silakan kompres gambar terlebih dahulu.";
            } else if (errorMsg.includes("Format file") || errorMsg.includes("file type")) {
                errorMsg = "Format file tidak didukung. Gunakan JPEG, PNG, GIF, WebP, atau SVG.";
            } else if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
                errorMsg = "Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.";
            }
            setError(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await galleryAPI.delete(id);
            setSuccess("Foto berhasil dihapus!");
            setDeleteConfirm(null);
            fetchData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        try {
            // Note: Replace this with actual bulk delete API call if available
            await Promise.all(selectedIds.map(id => galleryAPI.delete(id)));
            setSuccess(`${selectedIds.length} Foto berhasil dihapus!`);
            setBulkDeleteConfirm(false);
            setSelectedIds([]);
            fetchData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Gagal menghapus beberapa foto: " + err.message);
        }
    };

    const getCategoryName = (catId) => {
        const cat = categories.find((c) => c.id === catId);
        return cat?.name || "-";
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <AdminPageHeader 
                title="Kelola Galeri" 
                subtitle="Upload dan kelola foto kegiatan/album"
                icon={ImageIcon}
                stats={[{ label: "Total", value: gallery.length }]}
                actions={[
                    { label: "Upload Foto", icon: Upload, onClick: openCreate }
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
                placeholder="Cari foto berdasarkan judul..."
                dropdowns={[
                    { 
                        label: "Kategori", 
                        value: categoryFilter, 
                        onChange: setCategoryFilter, 
                        options: categories,
                        icon: Filter,
                        allLabel: "Semua Kategori"
                    }
                ]}
            />

            {selectedIds.length > 0 && (
                <div className="bg-blue-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-blue-600/20 animate-in zoom-in duration-200 mb-6 font-bold">
                    <p className="text-sm ml-2">
                        {selectedIds.length} foto dipilih
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
                    { label: "Preview", className: "w-24 text-center" },
                    { label: "Info Foto" },
                    { label: "Kategori" },
                    { label: "Tanggal Event", className: "w-40" },
                    { label: "Aksi", className: "text-right w-24" }
                ]}
                data={filteredGallery}
                loading={loading}
                selectedIds={selectedIds}
                onSelectAll={toggleSelectAll}
                onSelectOne={toggleSelect}
                renderRow={(item, idx, isSelected) => (
                    <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-4 text-center">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(item.id)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                        </td>
                        <td className="px-4 py-4">
                            <div 
                                className="w-16 h-16 mx-auto rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer relative group/img shadow-sm"
                                onClick={() => setPreviewItem(item)}
                            >
                                {item.image ? (
                                    <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" onError={(e) => { e.target.onerror = null; e.target.src = "/Logo-1.png"; }} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ImageIcon size={20} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <Search size={16} className="text-white" />
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-4">
                            <div className="font-bold text-slate-800 mb-1 max-w-[250px] truncate" title={item.title}>
                                {item.title || "Untitled Photograph"}
                            </div>
                        </td>
                        <td className="px-4 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200 shadow-xs">
                                {getCategoryName(item.categoryId)}
                            </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                            {item.eventDate ? (
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-slate-400" />
                                    {new Date(item.eventDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                </div>
                            ) : "-"}
                        </td>
                        <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEdit(item)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => setDeleteConfirm(item.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
            />

            {/* Preview Modal */}
            {previewItem && (
                <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setPreviewItem(null)}>
                    <button className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors"><X size={32} /></button>
                    <div onClick={(e) => e.stopPropagation()} className="max-w-5xl w-full flex flex-col items-center animate-in zoom-in duration-300">
                        <img src={getImageUrl(previewItem.image)} alt={previewItem.title} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10" />
                        <div className="mt-6 bg-white/10 backdrop-blur-xl px-8 py-4 rounded-2xl border border-white/20 text-center shadow-xl">
                            <h3 className="text-white font-bold text-xl mb-2">{previewItem.title}</h3>
                            <div className="flex items-center justify-center gap-6 text-slate-300 text-sm font-medium">
                                <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                                    <Filter size={14} className="text-blue-400" />
                                    {getCategoryName(previewItem.categoryId)}
                                </span>
                                {previewItem.eventDate && (
                                    <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                                        <Calendar size={14} className="text-red-400" />
                                        {new Date(previewItem.eventDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingItem ? "Edit Foto" : "Upload Foto Baru"}
                            </h3>
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

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    Gambar {!editingItem && <span className="text-red-500">*</span>}
                                </label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img src={imagePreview} alt="Preview" className="max-h-48 max-w-full mx-auto rounded-lg object-contain shadow-sm border border-slate-200" />
                                            <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); }} className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-6">
                                            <Upload size={32} className="text-blue-300 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-slate-500">Klik atau drag file ke sini</p>
                                            <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF, WebP atau SVG (Maks. 10MB)</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-slate-500 mt-3 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-colors cursor-pointer" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Judul Foto</label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all" placeholder="Nama kegiatan / deskripsi foto" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Kategori</label>
                                    <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm appearance-none transition-all">
                                        <option value="">Pilih Kategori</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Tanggal Event</label>
                                    <input type="date" value={formData.eventDate} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all" />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">Batal</button>
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                                    {saving ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                                    {editingItem ? "Simpan Perubahan" : "Upload Foto"}
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
                title="Hapus Foto?"
                message="Foto ini akan dihapus secara permanen dari galeri sistem."
            />

            <DeleteModal 
                isOpen={bulkDeleteConfirm}
                onClose={() => setBulkDeleteConfirm(false)}
                onConfirm={handleBulkDelete}
                isBulk={true}
                count={selectedIds.length}
                message="Semua foto yang dipilih akan dihapus permanen dari sistem."
            />
        </div>
    );
}

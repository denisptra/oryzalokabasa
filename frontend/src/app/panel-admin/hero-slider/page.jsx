"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { heroSliderAPI, getImageUrl } from "@/lib/api";
import {
    Layers,
    Plus,
    Edit3,
    Trash2,
    X,
    Loader,
    AlertCircle,
    CheckCircle,
    Upload,
    ImageIcon,
    Eye,
    EyeOff,
    Image as ImageIcon2
} from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminTable from "@/components/admin/AdminTable";
import DeleteModal from "@/components/admin/DeleteModal";

export default function HeroSliderDashboardPage() {
    const { user } = useAuth();
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters and Selection
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [editingSlider, setEditingSlider] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        link: "",
        isActive: true,
        order: 0,
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
            const res = await heroSliderAPI.getAll();
            setSliders(res.data || []);
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

    const filteredSliders = sliders.filter((s) =>
        s.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.subtitle?.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => a.order - b.order);

    // Checkbox toggles
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredSliders.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredSliders.map(s => s.id));
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
        setEditingSlider(null);
        setFormData({
            title: "",
            subtitle: "",
            link: "",
            isActive: true,
            order: sliders.length,
        });
        setImageFile(null);
        setImagePreview("");
        setError("");
        setShowModal(true);
    };

    const openEdit = (slider) => {
        setEditingSlider(slider);
        setFormData({
            title: slider.title || "",
            subtitle: slider.subtitle || "",
            link: slider.link || "",
            isActive: slider.isActive,
            order: slider.order || 0,
        });
        setImageFile(null);
        setImagePreview(slider.image ? getImageUrl(slider.image) : "");
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
        if (!imageFile && !editingSlider) {
            setError("Pilih gambar untuk slider");
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

            if (editingSlider) {
                await heroSliderAPI.update(editingSlider.id, data);
                setSuccess("Slider berhasil diperbarui!");
            } else {
                await heroSliderAPI.create(data);
                setSuccess("Slider berhasil dibuat!");
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

    const handleToggle = async (id) => {
        try {
            await heroSliderAPI.toggle(id);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await heroSliderAPI.delete(id);
            setSuccess("Slider berhasil dihapus!");
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
            await Promise.all(selectedIds.map(id => heroSliderAPI.delete(id)));
            setSuccess(`${selectedIds.length} Slider berhasil dihapus!`);
            setBulkDeleteConfirm(false);
            setSelectedIds([]);
            fetchData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Gagal menghapus beberapa slider: " + err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <AdminPageHeader 
                title="Hero Slider" 
                subtitle="Kelola banner utama halaman depan"
                icon={Layers}
                stats={[{ label: "Total", value: sliders.length }]}
                actions={[
                    { label: "Tambah Slider", icon: Plus, onClick: openCreate }
                ]}
            />

            {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
                    <CheckCircle size={20} className="text-emerald-600" />
                    <p className="text-sm font-bold text-emerald-700">{success}</p>
                </div>
            )}

            {error && !showModal && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
            )}

            <AdminFilters 
                search={search}
                onSearchChange={setSearch}
                placeholder="Cari slider berdasarkan judul atau subtitle..."
            />

            {selectedIds.length > 0 && (
                <div className="bg-blue-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-blue-600/20 animate-in zoom-in duration-200 mb-6 font-bold">
                    <p className="text-sm ml-2">
                        {selectedIds.length} slider dipilih
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
                    { label: "Urutan", className: "w-16 text-center" },
                    { label: "Gambar", className: "w-32" },
                    { label: "Info Slider" },
                    { label: "Status", className: "text-center w-32" },
                    { label: "Aksi", className: "text-right w-24" }
                ]}
                data={filteredSliders}
                loading={loading}
                selectedIds={selectedIds}
                onSelectAll={toggleSelectAll}
                onSelectOne={toggleSelect}
                renderRow={(slider, idx, isSelected) => (
                    <tr key={slider.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-4 text-center">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(slider.id)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                        </td>
                        <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm">
                                {slider.order}
                            </span>
                        </td>
                        <td className="px-4 py-4">
                            <div className="w-24 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative group/image shadow-sm">
                                {slider.image ? (
                                    <img src={getImageUrl(slider.image)} alt={slider.title} className="w-full h-full object-cover transition-transform group-hover/image:scale-110" onError={(e) => { e.target.onerror = null; e.target.src = "/Logo-1.png"; }} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ImageIcon2 size={24} />
                                    </div>
                                )}
                            </div>
                        </td>
                        <td className="px-4 py-4">
                            <div className="font-bold text-slate-800 mb-0.5 max-w-[250px] truncate" title={slider.title}>
                                {slider.title || "Untitled Slider"}
                            </div>
                            <div className="text-xs text-slate-500 font-medium max-w-[250px] truncate" title={slider.subtitle}>
                                {slider.subtitle || <span className="italic font-normal">Tidak ada subtitle</span>}
                            </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                            <button
                                onClick={() => handleToggle(slider.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${slider.isActive
                                    ? "text-emerald-700 bg-emerald-50 border-emerald-200 shadow-xs"
                                    : "text-slate-500 bg-slate-50 border-slate-200"
                                }`}
                            >
                                {slider.isActive ? <><Eye size={12} /> Aktif</> : <><EyeOff size={12} /> Matt</>}
                            </button>
                        </td>
                        <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEdit(slider)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => setDeleteConfirm(slider.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
            />

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingSlider ? "Edit Slider" : "Tambah Slider Baru"}
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
                                    Gambar Slider {!editingSlider && <span className="text-red-500">*</span>}
                                </label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img src={imagePreview} alt="Preview" className="max-h-40 max-w-full rounded-lg object-contain shadow-sm border border-slate-200" />
                                            <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); }} className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-6">
                                            <Upload size={32} className="text-blue-300 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-slate-500">Upload gambar slider</p>
                                            <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF, WebP atau SVG (Maks. 10MB)</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-slate-500 mt-3 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-colors cursor-pointer" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Judul</label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all" placeholder="Judul slider" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Subtitle <span className="text-slate-400 font-normal">(opsional)</span></label>
                                <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all" placeholder="Deskripsi singkat" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Link <span className="text-slate-400 font-normal">(opsional)</span></label>
                                    <input type="text" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all" placeholder="/about" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Urutan</label>
                                    <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} min="0" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all text-center" />
                                </div>
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl mt-2">
                                <div>
                                    <span className="text-sm font-bold text-slate-700 block">Status Slider</span>
                                    <span className="text-xs text-slate-500">Tampilkan slider ini di halaman depan</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${formData.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                                >
                                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isActive ? "left-6.5 translate-x-0" : "left-0.5"}`} style={{ left: formData.isActive ? "26px" : "2px" }} />
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">Batal</button>
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                                    {saving ? <Loader size={16} className="animate-spin" /> : <Layers size={16} />}
                                    {editingSlider ? "Simpan Perubahan" : "Buat Slider"}
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
                title="Hapus Slider?"
                message="Slider ini beserta gambarnya akan dihapus secara permanen dari sistem."
            />

            <DeleteModal 
                isOpen={bulkDeleteConfirm}
                onClose={() => setBulkDeleteConfirm(false)}
                onConfirm={handleBulkDelete}
                isBulk={true}
                count={selectedIds.length}
                message="Semua slider yang dipilih beserta gambarnya akan dihapus permanen dari sistem."
            />
        </div>
    );
}

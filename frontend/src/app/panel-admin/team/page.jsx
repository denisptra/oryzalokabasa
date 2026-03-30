"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { teamAPI, getImageUrl } from "@/lib/api";
import {
    Users,
    Plus,
    Edit3,
    Trash2,
    X,
    Loader,
    AlertCircle,
    CheckCircle,
    Upload
} from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import DeleteModal from "@/components/admin/DeleteModal";

export default function TeamDashboardPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        isActive: true,
        order: 0,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchMembers = async () => {
        // // setLoading(true);
        try {
            const res = await teamAPI.getAll();
            setMembers(res.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const openCreate = () => {
        setEditingMember(null);
        setFormData({ name: "", role: "", isActive: true, order: members.length + 1 });
        setImageFile(null);
        setImagePreview("");
        setError("");
        setShowModal(true);
    };

    const openEdit = (member) => {
        setEditingMember(member);
        setFormData({
            name: member.name || "",
            role: member.role || "",
            isActive: member.isActive,
            order: member.order || 0,
        });
        setImageFile(null);
        setImagePreview(member.image ? getImageUrl(member.image) : "");
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

            if (editingMember) {
                await teamAPI.update(editingMember.id, data);
                setSuccess("Anggota tim berhasil diperbarui!");
            } else {
                await teamAPI.create(data);
                setSuccess("Anggota tim berhasil ditambahkan!");
            }
            setShowModal(false);
            fetchMembers();
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
            await teamAPI.delete(id);
            setSuccess("Anggota tim berhasil dihapus!");
            setDeleteConfirm(null);
            fetchMembers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleToggle = async (id) => {
        try {
            await teamAPI.toggle(id);
            fetchMembers();
        } catch (err) {
            setError("Gagal mengubah status: " + err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <AdminPageHeader 
                title="Kelola Tim" 
                subtitle="Tambah atau edit Anggota Tim yang tampil di halaman Tentang Kami"
                icon={Users}
                stats={[{ label: "Total Anggota", value: members.length }]}
                actions={[
                    { label: "Tambah Anggota", icon: Plus, onClick: openCreate }
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

            <AdminTable 
                columns={[
                    { label: "Urutan", className: "w-16 text-center" },
                    { label: "Foto", className: "w-24" },
                    { label: "Info Anggota" },
                    { label: "Status", className: "text-center w-32" },
                    { label: "Aksi", className: "text-right w-24" }
                ]}
                data={members}
                loading={loading}
                renderRow={(member) => (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm">
                                {member.order}
                            </span>
                        </td>
                        <td className="px-4 py-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 bg-slate-50 shadow-sm relative group/photo">
                                {member.image ? (
                                    <img 
                                        src={getImageUrl(member.image)} 
                                        alt={member.name} 
                                        className="w-full h-full object-cover transition-transform group-hover/photo:scale-110" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = "/Logo-1.png"; }} 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Users size={24} />
                                    </div>
                                )}
                            </div>
                        </td>
                        <td className="px-4 py-4">
                            <div className="font-bold text-slate-800">{member.name}</div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5">{member.role}</div>
                        </td>
                        <td className="px-4 py-4 text-center">
                            <button
                                onClick={() => handleToggle(member.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${member.isActive
                                    ? "text-emerald-700 bg-emerald-50 border-emerald-200 shadow-xs"
                                    : "text-slate-500 bg-slate-50 border-slate-200"
                                }`}
                            >
                                {member.isActive ? "Aktif" : "Nonaktif"}
                            </button>
                        </td>
                        <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEdit(member)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => setDeleteConfirm(member.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
            />

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingMember ? "Edit Anggota" : "Tambah Anggota Tim"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
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
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Anggota *</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Jabatan / Role *</label>
                                <input type="text" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Foto Profil</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <Upload size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer" />
                                        <p className="text-xs text-slate-400 mt-1">Gunakan foto rasio 1:1, maks 10MB</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Urutan (Opsional)</label>
                                    <input type="number" min="0" value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                                    <select value={formData.isActive ? "true" : "false"} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                                        <option value="true">Aktif</option>
                                        <option value="false">Nonaktif</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold hover:bg-slate-50">Batal</button>
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                                    {saving && <Loader size={14} className="animate-spin" />}
                                    Simpan Anggota
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
                title="Hapus Anggota Tim?"
                message="Anggota ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
            />
        </div>
    );
}

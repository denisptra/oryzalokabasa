"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { userAPI } from "@/lib/api";
import {
    Users,
    Plus,
    Edit3,
    Trash2,
    X,
    Loader,
    Shield,
    User,
    AlertCircle,
    CheckCircle,
    Filter
} from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminTable from "@/components/admin/AdminTable";
import DeleteModal from "@/components/admin/DeleteModal";

export default function UsersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters and Selection
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [selectedIds, setSelectedIds] = useState([]);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "ADMIN" });
    const [saving, setSaving] = useState(false);

    // Feedback
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

    // Check if super admin
    useEffect(() => {
        if (user && user.role !== "SUPER_ADMIN") {
            router.push("/dashboard");
        }
    }, [user, router]);

    // Fetch users
    const fetchUsers = async () => {
        // // setLoading(true);
        try {
            const res = await userAPI.getAll();
            setUsers(res.data || []);
            setSelectedIds([]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "SUPER_ADMIN") {
            fetchUsers();
        }
    }, [user]);

    // Filter users
    const filteredUsers = users.filter((u) => {
        const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Checkbox toggles
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredUsers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredUsers.map(u => u.id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Open create modal
    const openCreate = () => {
        setEditingUser(null);
        setFormData({ name: "", email: "", password: "", role: "ADMIN" });
        setError("");
        setShowModal(true);
    };

    // Open edit modal
    const openEdit = (u) => {
        setEditingUser(u);
        setFormData({ name: u.name, email: u.email, password: "", role: u.role });
        setError("");
        setShowModal(true);
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        // setSaving(true);
        setError("");
        try {
            if (editingUser) {
                const updateData = { name: formData.name, email: formData.email, role: formData.role };
                if (formData.password) updateData.password = formData.password;
                await userAPI.update(editingUser.id, updateData);
                setSuccess("User berhasil diperbarui!");
            } else {
                await userAPI.create(formData);
                setSuccess("User berhasil dibuat!");
            }
            setShowModal(false);
            fetchUsers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Handle delete single
    const handleDelete = async (id) => {
        try {
            await userAPI.delete(id);
            setSuccess("User berhasil dihapus!");
            setDeleteConfirm(null);
            fetchUsers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        try {
            // Note: Replace this with actual bulk delete API call if available
            await Promise.all(selectedIds.map(id => userAPI.delete(id)));
            setSuccess(`${selectedIds.length} User berhasil dihapus!`);
            setBulkDeleteConfirm(false);
            setSelectedIds([]);
            fetchUsers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Gagal menghapus beberapa user: " + err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <AdminPageHeader 
                title="Kelola Pengguna" 
                subtitle="Manajemen akun pengguna sistem dan hak akses"
                icon={Users}
                stats={[{ label: "Total", value: users.length }]}
                actions={[
                    { label: "Tambah User", icon: Plus, onClick: openCreate }
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
                placeholder="Cari pengguna berdasarkan nama atau email..."
                dropdowns={[
                    { 
                        label: "Role", 
                        value: roleFilter, 
                        onChange: setRoleFilter, 
                        options: [
                            { value: "ADMIN", label: "Admin" },
                            { value: "SUPER_ADMIN", label: "Super Admin" }
                        ],
                        icon: Filter
                    }
                ]}
            />

            {selectedIds.length > 0 && (
                <div className="bg-blue-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-blue-600/20 animate-in zoom-in duration-200 mb-6 font-bold">
                    <p className="text-sm ml-2">
                        {selectedIds.length} pengguna dipilih
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
                    { label: "No", className: "w-12 text-center" },
                    { label: "Pengguna" },
                    { label: "Email" },
                    { label: "Role" },
                    { label: "Dibuat", className: "w-32" },
                    { label: "Aksi", className: "text-right w-24" }
                ]}
                data={filteredUsers}
                loading={loading}
                selectedIds={selectedIds}
                onSelectAll={toggleSelectAll}
                onSelectOne={toggleSelect}
                renderRow={(u, idx, isSelected) => (
                    <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-4 text-center">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(u.id)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                        </td>
                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-200 shadow-sm">
                                    {u.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <span className="text-sm font-bold text-slate-800">{u.name}</span>
                            </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 font-medium">
                            {u.email}
                        </td>
                        <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                u.role === "SUPER_ADMIN" 
                                ? "bg-slate-900 text-white border-slate-900" 
                                : "bg-white text-slate-600 border-slate-200"
                            } shadow-sm uppercase tracking-wider`}>
                                {u.role === "SUPER_ADMIN" ? <Shield size={12} /> : <User size={12} />}
                                {u.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                            </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                        </td>
                        <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEdit(u)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => setDeleteConfirm(u.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
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
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
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
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all"
                                    placeholder="Nama pengguna"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all"
                                    placeholder="email@contoh.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    Password {editingUser && <span className="text-slate-400 font-normal ml-1">(kosongkan jika tidak diubah)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Hak Akses</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all"
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                                >
                                    {saving ? <Loader size={16} className="animate-spin" /> : <Shield size={16} />}
                                    {editingUser ? "Simpan Perubahan" : "Simpan User"}
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
                title="Hapus Pengguna?"
                message="Tindakan ini tidak dapat dibatalkan. Pengguna akan dihapus permanen dari sistem."
            />

            <DeleteModal 
                isOpen={bulkDeleteConfirm}
                onClose={() => setBulkDeleteConfirm(false)}
                onConfirm={handleBulkDelete}
                isBulk={true}
                count={selectedIds.length}
                message="Semua pengguna yang dipilih akan dihapus permanen dari sistem."
            />
        </div>
    );
}

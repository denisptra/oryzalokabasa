"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { settingsAPI } from "@/lib/api";
import {
    Settings,
    Plus,
    Edit3,
    Trash2,
    X,
    Loader,
    AlertCircle,
    CheckCircle,
    AlertTriangle,
    Key,
    Save,
    Search,
} from "lucide-react";

export default function SettingsPage() {
    const { user } = useAuth();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters and Selection
    const [search, setSearch] = useState("");
    const [selectedKeys, setSelectedKeys] = useState([]);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [editingSetting, setEditingSetting] = useState(null);
    const [formData, setFormData] = useState({ key: "", value: "" });

    // Feedback
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [resetConfirm, setResetConfirm] = useState(false);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

    const fetchData = async () => {
        // // setLoading(true);
        try {
            const res = await settingsAPI.getAll();
            setSettings(res.data || []);
            setSelectedKeys([]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredSettings = settings.filter((s) =>
        s.key?.toLowerCase().includes(search.toLowerCase()) ||
        s.value?.toLowerCase().includes(search.toLowerCase())
    );

    // Checkbox toggles
    const toggleSelectAll = () => {
        if (selectedKeys.length === filteredSettings.length) {
            setSelectedKeys([]);
        } else {
            setSelectedKeys(filteredSettings.map(s => s.key));
        }
    };

    const toggleSelect = (key) => {
        if (selectedKeys.includes(key)) {
            setSelectedKeys(selectedKeys.filter(itemKey => itemKey !== key));
        } else {
            setSelectedKeys([...selectedKeys, key]);
        }
    };

    const openCreate = () => {
        setEditingSetting(null);
        setFormData({ key: "", value: "" });
        setError("");
        setShowModal(true);
    };

    const openEdit = (setting) => {
        setEditingSetting(setting);
        setFormData({ key: setting.key, value: setting.value });
        setError("");
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // setSaving(true);
        setError("");
        try {
            await settingsAPI.save(formData);
            setSuccess(editingSetting ? "Pengaturan diperbarui!" : "Pengaturan disimpan!");
            setShowModal(false);
            fetchData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (key) => {
        try {
            await settingsAPI.delete(key);
            setSuccess("Pengaturan dihapus!");
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
            await Promise.all(selectedKeys.map(key => settingsAPI.delete(key)));
            setSuccess(`${selectedKeys.length} Pengaturan berhasil dihapus!`);
            setBulkDeleteConfirm(false);
            setSelectedKeys([]);
            fetchData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Gagal menghapus beberapa pengaturan: " + err.message);
        }
    };

    const handleReset = async () => {
        try {
            await settingsAPI.reset();
            setSuccess("Semua pengaturan direset!");
            setResetConfirm(false);
            fetchData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Settings size={28} className="text-blue-600" />
                        Pengaturan
                    </h1>
                    <p className="text-slate-500 mt-1">Konfigurasi global website</p>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold flex items-center gap-2 mr-2">
                        <span>Total:</span>
                        <span className="bg-white px-2 py-0.5 rounded-lg border border-blue-100">{settings.length}</span>
                    </div>
                    {settings.length > 0 && (
                        <button
                            onClick={() => setResetConfirm(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 bg-white rounded-xl font-bold hover:bg-red-50 transition-colors text-sm shadow-sm"
                        >
                            <AlertTriangle size={16} />
                            Reset
                        </button>
                    )}
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-sm"
                    >
                        <Plus size={18} />
                        Tambah
                    </button>
                </div>
            </div>

            {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top">
                    <CheckCircle size={20} className="text-emerald-600" />
                    <p className="text-sm text-emerald-700">{success}</p>
                </div>
            )}

            {error && !showModal && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari pengaturan berdasarkan key atau value..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm"
                    />
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedKeys.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-medium text-blue-800 ml-2">
                        {selectedKeys.length} pengaturan dipilih
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

            {/* Settings Table List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : filteredSettings.length === 0 ? (
                    <div className="text-center py-16">
                        <Settings size={48} className="text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Belum ada pengaturan ditemukan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-4 py-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedKeys.length === filteredSettings.length && filteredSettings.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Key</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSettings.map((setting) => (
                                    <tr
                                        key={setting.id || setting.key}
                                        className={`hover:bg-slate-50/80 transition-colors ${selectedKeys.includes(setting.key) ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedKeys.includes(setting.key)}
                                                onChange={() => toggleSelect(setting.key)}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0 hidden sm:flex">
                                                    <Key size={14} className="text-blue-600" />
                                                </div>
                                                <span className="text-sm font-mono font-bold text-slate-800 break-all">{setting.key}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600 max-w-[300px]">
                                            <div className="truncate" title={setting.value}>
                                                {setting.value || <span className="italic text-slate-400">Kosong</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(setting)}
                                                    className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(setting.key)}
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

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingSetting ? "Edit Pengaturan" : "Tambah Pengaturan"}
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
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Key</label>
                                <input
                                    type="text"
                                    value={formData.key}
                                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                    required
                                    disabled={!!editingSetting}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm font-mono transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    placeholder="contoh: site_title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Value</label>
                                <textarea
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm resize-y transition-all"
                                    placeholder="Nilai pengaturan"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">Batal</button>
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                                    {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                                    {editingSetting ? "Simpan Perubahan" : "Simpan Pengaturan"}
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
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Pengaturan?</h3>
                        <p className="text-sm font-mono font-bold text-slate-700 bg-slate-50 py-2 border border-slate-100 rounded-lg mb-4">{deleteConfirm}</p>
                        <p className="text-sm text-slate-500 mb-6 px-4">Pengaturan ini akan dihapus secara permanen dari sistem.</p>
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
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus {selectedKeys.length} Pengaturan?</h3>
                        <p className="text-sm text-slate-500 mb-6 px-4">Tindakan ini tidak dapat dibatalkan. Semua pengaturan yang dipilih akan dihapus.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setBulkDeleteConfirm(false)} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">Batal</button>
                            <button onClick={handleBulkDelete} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-sm shadow-lg shadow-red-600/20">Hapus Semua</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Confirm Modal */}
            {resetConfirm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4 border-4 border-amber-100">
                            <AlertTriangle size={24} className="text-amber-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Reset Semua Pengaturan?</h3>
                        <p className="text-sm text-slate-500 mb-6 px-4">Semua pengaturan akan dihapus dan dikembalikan ke default. Aksi ini tidak dapat dibatalkan.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setResetConfirm(false)} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">Batal</button>
                            <button onClick={handleReset} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-sm shadow-lg shadow-red-600/20">Ya, Reset</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

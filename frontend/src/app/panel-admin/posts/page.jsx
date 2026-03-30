"use client";

import { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { postAPI, categoryAPI, getImageUrl } from "@/lib/api";
import {
    FileText,
    Plus,
    Edit3,
    Trash2,
    X,
    Loader,
    AlertCircle,
    CheckCircle,
    Eye,
    ImageIcon,
    Globe,
    Upload,
    Filter,
} from "lucide-react";

import dynamic from "next/dynamic";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminTable from "@/components/admin/AdminTable";

// Lazy load React Quill (only on client)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function PostsPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters and Selection
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [selectedIds, setSelectedIds] = useState([]);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [activeTab, setActiveTab] = useState("content"); // content | seo
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        categoryId: "",
        status: "DRAFT",
        tags: "",
        metaTitle: "",
        metaDescription: "",
        thumbnail: "",
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState("");

    // Feedback
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

    const quillModules = useMemo(
        () => ({
            toolbar: [
                [{ header: [1, 2, 3, 4, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ indent: "-1" }, { indent: "+1" }],
                ["blockquote", "code-block"],
                ["link", "image"],
                [{ align: [] }],
                [{ color: [] }, { background: [] }],
                ["clean"],
            ],
        }),
        []
    );

    const fetchData = async () => {
        // // setLoading(true);
        try {
            const [postsRes, catRes] = await Promise.all([
                postAPI.getAll("status=all"),
                categoryAPI.getAll(),
            ]);
            setPosts(postsRes.data || []);
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

    const filteredPosts = posts.filter((p) => {
        const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.tags?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
        const matchesCategory = categoryFilter === "ALL" || p.categoryId === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Checkbox toggles
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredPosts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredPosts.map(p => p.id));
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
        setEditingPost(null);
        setFormData({
            title: "",
            content: "",
            categoryId: "",
            status: "DRAFT",
            tags: "",
            metaTitle: "",
            metaDescription: "",
            thumbnail: "",
        });
        setThumbnailFile(null);
        setThumbnailPreview("");
        setActiveTab("content");
        setError("");
        setShowModal(true);
    };

    const openEdit = (post) => {
        setEditingPost(post);
        setFormData({
            title: post.title || "",
            content: post.content || "",
            categoryId: post.categoryId || "",
            status: post.status || "DRAFT",
            tags: post.tags || "",
            metaTitle: post.metaTitle || "",
            metaDescription: post.metaDescription || "",
            thumbnail: post.thumbnail || "",
        });
        setThumbnailFile(null);
        setThumbnailPreview(post.thumbnail ? getImageUrl(post.thumbnail) : "");
        setActiveTab("content");
        setError("");
        setShowModal(true);
    };

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const handleThumbnailChange = (e) => {
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
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Double-check file size before submitting
        if (thumbnailFile && thumbnailFile.size > MAX_FILE_SIZE) {
            const sizeMB = (thumbnailFile.size / (1024 * 1024)).toFixed(1);
            setError(`Ukuran file thumbnail terlalu besar (${sizeMB}MB). Maksimal 10MB per file.`);
            return;
        }

        setSaving(true);
        setError("");
        try {
            const data = { ...formData };
            if (thumbnailFile) {
                data.thumbnailFile = thumbnailFile;
            }

            if (editingPost) {
                await postAPI.update(editingPost.id, data);
                setSuccess("Artikel berhasil diperbarui!");
            } else {
                await postAPI.create(data);
                setSuccess("Artikel berhasil dibuat!");
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
            await postAPI.delete(id);
            setSuccess("Artikel berhasil dihapus!");
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
            await Promise.all(selectedIds.map(id => postAPI.delete(id)));
            setSuccess(`${selectedIds.length} Artikel berhasil dihapus!`);
            setBulkDeleteConfirm(false);
            setSelectedIds([]);
            fetchData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Gagal menghapus beberapa artikel: " + err.message);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PUBLISHED":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "DRAFT":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "ARCHIVED":
                return "bg-slate-100 text-slate-600 border-slate-200";
            default:
                return "bg-slate-50 text-slate-500 border-slate-200";
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <AdminPageHeader 
                title="Kelola Artikel" 
                subtitle="Buat dan kelola artikel & berita terbaru"
                icon={FileText}
                stats={[{ label: "Total", value: posts.length }]}
                actions={[
                    { label: "Buat Artikel", icon: Plus, onClick: openCreate }
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
                placeholder="Cari artikel berdasarkan judul atau tag..."
                dropdowns={[
                    { 
                        label: "Kategori", 
                        value: categoryFilter, 
                        onChange: setCategoryFilter, 
                        options: categories,
                        icon: Filter
                    },
                    { 
                        label: "Status", 
                        value: statusFilter, 
                        onChange: setStatusFilter, 
                        options: [
                            { value: "PUBLISHED", label: "Published" },
                            { value: "DRAFT", label: "Draft" },
                            { value: "ARCHIVED", label: "Archived" }
                        ]
                    }
                ]}
            />

            {selectedIds.length > 0 && (
                <div className="bg-blue-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-blue-600/20 animate-in zoom-in duration-200 mb-6">
                    <p className="text-sm font-bold ml-2">
                        {selectedIds.length} artikel dipilih untuk tindakan massal
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
                    { label: "Artikel" },
                    { label: "Kategori" },
                    { label: "Status" },
                    { label: "Views", className: "w-20" },
                    { label: "Tanggal", className: "w-32" },
                    { label: "Aksi", className: "text-right w-24" }
                ]}
                data={filteredPosts}
                loading={loading}
                selectedIds={selectedIds}
                onSelectAll={toggleSelectAll}
                onSelectOne={toggleSelect}
                emptyMessage="Belum ada artikel ditemukan. Silakan tambahkan artikel baru."
                emptyIcon={FileText}
                renderRow={(post, idx, isSelected) => (
                    <tr key={post.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-4 text-center">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(post.id)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                        </td>
                        <td className="px-4 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                    {post.thumbnail ? (
                                        <img src={getImageUrl(post.thumbnail)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "/Logo-1.png"; }} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 max-w-[200px] sm:max-w-xs transition-all">
                                    <h3 className="text-sm font-bold text-slate-800 truncate leading-tight mb-1" title={post.title}>{post.title}</h3>
                                    {post.tags && (
                                        <div className="flex flex-wrap gap-1">
                                            {post.tags.split(",").slice(0, 2).map((tag, i) => (
                                                <span key={i} className="text-[9px] font-bold text-blue-600 bg-blue-50/50 px-1.5 py-0.5 rounded-sm border border-blue-100/50">
                                                    #{tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 font-bold whitespace-nowrap">
                            {post.category?.name || <span className="text-slate-400 italic font-normal">Uncategorized</span>}
                        </td>
                        <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${getStatusStyle(post.status)} shadow-sm`}>
                                {post.status}
                            </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500 font-bold">
                            <div className="flex items-center gap-1">
                                <Eye size={14} className="text-slate-400" />
                                {post.views || 0}
                            </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "20y" }) : "-"}
                        </td>
                        <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEdit(post)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => setDeleteConfirm(post.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
            />

            {/* Create/Edit Modal - Full screen */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[95vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingPost ? "Edit Artikel" : "Buat Artikel Baru"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-100 px-6 shrink-0">
                            <button
                                onClick={() => setActiveTab("content")}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "content" ? "text-violet-600 border-violet-600" : "text-slate-400 border-transparent hover:text-slate-600"}`}
                            >
                                <FileText size={14} className="inline mr-1.5" />
                                Konten
                            </button>
                            <button
                                onClick={() => setActiveTab("seo")}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "seo" ? "text-violet-600 border-violet-600" : "text-slate-400 border-transparent hover:text-slate-600"}`}
                            >
                                <Globe size={14} className="inline mr-1.5" />
                                SEO & Meta
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                            <div className="p-6 space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                                        <AlertCircle size={16} className="text-red-500" />
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                {/* Content Tab */}
                                {activeTab === "content" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul Artikel</label>
                                            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm" placeholder="Judul yang menarik" />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategori</label>
                                                <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm bg-white">
                                                    <option value="">Pilih Kategori</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm bg-white">
                                                    <option value="DRAFT">Draft</option>
                                                    <option value="PUBLISHED">Published</option>
                                                    <option value="ARCHIVED">Archived</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Thumbnail Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Thumbnail</label>
                                            <div className="flex items-start gap-4">
                                                <div className="w-32 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                                    {thumbnailPreview ? (
                                                        <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Upload size={20} className="text-slate-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <input type="file" accept="image/*" onChange={handleThumbnailChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-600 hover:file:bg-violet-100" />
                                                    <p className="text-xs text-slate-400 mt-1">JPEG, PNG, GIF, WebP, SVG. Maks 10MB.</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Tags <span className="text-slate-400 font-normal">(pisahkan dengan koma)</span>
                                            </label>
                                            <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm" placeholder="budaya, seni, teater" />
                                        </div>

                                        {/* Rich Text Editor */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Konten Artikel</label>
                                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                                <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader className="animate-spin" /></div>}>
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={formData.content}
                                                        onChange={(content) => setFormData({ ...formData, content })}
                                                        modules={quillModules}
                                                        className="bg-white [&_.ql-editor]:min-h-[250px] [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:border-0"
                                                        placeholder="Tulis konten artikel disini..."
                                                    />
                                                </Suspense>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* SEO Tab */}
                                {activeTab === "seo" && (
                                    <>
                                        <div className="p-4 bg-violet-50 rounded-xl">
                                            <h4 className="text-sm font-bold text-violet-800 mb-1">Tips SEO</h4>
                                            <p className="text-xs text-violet-600">Meta Title max 70 karakter. Meta Description max 160 karakter. Bantu mesin pencari memahami konten Anda.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Meta Title
                                                <span className="text-slate-400 font-normal ml-2">
                                                    ({formData.metaTitle.length}/70)
                                                </span>
                                            </label>
                                            <input type="text" value={formData.metaTitle} onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value.slice(0, 70) })} maxLength={70} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm" placeholder="Judul untuk mesin pencari" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Meta Description
                                                <span className="text-slate-400 font-normal ml-2">
                                                    ({formData.metaDescription.length}/160)
                                                </span>
                                            </label>
                                            <textarea value={formData.metaDescription} onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value.slice(0, 160) })} maxLength={160} rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm resize-y" placeholder="Deskripsi singkat untuk hasil pencarian" />
                                        </div>

                                        {/* SEO Preview */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Preview Search Result</label>
                                            <div className="p-4 bg-white border border-slate-200 rounded-xl">
                                                <p className="text-blue-700 text-lg font-medium hover:underline cursor-pointer truncate">
                                                    {formData.metaTitle || formData.title || "Judul Artikel"}
                                                </p>
                                                <p className="text-green-700 text-xs mt-0.5">
                                                    oryzalokabasa.com/insight/...
                                                </p>
                                                <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                                                    {formData.metaDescription || "Deskripsi artikel akan muncul di sini..."}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm">
                                    Batal
                                </button>
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl font-medium hover:from-violet-600 hover:to-violet-700 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2">
                                    {saving && <Loader size={14} className="animate-spin" />}
                                    {editingPost ? "Simpan" : "Publish"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Artikel?</h3>
                        <p className="text-sm text-slate-500 mb-6">Artikel ini akan dihapus permanen beserta thumbnail-nya.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm">Batal</button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors text-sm">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

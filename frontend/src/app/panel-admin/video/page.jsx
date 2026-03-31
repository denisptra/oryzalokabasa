"use client";

import { useState, useEffect } from "react";
import { videoAPI, getImageUrl } from "@/lib/api";
import {
    Video,
    Plus,
    Edit3,
    Trash2,
    X,
    Loader,
    AlertCircle,
    CheckCircle,
    Play,
    Save,
    Eye,
    EyeOff
} from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteModal from "@/components/admin/DeleteModal";

export default function VideoManagementPage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Modal State
    const [editingVideo, setEditingVideo] = useState(null);
    const [formData, setFormData] = useState({ title: "", isActive: true });
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    // Upload State
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await videoAPI.getAll();
            setVideos(res.data || []);
        } catch (err) {
            setError(err.message || "Gagal memuat daftar video");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        return () => {
            // Cleanup preview URL memory leak
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, []);

    // Handle File Selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Validasi ukuran max 100MB
        if (selectedFile.size > 100 * 1024 * 1024) {
            setError("Ukuran file terlalu besar. Maksimal 100MB.");
            e.target.value = null;
            return;
        }

        setFile(selectedFile);
        setError("");
        
        // Buat preview URL jika ada file yang diupload (selain itu revoke yang lama)
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const openModal = (video = null) => {
        setEditingVideo(video);
        setFormData({ 
            title: video?.title || "", 
            isActive: video ? video.isActive : true 
        });
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(video?.url ? getImageUrl(video.url) : null);
        setError("");
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file && !editingVideo) {
            setError("Silakan pilih file video untuk diunggah");
            return;
        }

        setSaving(true);
        setError("");
        
        try {
            const fd = new FormData();
            if (editingVideo) fd.append("id", editingVideo.id);
            fd.append("title", formData.title);
            fd.append("isActive", formData.isActive);
            if (file) fd.append("videoFile", file);

            setUploadProgress(0);
            await videoAPI.save(fd, (progress) => {
                setUploadProgress(progress);
            });
            
            setSuccess(editingVideo ? "Video berhasil diperbarui!" : "Video berhasil diunggah!");
            setShowModal(false);
            fetchData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message || "Terjadi kesalahan saat menyimpan video");
        } finally {
            setSaving(false);
            setUploadProgress(0);
        }
    };

    const handleToggle = async (id) => {
        try {
            await videoAPI.toggle(id);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        setDeleteConfirm(id);
    };

    const confirmDelete = async () => {
        try {
            await videoAPI.delete(deleteConfirm);
            setSuccess("Video berhasil dihapus");
            setDeleteConfirm(null);
            fetchData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <AdminPageHeader 
                title="Video Beranda" 
                subtitle="Kelola video latar belakang untuk halaman depan"
                icon={Video}
                stats={[{ label: "Total", value: videos.length }]}
                actions={[
                    { label: "Unggah Video Baru", icon: Plus, onClick: () => openModal(), color: "bg-red-600 hover:bg-red-700 shadow-red-600/20" }
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

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader className="animate-spin text-red-600" size={32} />
                </div>
            ) : videos.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-24 text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                        <Video size={40} className="text-slate-200" />
                    </div>
                    <p className="text-slate-500 font-bold text-lg">Belum ada video yang diunggah</p>
                    <p className="text-slate-400 text-sm mt-1 mb-8">Video ini akan tampil sebagai latar belakang di beranda utama.</p>
                    <button 
                        onClick={() => openModal()} 
                        className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                    >
                        Unggah Video Sekarang
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <div key={video.id} className={`bg-white rounded-2xl border ${video.isActive ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'} overflow-hidden shadow-sm hover:shadow-md transition-all group`}>
                            <div className="aspect-video bg-slate-900 relative">
                                <video 
                                    src={getImageUrl(video.url)} 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                                        <Play size={24} fill="currentColor" />
                                    </div>
                                </div>
                                {video.isActive && (
                                    <div className="absolute top-3 left-3 px-2 py-1 bg-red-600 text-white text-[10px] font-bold uppercase rounded-md shadow-lg">
                                        AKTIF
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-800 mb-1 truncate">{video.title || "Tanpa Judul"}</h3>
                                <p className="text-[10px] text-slate-400 font-mono truncate mb-4">{video.url}</p>
                                
                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => openModal(video)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(video.id)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => handleToggle(video.id)}
                                        className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase flex items-center gap-1.5 transition-all ${
                                            video.isActive 
                                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                                        }`}
                                    >
                                        {video.isActive ? (
                                            <><EyeOff size={12} /> Matikan</>
                                        ) : (
                                            <><Eye size={12} /> Aktifkan</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingVideo ? "Edit Video" : "Unggah Video Menarik"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                                    <AlertCircle size={16} className="text-red-500" />
                                    <p className="text-sm text-red-600 font-bold">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Judul Video (Opsional)</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 text-sm font-bold"
                                    placeholder="Contoh: Peresmian Kantor Baru"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Pilih File Video</label>
                                
                                {previewUrl && (
                                    <div className="mb-4 rounded-xl overflow-hidden border-2 border-slate-200 bg-black aspect-video relative">
                                        <video src={previewUrl} className="w-full h-full object-cover" controls></video>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setFile(null);
                                                URL.revokeObjectURL(previewUrl);
                                                setPreviewUrl(null);
                                            }} 
                                            className="absolute top-2 right-2 bg-red-600/80 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors backdrop-blur-sm"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                {!previewUrl && (
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="video-file-input"
                                            accept="video/mp4,video/webm,video/quicktime,video/ogg"
                                        />
                                        <label
                                            htmlFor="video-file-input"
                                            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${file ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-red-400 hover:bg-slate-50'}`}
                                        >
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${file ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-slate-100 text-slate-400'}`}>
                                                <Video size={24} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 text-center px-4 leading-relaxed whitespace-pre-line">
                                                {file ? file.name : "Klik untuk memilih file video\nFormat: MP4, WebM, MOV, OGG (Maks. 100MB)"}
                                            </span>
                                        </label>
                                    </div>
                                )}
                                {editingVideo && !file && !previewUrl && (
                                    <p className="mt-2 text-[10px] text-slate-400 italic">Biarkan kosong jika tidak ingin mengganti video</p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                                <input 
                                    type="checkbox" 
                                    id="isActiveCheckbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                                />
                                <label htmlFor="isActiveCheckbox" className="text-sm font-bold text-slate-700 cursor-pointer select-none">Tampilkan langsung (Aktifkan)</label>
                            </div>

                            {saving && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <span>Proses Unggah</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                                        <div 
                                            className="h-full bg-red-600 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    {uploadProgress === 100 && (
                                        <p className="text-[10px] text-slate-400 italic text-center animate-pulse">Menyimpan ke server...</p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm uppercase tracking-wider">Batal</button>
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 uppercase tracking-wider">
                                    {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                    {editingVideo ? "Simpan" : "Unggah"}
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
                onConfirm={confirmDelete}
                title="Hapus Video?"
                message="Video ini akan dihapus secara permanen dari server dan tidak dapat dikembalikan."
            />
        </div>
    );
}

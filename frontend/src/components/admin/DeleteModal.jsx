"use client";

import { Trash2, AlertCircle } from "lucide-react";

export default function DeleteModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Hapus Data?", 
    message = "Tindakan ini tidak dapat dibatalkan. Data akan dihapus permanen dari sistem.",
    confirmLabel = "Ya, Hapus",
    isBulk = false,
    count = 0
}) {
    const displayTitle = isBulk ? `Hapus ${count} Data?` : title;

    return (
        <div className={`fixed inset-0 z-100 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                onClick={onClose}
            />
            
            <div className={`bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center relative z-101 transform transition-all duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
                    <Trash2 size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{displayTitle}</h3>
                <p className="text-sm text-slate-500 mb-6 px-4 leading-relaxed">
                    {message}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-sm shadow-lg shadow-red-600/20"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

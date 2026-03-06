"use client";

import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function NotFound() {
    return (
        <div className={`fixed inset-0 z-9999 bg-white flex items-center justify-center p-6 ${inter.className}`}>
            <div className="text-center max-w-md mx-auto">
                <FileQuestion size={80} className="text-blue-500 mx-auto mb-6" />

                <h1 className="text-6xl md:text-8xl font-bold text-slate-800 mb-2">
                    404
                </h1>

                <h2 className="text-xl md:text-2xl font-semibold text-slate-700 mb-4">
                    Halaman Tidak Ditemukan
                </h2>

                <p className="text-base text-slate-500 mb-10 leading-relaxed">
                    Maaf, halaman atau berita yang Anda cari tidak ditemukan. Halaman ini mungkin sudah dihapus atau URL-nya salah.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg transition-all w-full sm:w-auto text-lg"
                >
                    <Home size={20} />
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}

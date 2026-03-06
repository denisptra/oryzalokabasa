"use client";

import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Error({ error, reset }) {
    return (
        <div className={`fixed inset-0 z-9999 bg-white flex items-center justify-center p-6 ${inter.className}`}>
            <div className="text-center max-w-md mx-auto">
                <AlertTriangle size={80} className="text-red-500 mx-auto mb-6" />

                <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                    Oops!
                </h1>

                <h2 className="text-xl md:text-2xl font-semibold text-slate-700 mb-4">
                    Terjadi Kesalahan Server
                </h2>

                <p className="text-base text-slate-500 mb-10 leading-relaxed">
                    Maaf, server kami mengalami gangguan saat memproses permintaan Anda. Kami sedang berupaya memperbaikinya.
                </p>

                <Link
                    href="/"
                    onClick={() => reset()}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg transition-all w-full sm:w-auto text-lg"
                >
                    <Home size={20} />
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}

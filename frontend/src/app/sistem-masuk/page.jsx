"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, Loader, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await login(email, password);
      router.push("/panel-admin");
    } catch (error) {
      setErrorMsg(error.message || "Login gagal. Periksa kembali email dan password Anda.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1b4b] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Tombol Kembali ke Beranda */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white text-sm mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Beranda
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
          {/* Header Inside Card */}
          <div className="pt-10 pb-6 px-10 text-center bg-slate-50 border-b border-gray-100">
            <div className="inline-block mb-4 p-2 ">
              <Image
                src="/Logo-1.png"
                alt="Oryza Lokabasa"
                width={100}
                height={100}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-[#1a1b4b] tracking-tight">Selamat Datang</h1>
            <p className="text-gray-500 text-sm mt-1">Masuk untuk mengelola Oryza Lokabasa</p>
          </div>

          <div className="p-10">
            {/* Error Alert */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-red-700 text-xs font-medium">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EBA100] transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan Email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#EBA100]/20 focus:border-[#EBA100] transition-all text-gray-800"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EBA100] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan Password"
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#EBA100]/20 focus:border-[#EBA100] transition-all text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#EBA100] hover:bg-[#d49100] text-white py-4 rounded-2xl font-bold shadow-lg shadow-yellow-600/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  "Masuk"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8 tracking-widest uppercase">
          Oryza Lokabasa © 2026
        </p>
      </div>
    </div>
  );
}
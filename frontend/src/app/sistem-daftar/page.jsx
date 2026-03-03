"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, AlertCircle, Loader, CheckCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register, isLoading } = useAuth();
  const router = useRouter();

  // Check password strength
  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    checkPasswordStrength(pwd);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 2) return "bg-red-500";
    if (passwordStrength < 3) return "bg-yellow-500";
    if (passwordStrength < 5) return "bg-blue-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg("Semua field harus diisi");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Password tidak cocok");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password harus minimal 8 karakter");
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setErrorMsg("Password harus mengandung huruf besar, kecil, angka, dan simbol");
      return;
    }

    try {
      await register(name, email, password);
      setSuccessMsg("Akun berhasil dibuat! Silakan login.");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      setErrorMsg(error.message || "Pendaftaran gagal. Email mungkin sudah terdaftar.");
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
            <h1 className="text-2xl font-bold text-[#1a1b4b] tracking-tight">Buat Akun</h1>
            <p className="text-gray-500 text-sm mt-1">Daftar untuk mengakses Oryza Lokabasa</p>
          </div>

          <div className="p-10">
            {/* Error Alert */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-red-700 text-xs font-medium">{errorMsg}</p>
              </div>
            )}

            {/* Success Alert */}
            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-green-700 text-xs font-medium">{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Nama Lengkap
                </label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EBA100] transition-colors" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#EBA100]/20 focus:border-[#EBA100] transition-all text-gray-800"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EBA100] transition-colors" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
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
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
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
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3 ml-1">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${i < passwordStrength ? getPasswordStrengthColor() : "bg-gray-200"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">
                      {passwordStrength < 2 && "Lemah"}
                      {passwordStrength >= 2 && passwordStrength < 3 && "Sedang"}
                      {passwordStrength >= 3 && passwordStrength < 5 && "Kuat"}
                      {passwordStrength === 5 && "Sangat Kuat"}
                    </p>
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-2 ml-1">
                  * Minimal 8 karakter, huruf besar & kecil, angka, dan simbol
                </p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Konfirmasi Password
                </label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EBA100] transition-colors" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#EBA100]/20 focus:border-[#EBA100] transition-all text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  <>
                    <Loader size={20} className="animate-spin" />
                    <span className="text-sm">Mendaftar...</span>
                  </>
                ) : (
                  "Daftar"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-[#EBA100] font-bold hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>
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

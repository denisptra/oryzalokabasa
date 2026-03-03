"use client";
import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Profile dropdown state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/");
      setIsProfileOpen(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.insight"), path: "/insight" },
    { name: t("nav.gallery"), path: "/gallery" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  return (
    <nav className={`w-full bg-white border-b shadow-sm border-gray-100 sticky top-0 z-50 ${inter.className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center">
          <div className="relative w-[80px] h-[80px] md:w-[90px] md:h-[90px]">
            <Image
              src="/Logo-1.png"
              alt="Oryza Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6 font-medium text-sm">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  href={link.path}
                  className={`transition ${isActive(link.path)
                    ? "text-blue-950 font-bold"
                    : "text-gray-400 hover:text-blue-950"
                    }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="h-5 w-px bg-gray-200"></div>

          {/* RIGHT SIDE: LANGUAGE & PROFILE */}
          <div className="flex items-center gap-5">
            {/* Language Switcher (Selalu Muncul) */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg">
              <button
                onClick={() => changeLanguage("ID")}
                className={`px-3 py-1 text-[11px] rounded-md font-bold transition ${language === "ID" ? "bg-blue-950 text-white shadow-md" : "text-gray-400 hover:text-blue-950"
                  }`}
              >
                ID
              </button>
              <button
                onClick={() => changeLanguage("EN")}
                className={`px-3 py-1 text-[11px] rounded-md font-bold transition ${language === "EN" ? "bg-blue-950 text-white shadow-md" : "text-gray-400 hover:text-blue-950"
                  }`}
              >
                EN
              </button>
            </div>

            {/* Profile Dropdown (Hanya Muncul Jika Login) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-900 to-blue-700 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm hover:ring-2 hover:ring-blue-100 transition-all">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                </button>

                {/* Dropdown Content */}
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Akun Pengguna</p>
                        <p className="text-sm font-bold text-blue-950">{user?.name}</p>
                      </div>

                      <Link
                        href="/panel-admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-900 transition"
                      >
                        <LayoutDashboard size={16} className="text-blue-600" />
                        {t("misc.dashboard")}
                      </Link>

                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut || isLoading}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                      >
                        <LogOut size={16} className="text-red-600" />
                        {isLoggingOut ? t("misc.logging_out") : t("misc.logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MOBILE TOGGLE BUTTON */}
        <button
          className="md:hidden p-2 text-blue-950"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div className={`fixed inset-0 bg-white z-40 transition-transform duration-300 md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"
        }`} style={{ top: '64px' }}>
        <div className="flex flex-col p-6 gap-6">
          <ul className="flex flex-col gap-5 text-lg font-semibold">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block transition ${isActive(link.path) ? "text-blue-950" : "text-gray-400"}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <hr className="border-gray-100" />

          {/* Mobile Language Switcher */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("misc.choose_lang")}</p>
            <div className="flex gap-2">
              <button
                onClick={() => { changeLanguage("ID"); setIsOpen(false); }}
                className={`flex-1 py-3 rounded-xl font-bold border transition ${language === "ID" ? "bg-blue-950 text-white border-blue-950" : "border-gray-200 text-gray-400"
                  }`}
              >
                ID
              </button>
              <button
                onClick={() => { changeLanguage("EN"); setIsOpen(false); }}
                className={`flex-1 py-3 rounded-xl font-bold border transition ${language === "EN" ? "bg-blue-950 text-white border-blue-950" : "border-gray-200 text-gray-400"
                  }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Mobile Auth (Hanya jika Login) */}
          {isAuthenticated && (
            <>
              <hr className="border-gray-100" />
              <div className="flex flex-col gap-3">
                <Link
                  href="/panel-admin"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 flex items-center justify-center gap-3 bg-blue-50 text-blue-900 rounded-xl font-bold"
                >
                  <LayoutDashboard size={20} /> {t("misc.dashboard")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-4 flex items-center justify-center gap-3 bg-red-50 text-red-600 rounded-xl font-bold"
                >
                  <LogOut size={20} /> {isLoggingOut ? t("misc.logging_out") : t("misc.logout")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
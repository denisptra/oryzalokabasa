"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Image,
  MessageSquare,
  SlidersHorizontal,
  Users,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const menuItems = [
    {
      label: "Dashboard",
      href: "/panel-admin",
      icon: LayoutDashboard,
      roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      label: "Artikel",
      href: "/panel-admin/posts",
      icon: FileText,
      roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      label: "Kategori",
      href: "/panel-admin/categories",
      icon: FolderOpen,
      roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      label: "Galeri",
      href: "/panel-admin/gallery",
      icon: Image,
      roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      label: "Pesan Kontak",
      href: "/panel-admin/contacts",
      icon: MessageSquare,
      roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      label: "Hero Slider",
      href: "/panel-admin/hero-slider",
      icon: SlidersHorizontal,
      roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      label: "Pengguna",
      href: "/panel-admin/users",
      icon: Users,
      roles: ["SUPER_ADMIN"],
    },
    {
      label: "Aktivitas Log",
      href: "/panel-admin/logs",
      icon: Activity,
      roles: ["SUPER_ADMIN"],
    },
    {
      label: "Pengaturan",
      href: "/panel-admin/settings",
      icon: Settings,
      roles: ["SUPER_ADMIN"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/sistem-masuk");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 overflow-y-auto shadow-2xl flex flex-col`}
      >
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold">Oryza Admin</h1>
          <p className="text-xs text-slate-400 mt-1">
            {isSuperAdmin ? "Super Administrator" : "Administrator"}
          </p>
        </div>

        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800"
                  }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 transition-all text-sm font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-slate-500">
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

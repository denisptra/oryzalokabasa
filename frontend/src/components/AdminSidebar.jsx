"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    Users,
    FileText,
    FolderOpen,
    Image,
    SlidersHorizontal,
    MessageSquare,
    Settings,
    ScrollText,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Shield,
    Menu,
    X,
} from "lucide-react";
import { diagnostikAPI } from "@/lib/api";

const menuItems = [
    {
        label: "Dashboard",
        href: "/panel-admin",
        icon: LayoutDashboard,
        roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
        label: "Pengguna",
        href: "/panel-admin/users",
        icon: Users,
        roles: ["SUPER_ADMIN"],
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
        label: "Hero Slider",
        href: "/panel-admin/hero-slider",
        icon: SlidersHorizontal,
        roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
        label: "Anggota (Tim)",
        href: "/panel-admin/team",
        icon: Users,
        roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
        label: "Pesan Kontak",
        href: "/panel-admin/contacts",
        icon: MessageSquare,
        roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
        label: "Pengaturan",
        href: "/panel-admin/settings",
        icon: Settings,
        roles: ["SUPER_ADMIN"],
    },
    {
        label: "Log Aktivitas",
        href: "/panel-admin/logs",
        icon: ScrollText,
        roles: ["SUPER_ADMIN"],
    },
];

export default function AdminSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    // Notification badges map
    const [badges, setBadges] = useState({
        messages: 0,
        users: 0,
        logs: 0,
        _rawUsers: 0,
        _rawLogs: 0
    });

    // Core routing & hooks
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const userRole = user?.role || "ADMIN";

    const filteredMenu = menuItems.filter((item) =>
        item.roles.includes(userRole)
    );

    const getSeenCount = (key) => {
        if (typeof window !== "undefined") {
            return parseInt(localStorage.getItem(key) || '0', 10);
        }
        return 0;
    };

    const setSeenCount = (key, value) => {
        if (typeof window !== "undefined") {
            localStorage.setItem(key, value.toString());
        }
    };

    // Fetch pesan unread dan update setiap 30 detik
    const fetchSidebarStats = async () => {
        try {
            const res = await diagnostikAPI.getSidebarStats();
            if (res.data) {
                const rawUsers = res.data.newUsers || 0;
                const rawLogs = res.data.newLogs || 0;

                let usersBadge = 0;
                let logsBadge = 0;

                if (!pathname?.startsWith('/panel-admin/users')) {
                    const seenUsers = getSeenCount('seen_users_count');
                    usersBadge = Math.max(0, rawUsers - seenUsers);
                } else {
                    setSeenCount('seen_users_count', rawUsers);
                }

                if (!pathname?.startsWith('/panel-admin/logs')) {
                    const seenLogs = getSeenCount('seen_logs_count');
                    logsBadge = Math.max(0, rawLogs - seenLogs);
                } else {
                    setSeenCount('seen_logs_count', rawLogs);
                }

                setBadges({
                    messages: res.data.unreadMessages || 0,
                    users: usersBadge,
                    logs: logsBadge,
                    _rawUsers: rawUsers,
                    _rawLogs: rawLogs
                });
            }
        } catch (error) {
            console.error("Failed to fetch sidebar stats", error);
        }
    };

    useEffect(() => {
        fetchSidebarStats();
        // Check for new notifications every 30 seconds
        const interval = setInterval(fetchSidebarStats, 30000);
        return () => clearInterval(interval);
    }, [pathname]);

    // Clear badge ketika halaman sedang aktif atau baru saja dibuka
    useEffect(() => {
        if (pathname?.startsWith('/panel-admin/users') && badges._rawUsers > 0) {
            setSeenCount('seen_users_count', badges._rawUsers);
            setBadges(prev => ({ ...prev, users: 0 }));
        }
        if (pathname?.startsWith('/panel-admin/logs') && badges._rawLogs > 0) {
            setSeenCount('seen_logs_count', badges._rawLogs);
            setBadges(prev => ({ ...prev, logs: 0 }));
        }
    }, [pathname, badges._rawUsers, badges._rawLogs]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const isActive = (href) => {
        if (href === "/panel-admin") return pathname === "/panel-admin";
        return pathname.startsWith(href);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                    <Link href="/">
                        <img src="/Logo-2.png" alt="Logo" className="w-full h-full object-cover" />
                    </Link>
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <h1 className="text-base font-bold text-white tracking-tight leading-tight">
                            Dashboard
                        </h1>
                        <p className="text-[11px] text-slate-400 leading-tight">
                            {userRole === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
                {filteredMenu.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${active
                                    ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 shadow-sm"
                                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                                }`}
                            title={collapsed ? item.label : ""}
                        >
                            {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full" />
                            )}
                            <div className="relative flex-shrink-0">
                                <Icon
                                    size={20}
                                    className={`transition-colors ${active
                                        ? "text-amber-400"
                                        : "text-slate-400 group-hover:text-white"
                                        }`}
                                />
                                {item.label === "Pesan Kontak" && badges.messages > 0 && !active && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow ring-2 ring-slate-900 border-none">
                                        {badges.messages > 99 ? '99+' : badges.messages}
                                    </span>
                                )}
                                {item.label === "Pengguna" && badges.users > 0 && !active && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white shadow ring-2 ring-slate-900 border-none">
                                        {badges.users > 99 ? '99+' : badges.users}
                                    </span>
                                )}
                                {item.label === "Log Aktivitas" && badges.logs > 0 && !active && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white shadow ring-2 ring-slate-900 border-none">
                                        {badges.logs > 99 ? '99+' : badges.logs}
                                    </span>
                                )}
                            </div>
                            {!collapsed && (
                                <div className="flex-1 flex justify-between items-center">
                                    <span>{item.label}</span>
                                    {item.label === "Pesan Kontak" && badges.messages > 0 && !active && (
                                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full ml-auto shadow-sm">
                                            {badges.messages > 99 ? '99+' : badges.messages} Baru
                                        </span>
                                    )}
                                    {item.label === "Pengguna" && badges.users > 0 && !active && (
                                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500 text-white rounded-full ml-auto shadow-sm">
                                            {badges.users > 99 ? '99+' : badges.users} Baru
                                        </span>
                                    )}
                                    {item.label === "Log Aktivitas" && badges.logs > 0 && !active && (
                                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500 text-white rounded-full ml-auto shadow-sm">
                                            {badges.logs > 99 ? '99+' : badges.logs} Baru
                                        </span>
                                    )}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="px-3 py-4 border-t border-slate-700/50 space-y-2">
                {!collapsed && (
                    <div className="px-3 py-2.5 bg-slate-700/30 rounded-xl">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.name || "Admin"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                            {user?.email || "admin@email.com"}
                        </p>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
                    title={collapsed ? "Logout" : ""}
                >
                    <LogOut
                        size={20}
                        className="flex-shrink-0 group-hover:text-red-300"
                    />
                    {!collapsed && <span>Keluar</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-800 text-white rounded-xl shadow-lg hover:bg-slate-700 transition-colors"
                id="mobile-menu-toggle"
            >
                <Menu size={22} />
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed top-0 left-0 z-50 h-screen w-72 bg-slate-900 transform transition-transform duration-300 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                    <X size={20} />
                </button>
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex flex-col h-screen bg-slate-900 border-r border-slate-700/50 transition-all duration-300 ease-out sticky top-0 ${collapsed ? "w-[72px]" : "w-64"
                    }`}
            >
                <SidebarContent />
                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-8 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-600 hover:text-white transition-colors z-10"
                >
                    {collapsed ? (
                        <ChevronRight size={14} />
                    ) : (
                        <ChevronLeft size={14} />
                    )}
                </button>
            </aside>
        </>
    );
}

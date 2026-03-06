"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  FileText, Users, Image, MessageSquare, TrendingUp, Eye, Clock,
  Activity, ArrowUpRight, FolderOpen, SlidersHorizontal, BarChart3
} from "lucide-react";
import Link from "next/link";
import { postAPI, categoryAPI, galleryAPI, contactAPI, userAPI, heroSliderAPI, analyticsAPI } from "@/lib/api";

// ==========================================
// UTILITY: AGREGASI DATA TREN
// ==========================================
// Mengelompokkan raw data menjadi total per Hari atau per Bulan
const aggregateTrendData = (rawData, groupBy = 'day') => {
  if (!rawData || rawData.length === 0) return [];

  const aggregated = {};
  rawData.forEach(item => {
    const date = new Date(item.date);
    let key = '';

    if (groupBy === 'day') {
      key = date.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
    } else {
      key = date.toLocaleDateString("id-ID", { month: 'short', year: 'numeric' });
    }

    if (!aggregated[key]) aggregated[key] = 0;
    aggregated[key] += (item.views || 0);
  });

  return Object.keys(aggregated).map(key => ({
    label: key,
    views: aggregated[key]
  }));
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

function StatCard({ icon: Icon, label, value, color, href }) {
  const colorMap = {
    blue: { bg: "bg-blue-50", icon: "bg-blue-500", text: "text-blue-600", border: "border-blue-100" },
    green: { bg: "bg-emerald-50", icon: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-100" },
    purple: { bg: "bg-purple-50", icon: "bg-purple-500", text: "text-purple-600", border: "border-purple-100" },
    orange: { bg: "bg-amber-50", icon: "bg-amber-500", text: "text-amber-600", border: "border-amber-100" },
    pink: { bg: "bg-pink-50", icon: "bg-pink-500", text: "text-pink-600", border: "border-pink-100" },
    cyan: { bg: "bg-cyan-50", icon: "bg-cyan-500", text: "text-cyan-600", border: "border-cyan-100" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <Link href={href || "#"} className={`block p-5 rounded-2xl border ${c.border} ${c.bg} hover:shadow-lg transition-all duration-300 group`}>
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center shadow-lg`}>
          <Icon size={20} className="text-white" />
        </div>
        <ArrowUpRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </Link>
  );
}

const TrendChart = ({ rawTrendData, loading }) => {
  const [filter, setFilter] = useState('day'); // 'day' atau 'month'

  const chartData = aggregateTrendData(rawTrendData, filter);
  const maxViews = Math.max(...chartData.map(i => i.views), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp className="text-blue-500" size={20} /> Tren Pengunjung
        </h2>
        {/* Toggle Harian / Bulanan */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setFilter('day')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'day' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Harian</button>
          <button onClick={() => setFilter('month')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'month' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Bulanan</button>
        </div>
      </div>

      <div className="flex items-end gap-2 h-48 w-full mt-4">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Memuat grafik...</div>
        ) : chartData.length > 0 ? (
          chartData.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-2 group h-full">
              <div className="w-full flex-1 relative flex items-end justify-center rounded-t-sm bg-slate-50">
                <div
                  className="w-full bg-blue-500 rounded-t-md transition-all duration-500 group-hover:bg-blue-600 max-w-[40px] relative"
                  style={{ height: `${(item.views / maxViews) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {item.views} views
                  </div>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">{item.label}</span>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl text-sm">Belum ada data kunjungan</div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function DashboardPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [stats, setStats] = useState({ posts: 0, categories: 0, gallery: 0, contacts: 0, users: 0, sliders: 0 });
  const [analytics, setAnalytics] = useState({ totalViews: 0, uniqueVisitors: 0, topPosts: [], viewsTrend: [] });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // // setLoading(true);
      try {
        let analyticsData = { data: { totalViews: 0, uniqueVisitors: 0, topPosts: [], viewsTrend: [] } };
        try {
          analyticsData = await analyticsAPI.getOverview();
        } catch (e) {
          console.warn("Analytics data not available", e);
        }

        const results = await Promise.allSettled([
          postAPI.getAll(), categoryAPI.getAll(), galleryAPI.getAll(),
          contactAPI.getAll(), isSuperAdmin ? userAPI.getAll() : Promise.resolve(null),
          heroSliderAPI.getAll(), Promise.resolve(analyticsData)
        ]);

        const getD = (i) => (results[i]?.status === "fulfilled" ? results[i].value : null);

        setStats({
          posts: getD(0)?.data?.length || getD(0)?.total || 0,
          categories: getD(1)?.data?.length || 0,
          gallery: getD(2)?.data?.length || getD(2)?.total || 0,
          contacts: getD(3)?.data?.length || getD(3)?.total || 0,
          users: getD(4)?.data?.length || 0,
          sliders: getD(5)?.data?.length || 0,
        });

        const anl = getD(6)?.data || {};
        setAnalytics({
          totalViews: anl.totalViews || 0, uniqueVisitors: anl.uniqueVisitors || 0,
          topPosts: anl.topPosts || [], viewsTrend: anl.viewsTrend || [],
        });

        setRecentPosts(getD(0)?.data?.slice(0, 5) || []);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isSuperAdmin]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{getGreeting()}, {user?.name || "Admin"} 👋</h1>
          <p className="text-slate-500 mt-1">Berikut ringkasan aktivitas website Oryza Lokabasa</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Clock size={16} className="text-slate-400" />
          <span className="text-sm text-slate-600">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={FileText} label="Artikel" value={loading ? "..." : stats.posts} color="blue" href="/panel-admin/posts" />
        <StatCard icon={FolderOpen} label="Kategori" value={loading ? "..." : stats.categories} color="purple" href="/panel-admin/categories" />
        <StatCard icon={Image} label="Galeri" value={loading ? "..." : stats.gallery} color="green" href="/panel-admin/gallery" />
        <StatCard icon={MessageSquare} label="Pesan" value={loading ? "..." : stats.contacts} color="orange" href="/panel-admin/contacts" />
        <StatCard icon={SlidersHorizontal} label="Slider" value={loading ? "..." : stats.sliders} color="cyan" href="/panel-admin/hero-slider" />
        {isSuperAdmin && <StatCard icon={Users} label="Pengguna" value={loading ? "..." : stats.users} color="pink" href="/panel-admin/users" />}
      </div>

      {/* Analytics Main Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg flex justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Views Keseluruhan</p>
            <p className="text-3xl font-bold mt-2">{loading ? "..." : analytics.totalViews.toLocaleString()}</p>
          </div>
          <Eye size={40} className="text-blue-300 opacity-50" />
        </div>
        <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg flex justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium">Pengunjung Unik</p>
            <p className="text-3xl font-bold mt-2">{loading ? "..." : analytics.uniqueVisitors.toLocaleString()}</p>
          </div>
          <BarChart3 size={40} className="text-emerald-300 opacity-50" />
        </div>
      </div>

      {/* Dynamic Trend Chart Component */}
      <TrendChart rawTrendData={analytics.viewsTrend} loading={loading} />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Posts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-800">Artikel Terbaru</h2>
            <Link href="/panel-admin/posts" className="text-sm text-blue-600 hover:underline font-medium">Lihat Semua</Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}
              </div>
            ) : recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 line-clamp-1">{post.title}</span>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>{new Date(post.createdAt).toLocaleDateString("id-ID")}</span>
                      <span className="flex items-center gap-1 text-blue-600"><Eye size={12} /> {post.views || 0}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-widest ${post.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    {post.status === "PUBLISHED" ? "Terbit" : "Draft"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-4 text-sm">Belum ada artikel</p>
            )}
          </div>
        </div>

        {/* Sidebar: Actions & Top Posts */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Aksi Cepat</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/panel-admin/posts" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><FileText size={16} className="text-blue-600" /></div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-blue-700">Tulis Artikel Baru</span>
              </Link>
              <Link href="/panel-admin/contacts" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><MessageSquare size={16} className="text-amber-600" /></div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-amber-700">Cek Kotak Masuk</span>
              </Link>
              {isSuperAdmin && (
                <Link href="/panel-admin/logs" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center"><Activity size={16} className="text-slate-600" /></div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800">Log Sistem</span>
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="text-emerald-500" size={18} /> Top Artikel
            </h2>
            <div className="space-y-3">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
                </div>
              ) : analytics.topPosts?.length > 0 ? (
                analytics.topPosts.slice(0, 4).map((post, idx) => (
                  <Link href={`/panel-admin/posts`} key={post.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 group border border-transparent hover:border-slate-100 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-slate-700 truncate group-hover:text-emerald-600">{post.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{post.views} Views</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-center text-slate-400 py-4">Belum ada data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
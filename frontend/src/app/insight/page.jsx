"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Clock, Loader, ChevronLeft, ChevronRight } from "lucide-react";
import { postAPI, categoryAPI, getImageUrl } from "@/lib/api";
import { Inter, Playfair_Display } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

const slowFadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }
};

const stripHtml = (html) => html?.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ") || "";

// ==========================================
// SUB-COMPONENTS
// ==========================================

// 1. HEADER (Sesuai Gambar Referensi)
const PageHeader = () => (
  <header className="py-16 md:py-20 px-6 text-center border-b border-gray-100 bg-[#FAFAFA]">
    <motion.div initial="hidden" animate="visible" variants={slowFadeUp} className="max-w-full mx-auto flex flex-col items-center">
      {/* Garis dan Tag Wawasan */}
      <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
        <div className="w-max md:w-16 h-[1px] bg-gray-300"></div>
        <span className="text-blue-950 font-bold text-[10px] md:text-xs tracking-[0.15em] uppercase">
          Wawasan & Literasi
        </span>
        <div className="w-10 md:w-16 h-[1px] bg-gray-300"></div>
      </div>
      
      {/* Judul Utama - Dioptimasi untuk Mobile & Desktop */}
      <h1 className={`${playfair.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-950 mb-4 md:mb-6 leading-tight`}>
        Arsip Wawasan & Literasi Budaya
      </h1>
      
      {/* Subjudul */}
      <p className="text-gray-500 text-sm md:text-base leading-relaxed px-4">
        Catatan, refleksi, dan dokumentasi kegiatan seni dan budaya Oryza Lokabasa sebagai ruang belajar dan dialog publik.
      </p>
    </motion.div>
  </header>
);

// 2. SIDEBAR FILTER
const FilterSidebar = ({ categories, activeFilters, toggleFilter, t }) => (
  <aside className="lg:w-1/4">
    <div className="sticky top-24 bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className={`${playfair.className} text-lg md:text-xl font-bold text-blue-950`}>Kategori</h3>
        {activeFilters.length > 0 && (
          <button onClick={() => toggleFilter("RESET")} className="text-[10px] text-red-500 font-bold uppercase hover:underline">
            {t("insight.reset") || "Reset"}
          </button>
        )}
      </div>
      <div className="space-y-3 md:space-y-4">
        {categories.map((cat) => (
          <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 md:w-5 md:h-5 rounded border-gray-300 text-blue-950 focus:ring-blue-900"
              checked={activeFilters.includes(cat.id)}
              onChange={() => toggleFilter(cat.id)}
            />
            <span className={`text-sm md:text-base transition-colors ${activeFilters.includes(cat.id) ? "text-blue-900 font-bold" : "text-gray-500 hover:text-blue-700"}`}>
              {cat.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  </aside>
);

// 3. ARTICLE CARD
const ArticleCard = ({ article, isHeadline, language, t }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={slowFadeUp}
    className={`${isHeadline ? "md:col-span-3 grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8" : "flex flex-col"}`}
  >
    <Link href={`/insight/${article.slug || article.id}`} className="contents group">
      {/* Gambar Thumbnail - Menggunakan aspect ratio agar tidak gepeng di HP */}
      <div className={`relative rounded-2xl overflow-hidden shrink-0 bg-slate-100 w-full ${isHeadline ? "md:col-span-1 lg:col-span-2 aspect-video md:aspect-auto md:h-[420px]" : "aspect-[4/3] md:h-52"}`}>
        <img
          src={article.thumbnail ? getImageUrl(article.thumbnail) : "/fallback.jpg"}
          alt={article.title}
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = "/fallback.jpg"; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded shadow-sm">
          <span className="text-[9px] md:text-[10px] font-bold text-yellow-700 italic uppercase">
            {article.category?.name || "Artikel"}
          </span>
        </div>
      </div>
      
      {/* Konten Teks */}
      <div className={`flex flex-col ${isHeadline ? "md:col-span-1 lg:col-span-1 justify-center" : "mt-4 md:mt-6"}`}>
        <h3 className={`${playfair.className} font-bold text-blue-950 group-hover:text-blue-700 transition-colors leading-tight mb-3 md:mb-4 ${isHeadline ? "text-2xl md:text-3xl lg:text-4xl" : "text-lg md:text-xl"}`}>
          {article.title}
        </h3>
        <p className="text-gray-500 text-xs md:text-sm leading-relaxed line-clamp-3">
          {stripHtml(article.excerpt || article.content).substring(0, 160)}...
        </p>
        <div className="flex items-center gap-3 md:gap-4 mt-4 md:mt-6 text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest flex-wrap">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-yellow-600" /> 
            {new Date(article.createdAt).toLocaleDateString(language === "EN" ? "en-US" : "id-ID", { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-yellow-600" /> 
            {t("insight.read_time") || "5 MIN READ"}
          </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function WawasanPage() {
  const { t, language } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const toggleFilter = (catId) => {
    if (catId === "RESET") {
      setActiveFilters([]);
    } else {
      setActiveFilters((prev) => prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]);
    }
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true);
      try {
        const params = new URLSearchParams({ page: currentPage, limit: ITEMS_PER_PAGE, status: "PUBLISHED" });
        if (activeFilters.length > 0) params.append("categoryId", activeFilters.join(","));
        if (searchQuery) params.append("search", searchQuery);

        const [postsRes, catRes] = await Promise.all([postAPI.getAll(params.toString()), categoryAPI.getAll()]);
        setArticles(postsRes.data || []);
        setTotalPages(postsRes.pagination?.pages || 1);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchData, 400);
    return () => clearTimeout(debounce);
  }, [currentPage, activeFilters, searchQuery]);

  return (
    <main className={`${inter.className} bg-white min-h-screen pb-20`}>
      <PageHeader />

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          <FilterSidebar categories={categories} activeFilters={activeFilters} toggleFilter={toggleFilter} t={t} />

          <div className="lg:w-3/4">
            {/* Top Bar: Search & Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="relative group border-b-2 border-gray-200 focus-within:border-blue-950 transition-colors w-full sm:w-80">
                <input
                  type="text"
                  placeholder={t("insight.search_placeholder") || "Cari artikel..."}
                  className="w-full py-2 pr-10 outline-none bg-transparent text-sm md:text-base"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
                <Search size={18} className="absolute right-0 top-2.5 text-gray-400" />
              </div>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold tracking-widest uppercase mt-2 sm:mt-0">
                Menampilkan {articles.length} Artikel
              </p>
            </div>

            {/* Content List */}
            {loading ? (
              <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-500" size={32} /></div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 md:gap-y-12">
                <AnimatePresence mode="popLayout">
                  {articles.map((article, idx) => {
                    const isHeadline = idx === 0 && currentPage === 1 && !searchQuery && activeFilters.length === 0;
                    return <ArticleCard key={article.id} article={article} isHeadline={isHeadline} language={language} t={t} />;
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 italic text-sm md:text-base">{t("insight.empty") || "Belum ada artikel yang dipublikasikan."}</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 md:gap-2 mt-16">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 md:p-2 text-gray-400 disabled:opacity-20 transition-all hover:text-blue-900"><ChevronLeft size={20} /></button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all ${currentPage === i + 1 ? "bg-blue-950 text-white shadow-md" : "text-gray-400 hover:bg-gray-100"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 md:p-2 text-gray-400 disabled:opacity-20 transition-all hover:text-blue-900"><ChevronRight size={20} /></button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
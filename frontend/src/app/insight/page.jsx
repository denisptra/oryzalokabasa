"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Clock, Loader, ChevronDown } from "lucide-react";
import { postAPI, categoryAPI, getImageUrl } from "@/lib/api";
import { Inter, Playfair_Display } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";
import ImageFallback from "@/components/ImageFallback";

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
  <header className="py-20 px-6 text-center border-b border-gray-50 bg-[#FAFAFA]">
    <motion.div initial="hidden" animate="visible" variants={slowFadeUp} className="max-w-3xl mx-auto">
      {/* Garis dan Tag Wawasan - Serupa dengan Gallery */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="h-[1px] w-full md:w-12 bg-gray-300"></div>
        <p className="text-blue-900 font-bold text-[10px] md:text-xs tracking-[0.15em] uppercase">
          Wawasan & Literasi
        </p>
        <div className="h-[1px] w-full md:w-12 bg-gray-300"></div>
      </div>

      {/* Judul Utama */}
      <h1 className={`${playfair.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-950 mb-6 leading-tight`}>
        Arsip Wawasan & Literasi Budaya
      </h1>

      {/* Subjudul */}
      <p className="text-gray-500 max-w-full mx-auto leading-relaxed text-sm md:text-base px-4">
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
    className={isHeadline ? "col-span-1 md:col-span-2" : "col-span-1 flex flex-col"}
  >
    <Link href={`/insight/${article.slug || article.id}`} className={`group ${isHeadline ? "grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8" : "flex flex-col h-full"}`}>
      {/* Gambar Thumbnail */}
      <div className={`relative rounded-2xl overflow-hidden bg-slate-100 w-full ${isHeadline ? "md:col-span-3 aspect-video" : "aspect-[4/3]"}`}>
        <ImageFallback
          src={article.thumbnail ? getImageUrl(article.thumbnail) : "/Logo-1.png"}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded shadow-sm">
          <span className="text-[9px] md:text-[10px] font-bold text-yellow-700 italic uppercase">
            {article.category?.name || "Artikel"}
          </span>
        </div>
      </div>

      {/* Konten Teks */}
      <div className={`flex flex-col ${isHeadline ? "md:col-span-2 justify-center py-2" : "mt-4 md:mt-5 flex-1"}`}>
        <h3 className={`${playfair.className} font-bold text-blue-950 group-hover:text-blue-700 transition-colors leading-tight mb-3 ${isHeadline ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}`}>
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
            {t("insight.read_time") || "5 MENIT"}
          </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

// ==========================================
// MAIN COMPONENT
// ==========================================

const ITEMS_PER_LOAD = 6;

export default function WawasanPage() {
  const { t, language } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);

  const toggleFilter = (catId) => {
    if (catId === "RESET") {
      setActiveFilters([]);
    } else {
      setActiveFilters((prev) => prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]);
    }
    setVisibleCount(ITEMS_PER_LOAD);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams({ page: 1, limit: 100, status: "PUBLISHED" });
        if (activeFilters.length > 0) params.append("categoryId", activeFilters.join(","));
        if (searchQuery) params.append("search", searchQuery);

        const [postsRes, catRes] = await Promise.all([postAPI.getAll(params.toString()), categoryAPI.getAll()]);
        setArticles(postsRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchData, 400);
    return () => clearTimeout(debounce);
  }, [activeFilters, searchQuery]);

  // Reset visible count when search/filter changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_LOAD);
  }, [activeFilters, searchQuery]);

  const visibleArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;
  const remainingCount = articles.length - visibleCount;

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
                  onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(ITEMS_PER_LOAD); }}
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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 md:gap-y-12">
                  <AnimatePresence mode="popLayout">
                    {visibleArticles.map((article, idx) => {
                      const isHeadline = idx === 0 && visibleCount === ITEMS_PER_LOAD && !searchQuery && activeFilters.length === 0;
                      return <ArticleCard key={article.id} article={article} isHeadline={isHeadline} language={language} t={t} />;
                    })}
                  </AnimatePresence>
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-12">
                    <button
                      onClick={() => setVisibleCount(prev => prev + ITEMS_PER_LOAD)}
                      className="group flex items-center gap-3 px-8 py-3.5 bg-blue-950 text-white rounded-full font-bold text-sm hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl hover:shadow-blue-950/20"
                    >
                      <span>Lihat Lebih Banyak</span>
                      <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs">{remainingCount}</span>
                      <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 italic text-sm md:text-base">{t("insight.empty") || "Belum ada artikel yang dipublikasikan."}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Clock, Loader, ChevronLeft, ChevronRight, X } from "lucide-react";
import { postAPI, categoryAPI, getImageUrl } from "@/lib/api";
import { Inter, Playfair_Display } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

const slowFadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function WawasanPage() {
  const { t, language } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]); // Array untuk multi-select
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const stripHtml = (html) => html?.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ") || "";

  // Fungsi Toggle Multi-Select
  const toggleFilter = (catId) => {
    setActiveFilters((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId) // Hapus jika sudah ada
        : [...prev, catId] // Tambah jika belum ada
    );
    setCurrentPage(1); // Reset ke halaman 1 setiap ganti filter
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          status: "PUBLISHED",
        });

        // Kirim multiple categoryId sebagai string dipisah koma (e.g. "id1,id2")
        if (activeFilters.length > 0) {
          params.append("categoryId", activeFilters.join(","));
        }

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const [postsRes, catRes] = await Promise.all([
          postAPI.getAll(params.toString()),
          categoryAPI.getAll(),
        ]);

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
      <header className="py-20 px-6 text-center border-b border-gray-50">
        <motion.div initial="hidden" animate="visible" variants={slowFadeUp}>
          <span className="text-blue-900 font-bold text-xs tracking-[0.2em] uppercase block mb-4">
            {t("insight.tag")}
          </span>
          <h1 className={`${playfair.className} text-4xl md:text-6xl font-bold text-blue-950 mb-6`}>
            {t("insight.title")}
          </h1>
        </motion.div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* SIDEBAR FILTER */}
          <aside className="lg:w-1/4">
            <div className="sticky top-24 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className={`${playfair.className} text-xl font-bold text-blue-950`}>{t("insight.category")}</h3>
                {activeFilters.length > 0 && (
                  <button
                    onClick={() => setActiveFilters([])}
                    className="text-[10px] text-red-500 font-bold uppercase hover:underline"
                  >
                    {t("insight.reset")}
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-950 focus:ring-blue-900"
                      checked={activeFilters.includes(cat.id)}
                      onChange={() => toggleFilter(cat.id)}
                    />
                    <span className={`text-sm transition-colors ${activeFilters.includes(cat.id) ? "text-blue-900 font-bold" : "text-gray-500 hover:text-blue-700"}`}>
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="lg:w-3/4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              {/* Search Bar */}
              <div className="relative group border-b-2 border-gray-200 focus-within:border-blue-950 transition-colors w-full md:w-80">
                <input
                  type="text"
                  placeholder={t("insight.search_placeholder")}
                  className="w-full py-2 pr-10 outline-none bg-transparent text-sm"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
                <Search size={18} className="absolute right-0 top-2 text-gray-400" />
              </div>

              {/* Info Results */}
              <p className="text-xs text-gray-400 font-medium tracking-wide">
                {typeof t("insight.showing") === "string" ? t("insight.showing").replace("{count}", articles.length) : `MENAMPILKAN ${articles.length} ARTIKEL`}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-500" size={32} /></div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {articles.map((article, idx) => {
                    const isHeadline = idx === 0 && currentPage === 1 && !searchQuery && activeFilters.length === 0;
                    return (
                      <motion.div
                        key={article.id}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={slowFadeUp}
                        className={`${isHeadline ? "md:col-span-3 grid md:grid-cols-3 gap-8 mb-8" : "flex flex-col"}`}
                      >
                        <Link href={`/insight/${article.slug || article.id}`} className="contents group">
                          <div className={`relative rounded-2xl overflow-hidden shrink-0 bg-slate-100 ${isHeadline ? "md:col-span-2 h-80 md:h-[420px]" : "h-52 w-full"}`}>
                            <img
                              src={article.thumbnail ? getImageUrl(article.thumbnail) : "/article-fallback.jpg"}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded shadow-sm">
                              <span className="text-[10px] font-bold text-yellow-700 italic uppercase">
                                {article.category?.name || t("insight.default_category")}
                              </span>
                            </div>
                          </div>
                          <div className={`flex flex-col ${isHeadline ? "md:col-span-1 justify-center" : "mt-6"}`}>
                            <h3 className={`${playfair.className} font-bold text-blue-950 group-hover:text-blue-700 transition-colors leading-tight mb-4 ${isHeadline ? "text-3xl md:text-4xl" : "text-xl"}`}>
                              {article.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                              {stripHtml(article.excerpt || article.content).substring(0, 160)}...
                            </p>
                            <div className="flex items-center gap-4 mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-yellow-600" /> {new Date(article.createdAt).toLocaleDateString(language === "EN" ? "en-US" : "id-ID", { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</span>
                              <span className="flex items-center gap-1.5"><Clock size={14} className="text-yellow-600" /> {t("insight.read_time")}</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 italic">{t("insight.empty")}</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 text-gray-400 disabled:opacity-20 transition-all hover:text-blue-900"><ChevronLeft /></button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === i + 1 ? "bg-blue-950 text-white shadow-lg" : "text-gray-400 hover:bg-gray-100"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 text-gray-400 disabled:opacity-20 transition-all hover:text-blue-900"><ChevronRight /></button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
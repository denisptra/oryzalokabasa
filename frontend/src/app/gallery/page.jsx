"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader, Image as ImageIcon, Calendar, Maximize2 } from "lucide-react";
import { galleryAPI, categoryAPI, getImageUrl } from "@/lib/api";
import { Inter, Playfair_Display } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

const slowFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

const PageHeader = ({ t }) => (
  <header className="py-20 px-6 text-center border-b border-gray-50 bg-[#FAFAFA]">
    <motion.div initial="hidden" animate="visible" variants={slowFadeUp} className="max-w-3xl mx-auto">
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="h-[1px] w-full md:w-12 bg-gray-300"></div>
        <p className="text-blue-900 font-bold text-[10px] md:text-xs tracking-[0.15em] uppercase">
          {t("gallery.tag") || "Galeri"}
        </p>
        <div className="h-[1px] w-full md:w-12 bg-gray-300"></div>
      </div>
      <h1 className={`${playfair.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-950 mb-6 leading-tight`}>
        {t("gallery.title") || "Dokumentasi & Memori"}
      </h1>
      <p className="text-gray-500 max-w-full mx-auto leading-relaxed text-sm md:text-base px-4">
        {t("gallery.desc") || "Kumpulan momen, karya, dan kegiatan yang merekam jejak langkah kami."}
      </p>
    </motion.div>
  </header>
);

const FilterBar = ({ categories, activeCategory, setActiveCategory, searchQuery, setSearchQuery, t }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 pt-8">
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setActiveCategory("all")}
        className={`px-5 py-2 md:px-6 md:py-2.5 text-[11px] md:text-xs font-bold rounded-full transition-all ${activeCategory === "all" ? "bg-blue-950 text-white shadow-md" : "bg-slate-100 text-gray-600 hover:bg-slate-200"}`}
      >
        {t("gallery.all") || "Semua"}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className={`px-5 py-2 md:px-6 md:py-2.5 text-[11px] md:text-xs font-bold rounded-full transition-all ${activeCategory === cat.id ? "bg-blue-950 text-white shadow-md" : "bg-slate-100 text-gray-600 hover:bg-slate-200"}`}
        >
          {cat.name}
        </button>
      ))}
    </div>

    <div className="relative border-b-2 border-gray-200 focus-within:border-blue-950 transition-colors w-full sm:w-72">
      <input
        type="text"
        placeholder={t("gallery.search_placeholder") || "Cari foto..."}
        className="py-2.5 pr-10 outline-none bg-transparent text-sm w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Search size={18} className="absolute right-0 top-3 text-gray-400" />
    </div>
  </motion.div>
);

const GalleryCard = ({ item, onClick, categoryName, formattedDate, t }) => {
  // Antisipasi berbagai kemungkinan nama key gambar dari API
  const imageSource = item.image || item.imageUrl || item.thumbnail;

  return (
    <motion.div layout variants={slowFadeUp} whileHover={{ y: -8 }} className="group cursor-pointer" onClick={() => onClick(item)}>
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-slate-100 aspect-[4/5] shadow-sm group-hover:shadow-xl transition-all duration-500">
        {imageSource ? (
          <img
            src={getImageUrl(imageSource)}
            alt={item.title || "Gallery Item"}
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = "/fallback.jpg"; }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <ImageIcon size={40} className="text-slate-300" />
          </div>
        )}

        {/* Hover Overlay - DIUBAH MENJADI BIRU */}
        {/* from-blue-950/90 (Biru pekat di bawah) via-blue-950/30 (Biru transparan di tengah) */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
          <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-yellow-500 p-1.5 rounded-md text-blue-950"><Maximize2 size={12} /></span>
              {categoryName && (
                <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest border border-yellow-400/30 px-2 py-0.5 rounded">
                  {categoryName}
                </span>
              )}
            </div>
            <h3 className={`${playfair.className} text-white font-bold text-xl md:text-2xl mb-1 line-clamp-2`}>
              {item.title || t("gallery.untitled") || "Tanpa Judul"}
            </h3>
            <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-bold uppercase tracking-widest">
              <Calendar size={12} /> {formattedDate}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PreviewModal = ({ image, onClose, categoryName, formattedDate, t }) => {
  if (!image) return null;
  const imageSource = image.image || image.imageUrl || image.thumbnail;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-blue-950/98 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-10" onClick={onClose}>
      <button className="absolute top-4 right-4 md:top-8 md:right-8 p-2 md:p-3 text-white/50 hover:text-white bg-white/10 rounded-full transition-colors z-50" onClick={onClose}>
        <X size={20} className="md:w-6 md:h-6" />
      </button>

      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-center" onClick={e => e.stopPropagation()}>
        {/* Gambar Preview */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-2xl bg-black/50 flex items-center justify-center relative aspect-[4/3] md:aspect-video lg:aspect-auto lg:h-[75vh]">
          {imageSource ? (
            <img src={getImageUrl(imageSource)} alt={image.title} className="w-full h-full object-contain" />
          ) : (
            <ImageIcon size={60} className="text-white/20" />
          )}
        </div>

        {/* Info Text Preview */}
        <div className="lg:col-span-1 text-white">
          <span className="text-yellow-500 font-black text-[10px] tracking-widest uppercase block mb-3">
            {categoryName || "Galeri"}
          </span>
          <h3 className={`${playfair.className} text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight`}>
            {image.title || t("gallery.untitled") || "Tanpa Judul"}
          </h3>
          <div className="h-1 w-12 bg-yellow-500 mb-6"></div>
          <p className="text-white/70 leading-relaxed mb-8 text-sm md:text-base italic">
            {image.description || t("gallery.no_desc") || "Tidak ada deskripsi tersedia."}
          </p>
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-white/40 uppercase">
            <Calendar size={14} className="text-yellow-500/50" /> {formattedDate}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function GaleriPage() {
  const { t } = useLanguage();
  const [gallery, setGallery] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true);
      try {
        const [galRes, catRes] = await Promise.all([galleryAPI.getAll(), categoryAPI.getAll()]);
        setGallery(galRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error("Error fetching gallery:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredGallery = useMemo(() => {
    return gallery.filter((item) => {
      const matchCat = activeCategory === "all" || item.categoryId === activeCategory;
      const matchSearch = searchQuery === "" || item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [gallery, searchQuery, activeCategory]);

  const getCategoryName = (catId) => categories.find((c) => c.id === catId)?.name || "";
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <main className={`${inter.className} bg-white min-h-screen pb-20`}>
      <PageHeader t={t} />

      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <FilterBar categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} t={t} />

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader className="animate-spin text-blue-500" size={40} /></div>
        ) : (
          <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredGallery.map((item) => (
                <GalleryCard 
                  key={item.id} 
                  item={item} 
                  onClick={setPreviewImage} 
                  categoryName={getCategoryName(item.categoryId)} 
                  formattedDate={formatDate(item.eventDate || item.createdAt)} 
                  t={t} 
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredGallery.length === 0 && (
          <div className="text-center py-20">
            <ImageIcon size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-gray-400 text-sm md:text-base">{gallery.length === 0 ? t("gallery.empty") : t("gallery.no_match")}</p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {previewImage && (
          <PreviewModal 
            image={previewImage} 
            onClose={() => setPreviewImage(null)} 
            categoryName={getCategoryName(previewImage.categoryId)} 
            formattedDate={formatDate(previewImage.eventDate || previewImage.createdAt)} 
            t={t} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}
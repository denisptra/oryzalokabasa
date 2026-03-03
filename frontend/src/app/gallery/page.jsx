"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader, Image as ImageIcon, Calendar, Maximize2 } from "lucide-react";
import { galleryAPI, categoryAPI, getImageUrl } from "@/lib/api";
import { Inter, Playfair_Display } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

// Variabel Animasi
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1 // Gambar muncul bergantian
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
};

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
            setLoading(true);
            try {
                const [galRes, catRes] = await Promise.all([
                    galleryAPI.getAll(),
                    categoryAPI.getAll(),
                ]);
                setGallery(galRes.data || []);
                setCategories(catRes.data || []);
            } catch (err) {
                console.error("Error fetching gallery:", err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredGallery = useMemo(() => {
        return gallery.filter((item) => {
            const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;
            const matchesSearch = searchQuery === "" || 
                item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [gallery, searchQuery, activeCategory]);

    const getCategoryName = (catId) => {
        const cat = categories.find((c) => c.id === catId);
        return cat?.name || "";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric",
        });
    };

    return (
        <main className={`${inter.className} bg-white min-h-screen pb-20`}>
            {/* HEADER */}
            <header className="py-20 px-6 text-center">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-[1px] w-12 bg-gray-300"></div>
                        <p className="text-blue-900 font-bold text-xs tracking-widest uppercase">
                            {t("gallery.tag")}
                        </p>
                        <div className="h-[1px] w-12 bg-gray-300"></div>
                    </div>
                    <h1 className={`${playfair.className} text-4xl md:text-6xl font-bold text-blue-950 mb-6`}>
                        {t("gallery.title")}
                    </h1>
                    <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed text-md">
                        {t("gallery.desc")}
                    </p>
                </motion.div>
            </header>

            <section className="max-w-7xl mx-auto px-6">
                {/* FILTERS & SEARCH */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 border-t border-gray-100 pt-10"
                >
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveCategory("all")}
                            className={`px-6 py-2.5 text-xs font-bold rounded-full transition-all duration-300 ${activeCategory === "all" ? "bg-blue-950 text-white shadow-lg" : "bg-slate-100 text-gray-600 hover:bg-slate-200"}`}
                        >
                            {t("gallery.all")}
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-6 py-2.5 text-xs font-bold rounded-full transition-all duration-300 ${activeCategory === cat.id ? "bg-blue-950 text-white shadow-lg" : "bg-slate-100 text-gray-600 hover:bg-slate-200"}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="relative border-b-2 border-gray-200 focus-within:border-blue-950 transition-colors w-full sm:w-72">
                        <input
                            type="text"
                            placeholder={t("gallery.search_placeholder")}
                            className="py-3 pr-10 outline-none bg-transparent text-sm w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={18} className="absolute right-0 top-3.5 text-gray-400" />
                    </div>
                </motion.div>

                {/* GALLERY GRID */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader className="animate-spin text-blue-500" size={40} />
                    </div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredGallery.map((item) => (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    layout
                                    whileHover={{ y: -8 }}
                                    className="group cursor-pointer"
                                    onClick={() => setPreviewImage(item)}
                                >
                                    <div className="relative rounded-3xl overflow-hidden bg-slate-100 aspect-[4/5] shadow-sm group-hover:shadow-2xl transition-all duration-500">
                                        {item.image ? (
                                            <img
                                                src={getImageUrl(item.image)}
                                                alt={item.title || "Gallery"}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon size={40} className="text-slate-300" />
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-8 flex flex-col justify-end">
                                            <motion.div 
                                                initial={{ y: 20, opacity: 0 }}
                                                whileInView={{ y: 0, opacity: 1 }}
                                                className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                                            >
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="bg-yellow-500 p-1.5 rounded-lg text-blue-950">
                                                        <Maximize2 size={14} />
                                                    </span>
                                                    {getCategoryName(item.categoryId) && (
                                                        <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest border border-yellow-400/30 px-2 py-0.5 rounded">
                                                            {getCategoryName(item.categoryId)}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={`${playfair.className} text-white font-bold text-2xl mb-2`}>
                                                    {item.title || t("gallery.untitled")}
                                                </h3>
                                                <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-tighter">
                                                    <Calendar size={12} /> {formatDate(item.eventDate || item.createdAt)}
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
                
                {!loading && filteredGallery.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="text-center py-20"
                    >
                        <ImageIcon size={64} className="text-slate-200 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">
                            {gallery.length === 0 ? t("gallery.empty") : t("gallery.no_match")}
                        </p>
                    </motion.div>
                )}
            </section>

            {/* MODAL PREVIEW */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-blue-950/98 backdrop-blur-xl z-50 flex items-center justify-center p-4 md:p-10"
                        onClick={() => setPreviewImage(null)}
                    >
                        <motion.button 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute top-8 right-8 p-3 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X size={24} />
                        </motion.button>
                        
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-4 gap-12 items-center" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="lg:col-span-3 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black flex items-center justify-center">
                                <img
                                    src={getImageUrl(previewImage.image)}
                                    alt={previewImage.title}
                                    className="max-h-[75vh] w-auto object-contain"
                                />
                            </div>
                            <div className="lg:col-span-1 text-white pr-4">
                                <motion.span 
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                                    className="text-yellow-500 font-black text-[10px] tracking-[0.3em] uppercase block mb-4"
                                >
                                    {getCategoryName(previewImage.categoryId)}
                                </motion.span>
                                <motion.h3 
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                    className={`${playfair.className} text-4xl font-bold mb-6 leading-tight`}
                                >
                                    {previewImage.title || t("gallery.untitled")}
                                </motion.h3>
                                <motion.div 
                                    initial={{ width: 0 }} animate={{ width: 48 }} transition={{ delay: 0.4, duration: 0.8 }}
                                    className="h-1 bg-yellow-500 mb-8"
                                ></motion.div>
                                <motion.p 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                    className="text-white/70 leading-relaxed mb-10 italic text-lg"
                                >
                                    {previewImage.description || t("gallery.no_desc")}
                                </motion.p>
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                                    className="space-y-4 text-xs font-black tracking-widest text-white/40 uppercase"
                                >
                                    <div className="flex items-center gap-3">
                                        <Calendar size={16} className="text-yellow-500/50" /> {formatDate(previewImage.eventDate || previewImage.createdAt)}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
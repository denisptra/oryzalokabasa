"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import HeroSlider from "@/components/Hero";
import Image from "next/image";
import Link from "next/link";
import { Inter, Playfair_Display } from "next/font/google";
import { postAPI, getImageUrl } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

const slowFadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } 
  }
};

const Home = () => {
  const { t } = useLanguage();
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    postAPI.getAll()
      .then(res => {
        const published = (res.data || []).filter(p => p.status === "PUBLISHED").slice(0, 2);
        setLatestPosts(published);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  // Data Pillar dengan konfigurasi warna bayangan khusus
  const pillars = [
    { 
      title: t("home.pillar_1_title"), 
      icon: "/Icon-1.svg", 
      desc: t("home.pillar_1_desc"), 
      shadow: "shadow-[0_15px_30px_-10px_rgba(251,191,36,0.3)]", // Shadow Kuning
      border: "border-yellow-400" 
    },
    { 
      title: t("home.pillar_2_title"), 
      icon: "/Icon-2.svg", 
      desc: t("home.pillar_2_desc"), 
      shadow: "shadow-[0_15px_30px_-10px_rgba(74,222,128,0.3)]", // Shadow Hijau
      border: "border-green-400" 
    },
    { 
      title: t("home.pillar_3_title"), 
      icon: "/Icon-3.svg", 
      desc: t("home.pillar_3_desc"), 
      shadow: "shadow-[0_15px_30px_-10px_rgba(96,165,250,0.3)]", // Shadow Biru
      border: "border-blue-400" 
    },
  ];

  return (
    <div className={inter.className}>
      <HeroSlider />
      
      <main className="bg-white overflow-hidden">
        {/* SECTION: ABOUT */}
        <section className="py-20 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={slowFadeUp}>
            <span className="text-yellow-600 font-bold uppercase text-sm tracking-widest">{t("home.about_tag")}</span>
            <h2 className={`${playfair.className} text-4xl font-bold text-blue-950 mt-2 mb-6 leading-tight`}>{t("home.about_title")}</h2>
            <div className="text-gray-600 space-y-4 mb-8" dangerouslySetInnerHTML={{ __html: t("home.about_desc1") }} />
            <div className="text-gray-600 space-y-4 mb-8" dangerouslySetInnerHTML={{ __html: t("home.about_desc2") }} />
            <div className="flex gap-12">
              <div>
                <p className={`${playfair.className} text-3xl font-bold text-blue-950`}>37+</p>
                <span className="text-xs text-gray-500 uppercase tracking-widest">{t("home.active_members")}</span>
              </div>
              <div>
                <p className={`${playfair.className} text-3xl font-bold text-blue-950`}>14+</p>
                <span className="text-xs text-gray-500 uppercase tracking-widest">{t("home.art_projects")}</span>
              </div>
            </div>
          </motion.div>
          <motion.div className="relative" initial={{ opacity: 0, scale: 0.95, x: 20 }} whileInView={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 1.5, ease: "easeOut" }} viewport={{ once: true }}>
            <div className="absolute -inset-4 bg-gray-100 rounded-2xl -rotate-2" />
            <Image src="/Community.jpg" alt="Community" width={800} height={450} className="relative z-10 rounded-2xl shadow-xl object-cover h-[400px]" />
          </motion.div>
        </section>

        {/* SECTION: PILAR - Shadow warna logo di sini */}
        <section className="py-24 bg-slate-50 px-6">
          <motion.div className="text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slowFadeUp}>
            <h2 className={`${playfair.className} text-3xl font-bold text-blue-950 mb-4`}>{t("home.pillars_title")}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mb-16">{t("home.pillars_subtitle")}</p>
          </motion.div>
          
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            {pillars.map((pilar, i) => (
              <motion.div 
                key={i} 
                className={`bg-white p-10 rounded-2xl border-b-8 ${pilar.border} ${pilar.shadow} hover:-translate-y-2 transition-all duration-500`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.2 }}
              >
                <Image src={pilar.icon} alt="icon" width={48} height={48} className="mb-6" />
                <h3 className={`${playfair.className} font-bold text-xl mb-3 text-blue-950`}>{pilar.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{pilar.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION: BERITA */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <motion.div className="flex justify-between items-end mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slowFadeUp}>
            <div>
              <h2 className={`${playfair.className} text-3xl font-bold text-blue-950`}>{t("home.news_title")}</h2>
              <p className="text-gray-500 mt-2">{t("home.news_subtitle")}</p>
            </div>
            <Link href="/insight" className="text-gray-500 hover:text-blue-950 font-bold text-sm transition-colors">{t("home.see_all")}</Link>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {loading ? <div className="h-80 bg-slate-100 animate-pulse rounded-3xl" /> : 
              latestPosts.map((post, idx) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: idx * 0.3 }}>
                  <Link href={`/insight/${post.slug || post.id}`} className="group relative h-[400px] rounded-3xl overflow-hidden shadow-lg block">
                    <img src={getImageUrl(post.thumbnail)} alt={post.title} className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                    <div className="absolute inset-0 p-8 flex flex-col justify-between z-20">
                      <span className="bg-white text-yellow-600 text-[10px] font-bold px-4 py-1.5 rounded-full w-fit uppercase">{post.category?.name || "Artikel"}</span>
                      <div>
                        <h3 className={`${playfair.className} text-white text-2xl font-bold`}>{post.title}</h3>
                        <p className="text-white/70 text-sm mt-2 line-clamp-2">{post.excerpt}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION: VIDEO */}
        <motion.section className="py-12 px-6 max-w-7xl mx-auto" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }} viewport={{ once: true }}>
          <div onClick={toggleVideo} className="aspect-video bg-black rounded-[2.5rem] overflow-hidden relative group cursor-pointer shadow-2xl">
            <video ref={videoRef} autoPlay muted loop playsInline controls className="w-full h-full object-cover">
              <source src="/Video-1.mp4" type="video/mp4" />
            </video>
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-md border border-white/50">
                  <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* SECTION: CTA */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <motion.div className="relative bg-[#1A1F4D] rounded-[2.5rem] overflow-hidden shadow-2xl p-16" initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} viewport={{ once: true }}>
            <Image src="/CTA.svg" alt="Pattern" fill className="absolute inset-0 z-0 object-right object-cover opacity-40" />
            <div className="relative z-10 max-w-2xl">
              <h2 className={`${playfair.className} text-4xl font-bold text-white mb-6`}>{t("home.cta_title")}</h2>
              <p className="text-white/80 mb-8 leading-relaxed">{t("home.cta_desc")}</p>
              <Link href="/contact">
                <button className="border-2 border-yellow-600 text-yellow-500 px-10 py-3 rounded-full font-bold hover:bg-yellow-600 hover:text-white transition-all">
                  {t("home.contact_us")}
                </button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Home;
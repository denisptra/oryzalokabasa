"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import HeroSlider from "@/components/Hero";
import Image from "next/image";
import Link from "next/link";
import { Inter, Playfair_Display } from "next/font/google";
import { postAPI, videoAPI, getImageUrl } from "@/lib/api";
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

// ==========================================
// SUB-COMPONENTS (UI TETAP SAMA)
// ==========================================

const AboutSection = ({ t }) => (
  <section className="py-20 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={slowFadeUp}>
      <span className="text-yellow-600 font-bold uppercase text-xs md:text-sm tracking-widest">{t("home.about_tag")}</span>
      <h2 className={`${playfair.className} text-3xl md:text-4xl font-bold text-blue-950 mt-2 mb-6 leading-tight`}>{t("home.about_title")}</h2>
      <div className="text-gray-600 text-sm md:text-base space-y-4 mb-8" dangerouslySetInnerHTML={{ __html: t("home.about_desc1") }} />
      <div className="text-gray-600 text-sm md:text-base space-y-4 mb-8" dangerouslySetInnerHTML={{ __html: t("home.about_desc2") }} />
      <div className="flex gap-8 md:gap-12">
        <div>
          <p className={`${playfair.className} text-2xl md:text-3xl font-bold text-blue-950`}>37+</p>
          <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">{t("home.active_members")}</span>
        </div>
        <div>
          <p className={`${playfair.className} text-2xl md:text-3xl font-bold text-blue-950`}>14+</p>
          <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">{t("home.art_projects")}</span>
        </div>
      </div>
    </motion.div>
    <motion.div className="relative" initial={{ opacity: 0, scale: 0.95, x: 20 }} whileInView={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 1.5, ease: "easeOut" }} viewport={{ once: true }}>
      <div className="absolute -inset-4 bg-gray-100 rounded-2xl -rotate-2" />
      <Image src="/Community.jpg" alt="Community" width={800} height={450} className="relative z-10 rounded-2xl shadow-xl object-cover h-[400px]" />
    </motion.div>
  </section>
);

const PillarsSection = ({ t }) => {
  const pillars = [
    { title: t("home.pillar_1_title"), icon: "/Icon-1.svg", desc: t("home.pillar_1_desc"), shadow: "shadow-[0_15px_30px_-10px_rgba(251,191,36,0.3)]", border: "border-yellow-400" },
    { title: t("home.pillar_2_title"), icon: "/Icon-2.svg", desc: t("home.pillar_2_desc"), shadow: "shadow-[0_15px_30px_-10px_rgba(74,222,128,0.3)]", border: "border-green-400" },
    { title: t("home.pillar_3_title"), icon: "/Icon-3.svg", desc: t("home.pillar_3_desc"), shadow: "shadow-[0_15px_30px_-10px_rgba(96,165,250,0.3)]", border: "border-blue-400" },
  ];

  return (
    <section className="py-24 bg-slate-50 px-6">
      <motion.div className="text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slowFadeUp}>
        <h2 className={`${playfair.className} text-2xl md:text-3xl font-bold text-blue-950 mb-4`}>{t("home.pillars_title")}</h2>
        <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto mb-16">{t("home.pillars_subtitle")}</p>
      </motion.div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {pillars.map((pilar, i) => (
          <motion.div key={i} className={`bg-white p-10 rounded-2xl border-b-8 ${pilar.border} ${pilar.shadow} hover:-translate-y-2 transition-all duration-500`} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.2 }}>
            <Image src={pilar.icon} alt="icon" width={48} height={48} className="mb-6" />
            <h3 className={`${playfair.className} font-bold text-xl mb-3 text-blue-950`}>{pilar.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{pilar.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const NewsSection = ({ t, posts, loading }) => (
  <section className="py-24 px-6 max-w-7xl mx-auto">
    <motion.div className="flex justify-between items-end mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slowFadeUp}>
      <div>
        <h2 className={`${playfair.className} text-2xl md:text-3xl font-bold text-blue-950`}>{t("home.news_title")}</h2>
        <p className="text-sm md:text-base text-gray-500 mt-2">{t("home.news_subtitle")}</p>
      </div>
      <Link href="/insight" className="text-gray-500 hover:text-blue-950 font-bold text-sm transition-colors">{t("home.see_all")}</Link>
    </motion.div>
    <div className="grid md:grid-cols-2 gap-8">
      {loading ? (
        <div className="h-80 bg-slate-100 animate-pulse rounded-3xl md:col-span-2" />
      ) : (
        posts.map((post, idx) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: idx * 0.3 }}>
            <Link href={`/insight/${post.slug || post.id}`} className="group relative h-[300px] md:h-[400px] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg block">
              <img src={post.thumbnail ? getImageUrl(post.thumbnail) : "/fallback.jpg"} alt={post.title} loading="lazy" decoding="async" onError={(e) => { e.target.onerror = null; e.target.src = "/Logo-1.png"; }} className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent z-10" />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-20">
                <span className="bg-white text-yellow-600 text-[9px] md:text-[10px] font-bold px-3 py-1 md:py-1.5 rounded-full w-fit uppercase">{post.category?.name || "Artikel"}</span>
                <div>
                  <h3 className={`${playfair.className} text-white text-xl md:text-2xl font-bold`}>{post.title}</h3>
                  <p className="text-white/70 text-xs md:text-sm mt-2 line-clamp-2">{post.excerpt}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))
      )}
    </div>
  </section>
);

const VideoSection = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Re-load video when videoUrl changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.section className="py-6 md:py-16 px-6 max-w-7xl mx-auto" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }} viewport={{ once: true }}>
      <div onClick={toggleVideo} className="aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden relative group cursor-pointer shadow-2xl">
        <video 
          key={videoUrl || "default"}
          ref={videoRef} 
          autoPlay 
          muted 
          loop 
          playsInline 
          controls 
          className="w-full h-full object-cover"
          src={videoUrl ? getImageUrl(videoUrl) : "/Video-1.mp4"}
        >
        </video>
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-md border border-white/50">
              <div className="w-0 h-0 border-t-15 border-t-transparent border-l-25 border-l-white border-b-15 border-b-transparent ml-2" />
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
};

const CTASection = ({ t }) => (
  <section className="py-8 md:py-24 px-6 max-w-7xl mx-auto">
    <motion.div className="relative bg-[#1A1F4D] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl p-8 md:p-16" initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} viewport={{ once: true }}>
      <Image src="/CTA.svg" alt="Pattern" fill className="absolute inset-0 z-0 object-right object-cover" />
      <div className="relative z-10 max-w-2xl">
        <h2 className={`${playfair.className} text-2xl md:text-4xl font-bold text-white mb-6 uppercase`}>{t("home.cta_title")}</h2>
        <p className="text-white/80 text-sm md:text-base mb-8 leading-relaxed">{t("home.cta_desc")}</p>
        <Link href="/contact">
          <button className="border-2 border-yellow-600 text-yellow-500 px-8 md:px-10 py-2.5 md:py-3 rounded-full font-bold hover:bg-yellow-600 hover:text-white transition-all text-sm md:text-base">
            {t("home.contact_us")}
          </button>
        </Link>
      </div>
    </motion.div>
  </section>
);

// ==========================================
// MAIN COMPONENT
// ==========================================

const Home = () => {
  const { t } = useLanguage();
  const [latestPosts, setLatestPosts] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch posts
    postAPI.getAll()
      .then(res => {
        const published = (res.data || []).filter(p => p.status === "PUBLISHED").slice(0, 2);
        setLatestPosts(published);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    // Fetch video
    videoAPI.getActive()
      .then(res => {
        if (res?.data?.url) setVideoUrl(res.data.url);
      })
      .catch(err => console.warn("Failed to fetch homepage video:", err));
  }, []);

  return (
    <div className={inter.className}>
      <HeroSlider />
      <main className="bg-white overflow-hidden">
        <AboutSection t={t} />
        <PillarsSection t={t} />
        <NewsSection t={t} posts={latestPosts} loading={loading} />
        <VideoSection videoUrl={videoUrl} />
        <CTASection t={t} />
      </main>
    </div>
  );
};

export default Home;
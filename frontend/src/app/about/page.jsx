"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Playfair_Display, Inter } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";
import { teamAPI, getImageUrl } from "@/lib/api";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"] });

const slowFadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

const PhilosophySection = ({ t }) => (
  <section className="py-20 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={slowFadeUp}>
      <h2 className={`${playfair.className} text-4xl font-bold text-blue-950 mb-6`}>{t("about.title")}</h2>
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>{t("about.p1")}</p>
        <p>{t("about.p2")}</p>
      </div>
    </motion.div>
    <motion.div 
      className="relative h-[400px] w-full" 
      initial={{ opacity: 0, scale: 0.95, rotate: 5 }} 
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }} 
      transition={{ duration: 1.5, ease: "easeOut" }} 
      viewport={{ once: true }}
    >
      <div className="absolute inset-0 bg-slate-100 rounded-2xl rotate-3" />
      <div className="absolute inset-0 bg-slate-200 rounded-2xl -rotate-2" />
      <Image src="/Foto-Kantor.png" alt="Kantor" fill className="relative z-10 object-cover rounded-2xl shadow-2xl" />
    </motion.div>
  </section>
);

const TimelineSection = ({ t }) => {
  const timelineData = [
    { year: "2017", title: t("about.timeline_2017_title"), desc: t("about.timeline_2017_desc") },
    { year: "2015", title: t("about.timeline_2015_title"), desc: t("about.timeline_2015_desc") },
    { year: "2012", title: t("about.timeline_2012_title"), desc: t("about.timeline_2012_desc") },
  ];

  return (
    <section className="py-24 bg-slate-50 px-6">
      <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slowFadeUp}>
        <span className="text-yellow-600 font-bold uppercase text-xs tracking-widest">{t("about.history_tag")}</span>
        <h2 className={`${playfair.className} text-4xl font-bold text-blue-950 mt-2`}>{t("about.history_title")}</h2>
        <div className="w-20 h-1 bg-yellow-500 mx-auto mt-4" />
      </motion.div>
      <div className="max-w-4xl mx-auto relative border-l-2 border-yellow-600/30 ml-4 md:mx-auto">
        {timelineData.map((item, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: idx * 0.2 }} viewport={{ once: true }} className="mb-12 ml-8 relative">
            <div className="absolute -left-[41px] top-0 w-4 h-4 bg-yellow-600 rounded-full border-4 border-white" />
            <span className="text-2xl font-bold text-yellow-600">{item.year}</span>
            <h3 className={`${playfair.className} text-xl font-bold text-blue-950 mt-1`}>{item.title}</h3>
            <p className="text-gray-500 mt-2">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const TeamSection = ({ t, teamData }) => {
  // Ensure we show at least 5 people as requested by the user. 
  // If the data from API is empty or less than 5, we fill it with placeholders to show the layout.
  const displayTeam = teamData && teamData.length >= 5 
    ? teamData.slice(0, 5) 
    : [
        ...(teamData || []),
        ...Array(Math.max(0, 5 - (teamData ? teamData.length : 0))).fill({ name: "", role: "", image: null })
      ].slice(0, 5);

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto text-center">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slowFadeUp}>
        <span className="text-yellow-600 font-bold uppercase text-[10px] tracking-[0.4em] mb-4 block opacity-70">
          Our Visionaries
        </span>
        <h2 className={`${playfair.className} text-4xl md:text-5xl font-bold text-blue-950 mb-6 tracking-tight`}>
          {t("about.founders_title")}
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto mb-20 text-lg leading-relaxed">
          {t("about.founders_desc")}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        {displayTeam.map((person, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="group"
          >
            {/* Main Card */}
            <div className="relative aspect-4/5 w-full bg-slate-50 rounded-4xl overflow-hidden border-4 border-white shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.03] group-hover:-rotate-1">
              {person.image ? (
                <img
                  src={getImageUrl(person.image)}
                  alt={person.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => { e.target.onerror = null; e.target.src = "/Logo-1.png"; }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-slate-50 to-slate-200 p-8">
                  <img src="/Logo-1.png" alt="Placeholder" className="w-16 h-16 opacity-10 grayscale mb-4" />
                  <div className="w-8 h-1 bg-blue-900/5 rounded-full" />
                </div>
              )}
              
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-blue-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Info Section */}
            <div className="mt-8 transition-all duration-500 transform group-hover:-translate-y-2">
              <h4 className={`${playfair.className} font-bold text-blue-950 text-xl md:text-2xl leading-tight group-hover:text-blue-700 transition-colors duration-300`}>
                {person.name || "Member Name"}
              </h4>
              <div className="w-6 h-0.5 bg-yellow-500 mx-auto my-3 opacity-30 group-hover:w-10 group-hover:opacity-100 transition-all duration-500" />
              <span className="text-yellow-600 text-[10px] font-black uppercase tracking-[0.25em]">
                {person.role || "Board Member"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function AboutPage() {
  const { t } = useLanguage();
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await teamAPI.getActive();
        setTeamData(res.data || []);
      } catch (err) {
        console.error("Failed to load team data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <main className={`${inter.className} bg-white overflow-hidden`}>
      <PhilosophySection t={t} />
      <TimelineSection t={t} />
      {/* Menunggu data selesai di-fetch sebelum memunculkan animasi tim agar tidak blank */}
      {!loading && <TeamSection t={t} teamData={teamData} />}
    </main>
  );
}
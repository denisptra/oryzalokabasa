"use client";

import Link from "next/link";
import { Inter, Playfair_Display } from "next/font/google";
import { Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

export const Footer = () => {
  const { t } = useLanguage();

  const quickLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.insight"), path: "/insight" },
    { name: t("nav.gallery"), path: "/gallery" },
  ];

  const programs = [
    t("home.pillar_1_title"),
    t("home.pillar_2_title"),
    t("home.pillar_3_title"),
  ];

  return (
    <footer className={`${inter.className} bg-[#1A1F4D] text-white pt-16 pb-8`}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Menggunakan grid 12 kolom agar proporsi jarak lebih mudah dikontrol di Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 border-b border-white/10 pb-12">
          
          {/* SISI KIRI: Branding & Deskripsi (Mengambil 5 kolom) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className={`${playfair.className} text-xl font-bold text-white`}>
              Oryza Lokabasa.
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              {t("footer.about_text")}
            </p>
          </div>

          {/* SISI KANAN: Grid Link, Program, & Kontak (Mengambil 7 kolom) */}
          {/* gap-6 membuat jarak antar 3 kolom ini lebih rapat dan tidak kejauhan */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Tautan Situs */}
            <div>
              <h3 className="font-bold mb-6 text-xs uppercase tracking-[0.2em]">{t("footer.quick_links")}</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                {quickLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link href={link.path} className="hover:text-yellow-500 transition">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Program */}
            <div>
              <h3 className="font-bold mb-6 text-xs uppercase tracking-[0.2em]">{t("footer.program")}</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                {programs.map((prog, idx) => (
                  <li key={idx} className="hover:text-white transition-colors cursor-default">
                    {prog}
                  </li>
                ))}
              </ul>
            </div>

            {/* Hubungi Kami */}
            <div>
              <h3 className="font-bold mb-6 text-xs uppercase tracking-[0.2em]">{t("footer.contact")}</h3>
              <div className="space-y-4 text-sm text-gray-400">
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-yellow-500 shrink-0" />
                  <span>021-7984948</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-yellow-500 shrink-0" />
                  <span>info@oryzalokabasa.com</span>
                </div>
                
                {/* ALAMAT: Dibuat sejajar ikonnya dan teksnya dirapikan */}
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Komp. BSE L11 Jl. Cikoko Barat 1, Pancoran Jak-Sel (12770)
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bagian Bawah: Hak Cipta */}
        <div className="mt-8 text-center text-[10px] text-gray-500 uppercase tracking-[0.3em]">
          {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};
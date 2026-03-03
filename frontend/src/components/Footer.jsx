"use client";

import Link from "next/link";
import { Inter, Playfair_Display } from "next/font/google";
import { Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className={`${inter.className} bg-[#1A1F4D] text-white pt-16 pb-8`}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Grid Utama: 1.5 bagian untuk Deskripsi, 2 bagian untuk Menu (Link, Program, Kontak) */}
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr] gap-12 border-b border-white/10 pb-12">
          
          {/* SISI KIRI: Branding & Deskripsi */}
          <div className="space-y-4">
            <h2 className={`${playfair.className} text-xl font-bold text-white`}>
              Oryza Lokabasa.
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              {t("footer.about_text")}
            </p>
          </div>

          {/* SISI KANAN: Grid untuk Link, Program, dan Kontak (Berdekatan) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* Tautan Situs */}
            <div>
              <h3 className="font-bold mb-6 text-xs uppercase tracking-[0.2em]">{t("footer.quick_links")}</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-yellow-500 transition">{t("nav.home")}</Link></li>
                <li><Link href="/about" className="hover:text-yellow-500 transition">{t("nav.about")}</Link></li>
                <li><Link href="/insight" className="hover:text-yellow-500 transition">{t("nav.insight")}</Link></li>
                <li><Link href="/gallery" className="hover:text-yellow-500 transition">{t("nav.gallery")}</Link></li>
              </ul>
            </div>

            {/* Program */}
            <div>
              <h3 className="font-bold mb-6 text-xs uppercase tracking-[0.2em]">{t("footer.program")}</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="hover:text-white transition-colors cursor-default">{t("home.pillar_1_title")}</li>
                <li className="hover:text-white transition-colors cursor-default">{t("home.pillar_2_title")}</li>
                <li className="hover:text-white transition-colors cursor-default">{t("home.pillar_3_title")}</li>
              </ul>
            </div>

            {/* Hubungi Kami */}
            <div>
              <h3 className="font-bold mb-6 text-xs uppercase tracking-[0.2em]">{t("footer.contact")}</h3>
              <div className="space-y-4 text-sm text-gray-400">
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-yellow-500 shrink-0" />
                  <span>+62 878 7245 0987</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-yellow-500 shrink-0" />
                  <span>info@oryzalokabasa.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                  <span className="leading-tight text-xs">Jl. Menteng Dalam No. 22, Jakarta Pusat</span>
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
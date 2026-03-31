"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Inter, Playfair_Display } from "next/font/google";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSliderAPI, getImageUrl } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

// Aktifkan fallback ini. Jika API gagal/kosong, web tidak akan nge-blank.
const FALLBACK_SLIDES = [
    {
        title: "Menghidupkan Warisan Nusantara di ",
        highlight: "Panggung Dunia",
        subtitle: "Komunitas seni dan budaya yang mengolah bahasa, sastra, dan seni pertunjukan sebagai ruang dialog antar tradisi dan zaman.",
        imageUrl: "/Hero-1.jpg",
    },
    {
        title: "Merawat Bahasa, Menguatkan Identitas ",
        highlight: "Generasi Muda",
        subtitle: "Kami menghadirkan ruang belajar dan kolaborasi kreatif untuk membangun kesadaran budaya di era digital.",
        imageUrl: "/Hero-3.jpg",
    }
];

export default function HeroSlider() {
    const { t } = useLanguage();
    const [slides, setSlides] = useState(FALLBACK_SLIDES);
    const [current, setCurrent] = useState(0);

    // Fetch API
    useEffect(() => {
        heroSliderAPI.getActive()
            .then(res => {
                if (res?.data?.length > 0) setSlides(res.data);
            })
            .catch(err => console.error("API error, using fallback:", err));
    }, []);

    // Auto slide
    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    // Logika Next & Prev dijadikan 1 fungsi
    const changeSlide = (step) => {
        setCurrent(prev => (prev + step + slides.length) % slides.length);
    };

    const slide = slides[current] || {};

    return (
        <section className="relative h-[90vh] flex items-center justify-center text-center px-6 overflow-hidden bg-black">

            {slides.map((s, idx) => (
                <img
                    key={idx}
                    src={s.imageUrl || s.image ? getImageUrl(s.imageUrl || s.image) : "/Hero-1.jpg"}
                    alt={s.title || "Hero Slide"}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${current === idx ? "opacity-100" : "opacity-0"
                        }`}
                    onError={(e) => { e.target.onerror = null; e.target.src = "/Hero-1.jpg"; }}
                />
            ))}

            {/* Overlay Gelap */}
            <div className="absolute inset-0 bg-black/70 z-10" />

            {/* Konten Text */}
            <div className="relative z-20 max-w-4xl px-4">
                <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 ${playfair.className} leading-tight`}>
                    {slide.title} <span className="text-oryza-gold">{slide.highlight}</span>
                </h1>

                <p className={`${inter.className} text-gray-200 text-sm md:text-base lg:text-lg mb-8 max-w-2xl mx-auto px-2`}>
                    {slide.subtitle || slide.description}
                </p>

                <Link
                    href={slide.link || "#"}
                    className={`${inter.className} px-6 py-2.5 md:px-8 md:py-3 border border-white text-white rounded-full hover:bg-white hover:text-black transition inline-block text-sm md:text-base font-medium uppercase tracking-widest`}
                >
                    {t("hero.explore") || "Explore"}
                </Link>
            </div>

            {/* Panah Navigasi */}
            {slides.length > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 z-30 pointer-events-none">
                    <button
                        onClick={() => changeSlide(-1)}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/30 hover:scale-110 active:scale-95 transition-all pointer-events-auto"
                    >
                        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                    </button>

                    <button
                        onClick={() => changeSlide(1)}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/30 hover:scale-110 active:scale-95 transition-all pointer-events-auto"
                    >
                        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                    </button>
                </div>
            )}

            {/* Dots Indicator */}
            {slides.length > 1 && (
                <div className="absolute bottom-8 flex gap-3 z-30">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${current === idx ? "bg-oryza-gold scale-125" : "bg-white/40 hover:bg-white/60"
                                }`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
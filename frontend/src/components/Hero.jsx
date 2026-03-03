"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { heroSliderAPI, getImageUrl } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

// Fallback slides ketika API belum ada data
const FALLBACK_SLIDES = [
    // {
    //     title: "Menghidupkan Warisan Nusantara di ",
    //     highlight: "Panggung Dunia",
    //     subtitle:
    //         "Komunitas seni dan budaya yang mengolah bahasa, sastra, dan seni pertunjukan sebagai ruang dialog antar tradisi dan zaman.",
    //     imageUrl: "/Hero-1.jpg",
    // },
    // {
    //     title: "Merawat Bahasa, Menguatkan Identitas ",
    //     highlight: "Generasi Muda",
    //     subtitle:
    //         "Kami menghadirkan ruang belajar dan kolaborasi kreatif untuk membangun kesadaran budaya di era digital.",
    //     imageUrl: "/Hero-2.jpg",
    // },
    // {
    //     title: "Kolaborasi Seni dalam ",
    //     highlight: "Ruang Global",
    //     subtitle:
    //         "Menghubungkan tradisi lokal dengan perspektif internasional melalui karya dan pertunjukan.",
    //     imageUrl: "/Hero-3.jpg",
    // },
];

export default function HeroSlider() {
    const { t } = useLanguage();
    const [slides, setSlides] = useState(FALLBACK_SLIDES);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch active sliders from API
    useEffect(() => {
        const fetchSliders = async () => {
            try {
                const res = await heroSliderAPI.getActive();
                if (res.data && res.data.length > 0) {
                    setSlides(res.data);
                }
            } catch (err) {
                console.log("Using fallback slides:", err.message);
                // Keep fallback slides
            } finally {
                setLoading(false);
            }
        };
        fetchSliders();
    }, []);

    // Auto slide
    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const currentSlide = slides[current] || {};

    // Parse title & highlight from API data
    const getTitle = (slide) => {
        // If slide has separate title/highlight fields (fallback format)
        if (slide.highlight) return slide.title;
        // From API: title might be the full title
        return slide.title || "";
    };

    const getHighlight = (slide) => {
        if (slide.highlight) return slide.highlight;
        return "";
    };

    const getDescription = (slide) => {
        return slide.subtitle || slide.description || "";
    };

    const getImage = (slide) => {
        const raw = slide.imageUrl || slide.image || "/Hero-1.jpg";
        return getImageUrl(raw);
    };

    return (
        <section className="relative h-[90vh] flex items-center justify-center text-center px-6 overflow-hidden">
            {/* Background Images */}
            {slides.map((slide, index) => {
                const imgSrc = getImage(slide);
                const isExternal = imgSrc.startsWith("http");
                return isExternal ? (
                    <img
                        key={index}
                        src={imgSrc}
                        alt="Hero Background"
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${current === index ? "opacity-100" : "opacity-0"
                            }`}
                    />
                ) : (
                    <Image
                        key={index}
                        src={imgSrc}
                        alt="Hero Background"
                        fill
                        priority={index === 0}
                        className={`object-cover transition-opacity duration-1000 ${current === index ? "opacity-100" : "opacity-0"
                            }`}
                    />
                );
            })}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/80 z-10"></div>

            {/* Content */}
            <div className="relative z-20 max-w-4xl">
                <h1
                    className={`text-5xl md:text-5xl lg:text-6xl font-bold text-white mb-4 ${playfair.className}`}
                >
                    {getTitle(currentSlide)}
                    {getHighlight(currentSlide) && (
                        <span className="text-oryza-gold">
                            {getHighlight(currentSlide)}
                        </span>
                    )}
                </h1>

                <p
                    className={`${inter.className} text-gray-200 mb-8 max-w-2xl mx-auto`}
                >
                    {getDescription(currentSlide)}
                </p>

                {currentSlide.buttonText ? (
                    <a
                        href={currentSlide.buttonLink || "#"}
                        className={`${inter.className} px-8 py-2 border border-white text-white rounded-full hover:bg-white hover:text-black transition inline-block`}
                    >
                        {currentSlide.buttonText}
                    </a>
                ) : (
                    <button
                        className={`${inter.className} px-8 py-2 border border-white text-white rounded-full hover:bg-white hover:text-black transition`}
                    >
                        {t("hero.explore")}
                    </button>
                )}
            </div>

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 z-30 pointer-events-none">
                    <motion.button
                        whileHover={{
                            scale: 1.1,
                            backgroundColor: "rgba(255, 255, 255, 0.3)",
                        }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevSlide}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 transition-colors pointer-events-auto shadow-lg"
                    >
                        <ChevronLeft size={32} strokeWidth={1.5} />
                    </motion.button>

                    <motion.button
                        whileHover={{
                            scale: 1.1,
                            backgroundColor: "rgba(255, 255, 255, 0.3)",
                        }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextSlide}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 transition-colors pointer-events-auto shadow-lg"
                    >
                        <ChevronRight size={32} strokeWidth={1.5} />
                    </motion.button>
                </div>
            )}

            {/* Dots */}
            <div className="absolute bottom-6 flex gap-3 z-30">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-3 h-3 rounded-full transition ${current === index ? "bg-oryza-gold scale-125" : "bg-white/40"
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}

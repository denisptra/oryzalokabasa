"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sembunyikan loading screen setelah 1.5 detik
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FFFFFF]"
        >
          <div className="text-center flex flex-col items-center">
            {/* ANIMASI LOGO */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="mb-8"
            >
              <Image
                src="/Logo-1.png" // Menggunakan Logo yang benar
                alt="Logo Oryza Lokabasa"
                width={120}
                height={120}
                priority
                className="drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              />
            </motion.div>

            {/* PROGRESS BAR */}
            <div className="w-48 h-[2px] bg-white/10 relative overflow-hidden rounded-full mt-4">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="absolute inset-0 bg-[#EBA100]"
              />
            </div>

            {/* STATUS TEXT (Inter) */}
            <p className={`${inter.className} text-[#EBA100] text-[10px] tracking-[0.3em] uppercase mt-5 font-bold opacity-80 animate-pulse`}>
              Memuat Warisan Budaya
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
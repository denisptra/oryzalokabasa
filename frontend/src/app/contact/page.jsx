"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { contactAPI } from "@/lib/api";
import { Inter, Playfair_Display } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

// ==========================================
// SUB-COMPONENTS
// ==========================================

const ContactInfoItem = ({ icon: Icon, title, value }) => (
  <div className="flex items-start gap-3 md:gap-4">
    <div className="bg-yellow-500 p-2.5 md:p-3 rounded-full text-blue-950 shrink-0 mt-1">
      <Icon size={18} className="md:w-5 md:h-5" />
    </div>
    <div>
      <h4 className="font-bold text-base md:text-lg mb-1">{title}</h4>
      <p className="text-sm text-blue-100 opacity-80 leading-relaxed max-w-[250px]">{value}</p>
    </div>
  </div>
);

const FormField = ({ label, type = "text", placeholder, value, onChange, isTextArea }) => (
  <div className="space-y-1.5 md:space-y-2">
    <label className="text-[11px] md:text-sm font-bold text-blue-950 uppercase tracking-wider">{label}</label>
    {isTextArea ? (
      <textarea
        rows="4"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3 px-5 md:py-4 md:px-6 text-sm md:text-base focus:border-yellow-500 focus:bg-white outline-none transition-all resize-none"
        required
      />
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3 px-5 md:py-4 md:px-6 text-sm md:text-base focus:border-yellow-500 focus:bg-white outline-none transition-all"
        required
      />
    )}
  </div>
);

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function KontakPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ sending: false, success: "", error: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ sending: true, success: "", error: "" });

    try {
      await contactAPI.send(formData);
      setStatus({ sending: false, success: t("contact.success_msg") || "Pesan berhasil dikirim!", error: "" });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus(s => ({ ...s, success: "" })), 5000);
    } catch (err) {
      setStatus({ sending: false, success: "", error: err.message || t("contact.error_msg") || "Gagal mengirim pesan." });
      setTimeout(() => setStatus(s => ({ ...s, error: "" })), 5000);
    }
  };

  return (
    <main className={`${inter.className} bg-slate-50 min-h-screen py-12 md:py-20 px-4 md:px-6`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          {/* SISI KIRI: INFORMASI & MAPS */}
          <div className="bg-[#1A1F4D] w-full md:w-[45%] p-8 md:p-14 lg:p-16 text-white relative">
            <span className="text-yellow-500 font-bold uppercase text-[10px] md:text-xs tracking-widest">
              {t("contact.tag") || "HUBUNGI KAMI"}
            </span>
            <h1 className={`${playfair.className} text-3xl md:text-4xl lg:text-5xl font-bold mt-3 mb-4 md:mb-6 leading-tight`} dangerouslySetInnerHTML={{ __html: t("contact.title") || "Mari <br/>Berbincang." }}></h1>
            <p className="text-blue-100 mb-8 md:mb-10 leading-relaxed opacity-90 text-sm md:text-base">
              {t("contact.desc") || "Punya pertanyaan seputar program, kemitraan, atau ingin berkolaborasi? Jangan ragu untuk menyapa kami."}
            </p>

            {/* Google Maps Embed */}
            <div className="w-full h-48 md:h-56 rounded-2xl mb-8 md:mb-10 overflow-hidden border border-white/20 shadow-inner bg-slate-800 relative group">
              <iframe 
                src="https://maps.google.com/maps?q=Jl.%20Cikoko%20Barat%201,%20Pancoran,%20Jakarta%20Selatan&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
              ></iframe>
            </div>

            {/* List Kontak Info */}
            <div className="space-y-6">
              <ContactInfoItem 
                icon={MapPin} 
                title={t("contact.address_title") || "Alamat Kami"} 
                value="Komp. BSE L11 Jl. Cikoko Barat 1, Pancoran Jak-Sel (12770)" 
              />
              <ContactInfoItem 
                icon={Mail} 
                title={t("contact.email_title") || "Email Utama"} 
                value="info@oryzalokabasa.com" 
              />
              <ContactInfoItem 
                icon={Phone} 
                title={t("contact.phone_title") || "Telepon"} 
                value="021-7984948" 
              />
            </div>
          </div>

          {/* SISI KANAN: FORMULIR */}
          <div className="w-full md:w-[55%] p-8 md:p-14 lg:p-20 bg-white">
            <h2 className={`${playfair.className} text-2xl md:text-3xl lg:text-4xl font-bold text-blue-950 mb-3 md:mb-4`}>
              {t("contact.form_title") || "Kirim Pesan"}
            </h2>
            <p className="text-gray-500 mb-8 md:mb-10 leading-relaxed text-sm md:text-base">
              {t("contact.form_desc") || "Isi formulir di bawah ini dan tim kami akan segera membalas pesan Anda."}
            </p>

            {/* Alert Status */}
            {status.success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="text-emerald-600 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-emerald-700 text-xs md:text-sm font-medium">{status.success}</p>
              </div>
            )}

            {status.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-red-700 text-xs md:text-sm font-medium">{status.error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              <FormField label={t("contact.label_name") || "Nama Lengkap"} placeholder={t("contact.placeholder_name") || "Masukkan nama Anda"} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <FormField label={t("contact.label_email") || "Alamat Email"} type="email" placeholder={t("contact.placeholder_email") || "email@anda.com"} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <FormField label={t("contact.label_subject") || "Subjek Pesan"} placeholder={t("contact.placeholder_subject") || "Apa yang ingin didiskusikan?"} value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
              <FormField label={t("contact.label_message") || "Isi Pesan"} placeholder={t("contact.placeholder_message") || "Tuliskan pesan Anda secara detail di sini..."} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} isTextArea />

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={status.sending}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-bold py-4 md:py-5 rounded-full shadow-lg transition-all text-sm md:text-base mt-2 md:mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status.sending ? (
                  <><Loader size={18} className="animate-spin" /> {t("contact.btn_sending") || "Mengirim..."}</>
                ) : (
                  t("contact.btn_send") || "Kirim Pesan Sekarang"
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
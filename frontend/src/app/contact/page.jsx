"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { contactAPI } from "@/lib/api";
// Import font
import { Inter, Playfair_Display } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";

// Inisialisasi font
const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

export default function KontakPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    setSuccess("");

    try {
      await contactAPI.send(formData);
      setSuccess(t("contact.success_msg"));
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message || t("contact.error_msg"));
      setTimeout(() => setError(""), 5000);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className={`${inter.className} bg-slate-50 min-h-screen py-20 px-6`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          {/* SISI KIRI: INFORMASI */}
          <div className="bg-[#1A1F4D] w-full md:w-[40%] p-10 md:p-16 text-white relative">
            <span className="text-yellow-500 font-bold uppercase text-xs tracking-widest">
              {t("contact.tag")}
            </span>
            <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold mt-4 mb-6 leading-tight`} dangerouslySetInnerHTML={{ __html: t("contact.title") }}></h1>
            <p className="text-blue-100 mb-12 leading-relaxed opacity-90 text-md">
              {t("contact.desc")}
            </p>

            <div className="bg-white/5 w-full h-48 rounded-2xl mb-12 border border-white/10 flex items-center justify-center">
              <MapPin className="text-yellow-500/50" size={40} />
              <span className="text-xs text-blue-200 ml-2 uppercase tracking-widest font-bold">{t("contact.map")}</span>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-500 p-3 rounded-full text-blue-950 shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{t("contact.address_title")}</h4>
                  <p className="text-sm text-blue-100 opacity-80">
                    {t("contact.address_val")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-yellow-500 p-3 rounded-full text-blue-950 shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{t("contact.email_title")}</h4>
                  <p className="text-sm text-blue-100 opacity-80">
                    info@oryzalokabasa.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-yellow-500 p-3 rounded-full text-blue-950 shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{t("contact.phone_title")}</h4>
                  <p className="text-sm text-blue-100 opacity-80">
                    +62 871 8989 9389
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SISI KANAN: FORMULIR */}
          <div className="w-full md:w-[60%] p-10 md:p-20 bg-white">
            <h2 className={`${playfair.className} text-3xl md:text-4xl font-bold text-blue-950 mb-4`}>
              {t("contact.form_title")}
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
              {t("contact.form_desc")}
            </p>

            {/* Alert Status */}
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="text-emerald-600 mt-0.5 flex-shrink-0" size={20} />
                <p className="text-emerald-700 text-sm font-medium">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-950 uppercase tracking-wider">{t("contact.label_name")}</label>
                <input
                  type="text"
                  placeholder={t("contact.placeholder_name")}
                  value={formData.name}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-4 px-6 focus:border-yellow-500 focus:bg-white outline-none transition-all"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-950 uppercase tracking-wider">{t("contact.label_email")}</label>
                <input
                  type="email"
                  placeholder={t("contact.placeholder_email")}
                  value={formData.email}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-4 px-6 focus:border-yellow-500 focus:bg-white outline-none transition-all"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-950 uppercase tracking-wider">{t("contact.label_subject")}</label>
                <input
                  type="text"
                  placeholder={t("contact.placeholder_subject")}
                  value={formData.subject}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-4 px-6 focus:border-yellow-500 focus:bg-white outline-none transition-all"
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-950 uppercase tracking-wider">{t("contact.label_message")}</label>
                <textarea
                  rows="4"
                  placeholder={t("contact.placeholder_message")}
                  value={formData.message}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-4 px-6 focus:border-yellow-500 focus:bg-white outline-none transition-all resize-none"
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={sending}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-bold py-5 rounded-full shadow-lg transition-all text-md mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    {t("contact.btn_sending")}
                  </>
                ) : (
                  t("contact.btn_send")
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
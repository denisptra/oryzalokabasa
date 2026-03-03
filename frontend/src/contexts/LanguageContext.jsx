"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Teks terjemahan statis untuk seluruh situs (Contoh untuk Navbar/Footer/Hero)
const translations = {
    ID: {
        nav: {
            home: "Beranda",
            about: "Tentang Kami",
            insight: "Wawasan",
            gallery: "Galeri",
            contact: "Kontak",
        },
        hero: {
            title: "Menghidupkan Warisan Nusantara <br/> di Panggung Dunia",
            subtitle: "Komunitas seni budaya yang menggabungkan tradisi dan seni pertunjukan sebagai ruang dialog kreatif lintas zaman.",
            explore: "Jelajahi Kami →",
        },
        home: {
            about_tag: "SAPA KAMI",
            about_title: "Membawa Tradisi ke Panggung Modern",
            about_desc1: "Didirikan pada tahun 2012, Oryza Lokabasa merupakan komunitas seni, budaya, dan bahasa yang berawal dari pusat kursus bahasa dan berkembang menjadi ruang kolaborasi kreatif lintas disiplin.",
            about_desc2: "Melalui pertunjukan teater, musik, film, dan kegiatan literasi budaya, Oryza Lokabasa menghadirkan interpretasi modern atas karya-karya klasik dan tradisi Nusantara, dengan tujuan menjangkau audiens lokal hingga internasional.",
            active_members: "ANGGOTA AKTIF",
            art_projects: "PROYEK SENI",
            pillars_title: "Pilar Kegiatan Budaya",
            pillars_subtitle: "Tiga bidang utama yang menjadi fondasi kerja Oryza Lokabasa.",
            pillar_1_title: "Bahasa & Sastra",
            pillar_1_desc: "Bahasa sebagai identitas budaya yang dihidupkan melalui diskusi dan penulisan kreatif.",
            pillar_2_title: "Seni Pertunjukan",
            pillar_2_desc: "Teater dan karya panggung sebagai ruang interpretasi tradisi masa kini.",
            pillar_3_title: "Musik & Aransemen",
            pillar_3_desc: "Eksplorasi musik tradisional dengan pendekatan modern lintas zaman.",
            news_title: "Berita Terbaru",
            news_subtitle: "Catatan kegiatan, pertunjukan, dan proses kreatif Oryza Lokabasa.",
            see_all: "Lihat Semua →",
            cta_title: "Mari Menjaga Budaya Bersama",
            cta_desc: "Oryza Lokabasa membuka ruang bagi siapa pun yang ingin belajar, berkarya, dan berkolaborasi menjaga warisan Nusantara.",
            contact_us: "Hubungi Kami"
        },
        about: {
            title: "Filosofi & Nilai",
            p1: "Komunitas ini terdiri dari berbagai kelompok, termasuk pemeran panggung untuk pertunjukan teater, band musik untuk aransemen tradisional dan modern, serta pembuat film dan dokumenter. Oryza Lokabasa beroperasi sebagai Organisasi Non-Profit di bawah badan hukum P.T. Kurnia Oryza Reksa Perkasa.",
            p2: "Misi utama kami adalah menjangkau masyarakat lokal hingga mancanegara untuk memperkenalkan warisan budaya nasional Indonesia kepada dunia melalui interpretasi modern dari karya-karya klasik.",
            history_tag: "Sejarah Kami",
            history_title: "Perjalanan Oryza Lokabasa",
            founders_title: "Temui Pendiri Kami",
            founders_desc: "Orang-orang di balik perjalanan Oryza Lokabasa yang memastikan setiap proses kreatif berjalan dengan nilai yang sama.",
            timeline_2017_title: "Debut Panggung",
            timeline_2017_desc: "Produksi perdana kami yang mengguncang panggung: Romeo & Juliet dan Nyai Dasima.",
            timeline_2015_title: "Pengembangan Komunitas",
            timeline_2015_desc: "Fase dimana kami mulai merekrut bakat-bakat muda dan menyusun kurikulum pelatihan teater.",
            timeline_2012_title: "Pendirian Awal",
            timeline_2012_desc: "Oryza Lokabasa (O.L) didirikan pada Oktober 2012 sebagai pusat kursus bahasa.",
            team_founder: "Founder",
            team_ketua: "Ketua",
            team_wakil: "Wakil Ketua",
            team_sekre: "Sekretaris"
        },
        contact: {
            tag: "Hubungi Kami",
            title: "Mari <br /> Berkolaborasi",
            desc: "Kami menantikan kolaborasi dan pertanyaan Anda. Temukan kami di lokasi berikut untuk melestarikan warisan teater.",
            map: "Peta Lokasi",
            address_title: "Alamat",
            address_val: "Jl. Menteng Dalam No. 22, Jakarta Pusat, DKI Jakarta",
            email_title: "Email",
            phone_title: "Telepon",
            form_title: "Sapa Kami",
            form_desc: "Silahkan tinggalkan pesan untuk kolaborasi, pembelian tiket, atau pertanyaan umum.",
            success_msg: "Pesan Anda berhasil terkirim! Kami akan segera menghubungi Anda.",
            error_msg: "Gagal mengirim pesan. Coba lagi nanti.",
            label_name: "Nama Lengkap",
            placeholder_name: "Masukkan nama lengkap Anda",
            label_email: "Email",
            placeholder_email: "nama@email.com",
            label_subject: "Subjek / Topik",
            placeholder_subject: "Apa yang ingin Anda bicarakan?",
            label_message: "Pesan",
            placeholder_message: "Tuliskan detail pesan Anda di sini...",
            btn_sending: "Sedang Mengirim...",
            btn_send: "Kirim Pesan Sekarang"
        },
        gallery: {
            tag: "Arsip Visual",
            title: "Galeri Komunitas",
            desc: "Menelusuri jejak estetika melalui lensa kamera. Kumpulan momen dari panggung pertunjukkan, ruang latihan, hingga ekspresi budaya visual indonesia.",
            all: "Semua",
            search_placeholder: "Cari foto...",
            empty: "Belum ada foto di galeri",
            no_match: "Tidak ada foto yang cocok dengan pencarian",
            untitled: "Tanpa Judul",
            no_desc: "Tidak ada deskripsi untuk foto ini.",
            modal_category: "KATEGORI:",
            modal_date: "TANGGAL:"
        },
        insight: {
            tag: "Wawasan & Literasi",
            title: "Arsip Wawasan & Literasi Budaya",
            category: "Kategori",
            reset: "Reset",
            search_placeholder: "Cari judul atau isi artikel...",
            showing: "MENAMPILKAN {count} ARTIKEL",
            default_category: "Liputan",
            read_time: "5 MENIT",
            empty: "Tidak ada artikel yang ditemukan."
        },
        footer: {
            about_text: "Oryza Lokabasa adalah wadah bagi kolaborasi seni dan pelestarian budaya Nusantara melalui media modern untuk menjangkau generasi masa kini.",
            quick_links: "Tautan",
            program: "Program",
            contact: "Hubungi Kami",
            rights: "© 2024 Oryza Lokabasa. All Rights Reserved.",
        }
    },
    EN: {
        nav: {
            home: "Home",
            about: "About Us",
            insight: "Insights",
            gallery: "Gallery",
            contact: "Contact",
        },
        hero: {
            title: "Bringing Nusantara's Heritage <br/> to the World Stage",
            subtitle: "An arts and culture community that combines tradition and performing arts as a space for creative dialogue across eras.",
            explore: "Explore More →",
        },
        home: {
            about_tag: "WHO WE ARE",
            about_title: "Bringing Tradition to the Modern Stage",
            about_desc1: "Founded in 2012, Oryza Lokabasa is an arts, culture, and language community that started as a language course center and evolved into a cross-disciplinary creative collaboration space",
            about_desc2: "Through theater, music, film, and cultural literacy activities, Oryza Lokabasa presents modern interpretations of classical works and Indonesian traditions, aiming to reach local and international audiences.",
            active_members: "ACTIVE MEMBERS",
            art_projects: "ART PROJECTS",
            pillars_title: "Pillars of Cultural Activity",
            pillars_subtitle: "Three main areas that form the foundation of Oryza Lokabasa's work.",
            pillar_1_title: "Language & Literature",
            pillar_1_desc: "Language as a cultural identity brought to life through discussions and creative writing.",
            pillar_2_title: "Performing Arts",
            pillar_2_desc: "Theater and stage works as a space for interpreting modern-day traditions.",
            pillar_3_title: "Music & Arrangement",
            pillar_3_desc: "Exploring traditional music with a modern approach across eras.",
            news_title: "Latest News",
            news_subtitle: "Notes on Oryza Lokabasa's activities, performances, and creative process.",
            see_all: "See All →",
            cta_title: "Let's Preserve Culture Together",
            cta_desc: "Oryza Lokabasa provides a space for anyone who wants to learn, create, and collaborate to protect the heritage of the Archipelago.",
            contact_us: "Contact Us"
        },
        about: {
            title: "Philosophy & Values",
            p1: "This community consists of various groups, including stage actors for theatrical performances, music bands for traditional and modern arrangements, as well as filmmakers and documentarians. Oryza Lokabasa operates as a Non-Profit Organization under the legal entity of P.T. Kurnia Oryza Reksa Perkasa.",
            p2: "Our main mission is to reach local and international communities to introduce Indonesia's national cultural heritage to the world through modern interpretations of classical works.",
            history_tag: "Our History",
            history_title: "The Journey of Oryza Lokabasa",
            founders_title: "Meet Our Founders",
            founders_desc: "The people behind Oryza Lokabasa's journey who ensure every creative process runs with the same values.",
            timeline_2017_title: "Stage Debut",
            timeline_2017_desc: "Our inaugural productions that rocked the stage: Romeo & Juliet and Nyai Dasima.",
            timeline_2015_title: "Community Development",
            timeline_2015_desc: "The phase where we started recruiting young talents and compiling a theater training curriculum.",
            timeline_2012_title: "Early Establishment",
            timeline_2012_desc: "Oryza Lokabasa (O.L) was founded in October 2012 as a language course center.",
            team_founder: "Founder",
            team_ketua: "Chairman",
            team_wakil: "Vice Chairman",
            team_sekre: "Secretary"
        },
        contact: {
            tag: "Contact Us",
            title: "Let's <br /> Collaborate",
            desc: "We look forward to your collaborations and inquiries. Find us at the following locations to preserve theatrical heritage.",
            map: "Location Map",
            address_title: "Address",
            address_val: "Jl. Menteng Dalam No. 22, Central Jakarta, DKI Jakarta",
            email_title: "Email",
            phone_title: "Phone",
            form_title: "Greet Us",
            form_desc: "Please leave a message for collaboration, ticket purchases, or general inquiries.",
            success_msg: "Your message has been sent successfully! We will contact you shortly.",
            error_msg: "Failed to send message. Please try again later.",
            label_name: "Full Name",
            placeholder_name: "Enter your full name",
            label_email: "Email",
            placeholder_email: "name@email.com",
            label_subject: "Subject / Topic",
            placeholder_subject: "What would you like to discuss?",
            label_message: "Message",
            placeholder_message: "Write your message details here...",
            btn_sending: "Sending...",
            btn_send: "Send Message Now"
        },
        gallery: {
            tag: "Visual Archives",
            title: "Community Gallery",
            desc: "Tracing aesthetic footsteps through the camera lens. A collection of moments from stage performances, rehearsal spaces, to expressions of Indonesian visual culture.",
            all: "All",
            search_placeholder: "Search photos...",
            empty: "No photos in the gallery yet",
            no_match: "No photos match your search",
            untitled: "Untitled",
            no_desc: "No description for this photo.",
            modal_category: "CATEGORY:",
            modal_date: "DATE:"
        },
        insight: {
            tag: "Insights & Literacy",
            title: "Cultural Insights & Literacy Archives",
            category: "Category",
            reset: "Reset",
            search_placeholder: "Search title or content...",
            showing: "SHOWING {count} ARTICLES",
            default_category: "Coverage",
            read_time: "5 MINS",
            empty: "No articles found."
        },
        footer: {
            about_text: "Oryza Lokabasa is a hub for artistic collaboration and preservation of Nusantara's culture through modern media to reach today's generation.",
            quick_links: "Links",
            program: "Program",
            contact: "Contact Us",
            rights: "© 2024 Oryza Lokabasa. All Rights Reserved.",
        }
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState("ID");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Load saved language from localStorage on mount
        const savedLang = localStorage.getItem("oryza_language");
        if (savedLang && (savedLang === "ID" || savedLang === "EN")) {
            setLanguageState(savedLang);
        }
    }, []);

    const changeLanguage = (lang) => {
        setLanguageState(lang);
        if (typeof window !== "undefined") {
            localStorage.setItem("oryza_language", lang);
        }
    };

    // Helper untuk mengambil translasi
    // penggunaan: t('nav.home')
    const t = (keyString) => {
        const keys = keyString.split(".");
        let current = translations[language];
        for (const key of keys) {
            if (current[key] === undefined) {
                return keyString; // fallback: kembalikan string kuncinya
            }
            current = current[key];
        }
        return current;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, isClient }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage harus di dalam LanguageProvider");
    }
    return context;
};

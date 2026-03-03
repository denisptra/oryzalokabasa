import React from "react";
import Link from "next/link";
import { ChevronRight, Clock, User, ArrowLeft, Calendar, TrendingUp } from "lucide-react";
import { postAPI, getImageUrl } from "@/lib/api";
import ShareBlock from "./ShareBlock";
import PageTracker from "./PageTracker";
import parse from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"] });
const inter = Inter({ subsets: ["latin"] });

async function getArticle(slug) {
  try {
    let res = await postAPI.getBySlug(slug).catch(() => postAPI.getById(slug));
    return res.data;
  } catch {
    return null;
  }
}

// Fungsi untuk mengambil postingan terpopuler (limit 3)
async function getTrendingPosts(currentId) {
  try {
    const res = await postAPI.getAll(); // Sesuaikan jika API Anda punya endpoint khusus trending
    const allPosts = res.data || [];
    // Filter agar artikel yang sedang dibaca tidak muncul di saran
    return allPosts
      .filter((p) => p.id !== currentId && p.status === "PUBLISHED")
      .slice(0, 3);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Artikel Tidak Ditemukan" };

  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt?.replace(/<[^>]+>/g, "");
  const image = article.thumbnail ? (article.thumbnail.startsWith("http") ? article.thumbnail : getImageUrl(article.thumbnail)) : "/fallback.jpg";

  return {
    title: `${title} | Oryza Lokabasa`,
    description,
    openGraph: { title, description, images: [image], type: "article" },
  };
}

export default async function DetailBerita({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${inter.className}`}>
        <h2 className="text-xl font-bold mb-4">Artikel Tidak Ditemukan</h2>
        <Link href="/insight" className="text-blue-900 underline uppercase text-xs font-black">Kembali</Link>
      </div>
    );
  }

  const trendingPosts = await getTrendingPosts(article.id);
  const tags = Array.isArray(article.tags) 
    ? article.tags 
    : article.tags?.split(",").map(t => t.trim()).filter(Boolean) || [];

  const cleanHtml = DOMPurify.sanitize(article.content, {
    ADD_ATTR: ["class", "style", "target", "rel", "data-list"],
    ADD_TAGS: ["iframe", "span", "video", "source"],
  });

  return (
    <div className={`min-h-screen bg-white pb-24 ${inter.className} overflow-x-hidden`}>
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-10 uppercase tracking-widest overflow-hidden whitespace-nowrap">
          <Link href="/insight" className="hover:text-blue-900 shrink-0">Wawasan</Link>
          <ChevronRight size={10} className="shrink-0" />
          {article.category && (
            <>
              <span className="text-slate-500 shrink-0">{article.category.name}</span>
              <ChevronRight size={10} className="shrink-0" />
            </>
          )}
          <span className="text-slate-900 truncate">{article.title}</span>
        </nav>

        <header className="mb-12">
          <PageTracker postId={article.id} />
          <h1 className={`${playfair.className} text-3xl md:text-5xl lg:text-6xl leading-[1.1] mb-8 text-slate-900 tracking-tight break-words`}>
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-6 py-8 border-y border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-slate-50 rounded-full flex items-center justify-center text-blue-900 border border-slate-100">
                <User size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase">{article.author?.name || "Redaksi Oryza"}</p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 mt-1 uppercase">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(article.createdAt).toLocaleDateString("id-ID")}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> 5 Menit Baca</span>
                </div>
              </div>
            </div>
            <ShareBlock title={article.title} />
          </div>
        </header>

        <figure className="mb-16">
          <div className="rounded-3xl overflow-hidden bg-slate-50 shadow-2xl shadow-slate-100 relative aspect-video md:aspect-[21/9]">
            <img
              src={article.thumbnail ? getImageUrl(article.thumbnail) : "/fallback.jpg"}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          {article.excerpt && (
            <figcaption className="text-center text-sm text-slate-500 mt-8 italic max-w-2xl mx-auto leading-relaxed break-words px-4">
              &quot;{article.excerpt.replace(/<[^>]+>/g, "")}&quot;
            </figcaption>
          )}
        </figure>

        <article className="ql-editor prose prose-slate max-w-none w-full overflow-hidden break-words prose-p:text-slate-700 prose-p:leading-[1.8] prose-p:mb-6 prose-headings:font-serif prose-headings:text-slate-900 prose-img:rounded-2xl prose-img:mx-auto prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:overflow-x-auto">
          {parse(cleanHtml)}
        </article>

        <footer className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-8">
          <Link href="/insight" className="flex items-center gap-2 text-[10px] font-black text-blue-900 uppercase tracking-widest hover:gap-4 transition-all">
            <ArrowLeft size={14} /> Kembali ke Wawasan
          </Link>

          <div className="flex flex-wrap gap-2">
            {(tags.length > 0 ? tags : [article.category?.name, "Wawasan"]).filter(Boolean).map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-black rounded-full uppercase tracking-tighter border border-slate-100 shrink-0">
                # {tag}
              </span>
            ))}
          </div>
        </footer>

        {/* --- SECTION: ARTIKEL POPULER / TRENDING --- */}
        {trendingPosts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-10">
              <h2 className={`${playfair.className} text-2xl md:text-3xl font-bold text-slate-900`}>
                Wawasan Populer Lainnya
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trendingPosts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/insight/${post.slug || post.id}`}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-sm group-hover:shadow-md transition-all">
                    <img
                      src={post.thumbnail ? getImageUrl(post.thumbnail) : "/fallback.jpg"}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[8px] font-black text-blue-900 uppercase tracking-widest shadow-sm">
                      {post.category?.name || "Liputan"}
                    </div>
                  </div>
                  <h3 className={`${playfair.className} text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-900 transition-colors line-clamp-2 mb-2`}>
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-auto">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-blue-900/50" /> {new Date(post.createdAt).toLocaleDateString("id-ID")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-blue-900/50" /> 5 Min
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
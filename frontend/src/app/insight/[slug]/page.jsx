import React from "react";
import Link from "next/link";
import { ChevronRight, Clock, User, ArrowLeft, Calendar } from "lucide-react";
import { postAPI, getImageUrl } from "@/lib/api";
import ShareBlock from "./ShareBlock";
import PageTracker from "./PageTracker";
import parse from "html-react-parser";
import ImageFallback from "@/components/ImageFallback";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"] });

// ==========================================
// DATA FETCHING
// ==========================================

async function getArticle(slug) {
  try {
    let res = await postAPI.getBySlug(slug).catch(() => postAPI.getById(slug));
    return res.data;
  } catch {
    return null;
  }
}

async function getTrendingPosts(currentId) {
  try {
    const res = await postAPI.getAll();
    const allPosts = res.data || [];
    return allPosts.filter((p) => p.id !== currentId && p.status === "PUBLISHED").slice(0, 3);
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

// ==========================================
// SUB-COMPONENTS
// ==========================================

const Breadcrumb = ({ category, title }) => (
  <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-8 uppercase tracking-widest overflow-hidden whitespace-nowrap">
    <Link href="/insight" className="hover:text-blue-900 shrink-0">Wawasan</Link>
    <ChevronRight size={10} className="shrink-0" />
    {category && (
      <>
        <span className="text-slate-500 shrink-0">{category.name}</span>
        <ChevronRight size={10} className="shrink-0" />
      </>
    )}
    <span className="text-blue-900 truncate">{title}</span>
  </nav>
);

const ArticleMeta = ({ author, createdAt, title }) => (
  <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-y border-slate-100">
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center text-blue-900 border border-blue-100">
        <User size={20} />
      </div>
      <div>
        <p className="text-xs font-black uppercase text-blue-950">{author?.name || "Redaksi Oryza"}</p>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(createdAt).toLocaleDateString("id-ID")}</span>
        </div>
      </div>
    </div>
    <ShareBlock title={title} />
  </div>
);

const TrendingSection = ({ posts }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="mt-20 pt-16 border-t border-slate-100">
      <h2 className={`${playfair.className} text-2xl md:text-3xl font-bold text-blue-950 mb-8`}>
        Wawasan Populer Lainnya
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link key={post.id} href={`/insight/${post.slug || post.id}`} className="group flex flex-col">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-sm group-hover:shadow-lg transition-all">
              <ImageFallback
                src={post.thumbnail ? getImageUrl(post.thumbnail) : "/fallback.jpg"}
                alt={post.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-black text-yellow-700 uppercase tracking-widest shadow-sm">
                {post.category?.name || "Artikel"}
              </div>
            </div>
            <h3 className={`${playfair.className} text-lg font-bold text-blue-950 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2 mb-2 text-pretty`}>
              {post.title}
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-auto">
              <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString("id-ID")}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default async function DetailBerita({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${inter.className}`}>
        <h2 className="text-xl font-bold mb-4">Artikel Tidak Ditemukan</h2>
        <Link href="/insight" className="text-blue-900 underline uppercase text-xs font-black">Kembali ke Wawasan</Link>
      </div>
    );
  }

  const trendingPosts = await getTrendingPosts(article.id);
  const tags = Array.isArray(article.tags) ? article.tags : article.tags?.split(",").map(t => t.trim()).filter(Boolean) || [];

  // PEMBERSIHAN KONTEN: Hapus &nbsp; yang menyebabkan spasi bolong-bolong saat text-justify
  const rawContent = article.content || "";
  const cleanHtml = rawContent.replace(/&nbsp;/g, ' ');

  return (
    <div className={`min-h-screen bg-white pb-24 ${inter.className} overflow-x-hidden`}>
      <main className="max-w-4xl mx-auto px-6 py-10 md:py-16">

        <Breadcrumb category={article.category} title={article.title} />

        <header className="mb-10">
          <PageTracker postId={article.id} />

          <h1 className={`${playfair.className} text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-8 text-blue-950 tracking-tight text-pretty`}>
            {article.title}
          </h1>

          <ArticleMeta author={article.author} createdAt={article.createdAt} title={article.title} />
        </header>

        <figure className="mb-12">
          <div className="rounded-3xl overflow-hidden bg-slate-50 shadow-xl relative aspect-video md:aspect-[21/9]">
            <ImageFallback
              src={article.thumbnail ? getImageUrl(article.thumbnail) : "/fallback.jpg"}
              alt={article.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          {article.excerpt && (
            <figcaption className="text-center text-sm text-slate-500 mt-6 italic max-w-2xl mx-auto leading-relaxed px-4">
              &quot;{article.excerpt.replace(/<[^>]+>/g, "")}&quot;
            </figcaption>
          )}
        </figure>

        {/* PERBAIKAN: max-w-2xl agar jarak justify tidak bolong, line-height & margin lebih rapat */}
        <article
          className="ql-editor prose prose-slate max-w-2xl mx-auto w-full text-justify prose-p:text-justify [&_*]:!whitespace-normal [&_*]:!break-words [&_*]:!overflow-wrap-anywhere prose-a:break-all prose-p:text-gray-600 prose-p:leading-[1.8] prose-p:mb-4 prose-headings:text-blue-950 prose-headings:mb-3 prose-headings:mt-8 prose-img:rounded-2xl prose-img:mx-auto prose-a:text-yellow-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-blue-950 prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:overflow-x-auto prose-li:text-gray-600 prose-li:leading-[1.8] prose-blockquote:border-blue-200 prose-blockquote:text-gray-500"
        >
          {parse(cleanHtml)}
        </article>

        <footer className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <Link href="/insight" className="flex items-center gap-2 text-[10px] font-black text-blue-900 uppercase tracking-widest hover:gap-3 transition-all">
            <ArrowLeft size={14} /> Kembali ke Wawasan
          </Link>

          <div className="flex flex-wrap gap-2">
            {(tags.length > 0 ? tags : [article.category?.name, "Wawasan"]).filter(Boolean).map((tag, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-md uppercase tracking-widest border border-slate-100 shrink-0 hover:bg-slate-100 transition-colors">
                # {tag}
              </span>
            ))}
          </div>
        </footer>

        <TrendingSection posts={trendingPosts} />
      </main>
    </div>
  );
}
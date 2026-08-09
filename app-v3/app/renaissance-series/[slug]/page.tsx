import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleBySlug, incrementArticleViews } from '@/lib/cms';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: 'Research Publication Not Found | People & Youth' };
  }

  return {
    title: `${article.title} | ${article.publications?.name || 'The Renaissance Series'}`,
    description: article.excerpt || article.subtitle || 'Research paper published by People & Youth.',
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      type: 'article',
      publishedTime: article.published_at || undefined,
      authors: article.authors ? [article.authors.name] : ['People & Youth Research'],
      images: article.cover_image ? [{ url: article.cover_image }] : [],
    },
  };
}

export default async function RenaissanceArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || article.status !== 'PUBLISHED') {
    notFound();
  }

  await incrementArticleViews(article.id);

  return (
    <article className="min-h-screen bg-[#030611] text-gray-100 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4 border-b border-amber-500/20 pb-6">
          <span className="text-xs font-black text-amber-400 tracking-widest uppercase block">
            THE RENAISSANCE SERIES • {article.publications?.name || article.category}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-xl text-gray-400 font-medium">{article.subtitle}</p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-800/60">
            <div>
              Author: <strong className="text-amber-400">{article.authors?.name || 'Research Fellow'}</strong>
            </div>
            <div>
              Journal: <strong className="text-white">{article.publications?.name || 'Interdisciplinary Journal'}</strong>
            </div>
            <div>{article.reading_time || 5} min read</div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-gray-200 font-serif leading-relaxed text-lg whitespace-pre-wrap bg-[#070b19] p-8 rounded-xl border border-amber-500/10">
          {article.content}
        </div>

        <div className="mt-12 pt-6 border-t border-amber-500/20 text-center text-xs text-amber-500/60 font-mono tracking-widest uppercase">
          🛡️ {article.watermark_text || 'OFFICIAL RECORD | PEOPLE & YOUTH | DO NOT DUPLICATE'}
        </div>
      </div>
    </article>
  );
}
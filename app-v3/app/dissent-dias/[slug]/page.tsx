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
    return { title: 'Article Not Found | People & Youth' };
  }

  return {
    title: `${article.title} | Dissent Dias — People & Youth`,
    description: article.excerpt || article.subtitle || 'An institutional essay published on People & Youth.',
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      type: 'article',
      publishedTime: article.published_at || undefined,
      authors: article.authors ? [article.authors.name] : ['People & Youth'],
      images: article.cover_image ? [{ url: article.cover_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || '',
    },
  };
}

export default async function DissentDiasArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || article.status !== 'PUBLISHED') {
    notFound();
  }

  await incrementArticleViews(article.id);

  return (
    <article className="min-h-screen bg-[#030611] text-gray-100 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4 border-b border-amber-500/20 pb-6">
          <span className="text-xs font-black text-amber-400 tracking-widest uppercase block">
            DISSENT DIAS • {article.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-lg text-gray-400 font-medium">{article.subtitle}</p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400 pt-4">
            <div>
              Published by <strong className="text-amber-400">{article.authors?.name || 'Editorial Board'}</strong>
            </div>
            <div>{article.reading_time || 3} min read</div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-gray-300 font-serif leading-relaxed text-lg whitespace-pre-wrap">
          {article.content}
        </div>

        <div className="mt-12 pt-6 border-t border-amber-500/20 text-center text-xs text-amber-500/60 font-mono tracking-widest uppercase">
          🛡️ {article.watermark_text || 'OFFICIAL RECORD | PEOPLE & YOUTH | DO NOT DUPLICATE'}
        </div>
      </div>
    </article>
  );
}
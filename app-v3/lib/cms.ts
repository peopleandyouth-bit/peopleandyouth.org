import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';

export interface Author {
  id: string;
  name: string;
  slug: string;
  email?: string;
  photo_url?: string;
  bio?: string;
  designation?: string;
  organization?: string;
  expertise?: string[];
  linkedin_url?: string;
  website_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Publication {
  id: string;
  name: string;
  slug: string;
  description?: string;
  publication_type: 'DISSENT_DIAS' | 'RENAISSANCE_SERIES' | 'KNOWLEDGE_CAVE' | 'COLUMNS';
  logo_url?: string;
  cover_image?: string;
  editor_in_chief?: string;
  issn?: string;
  frequency?: string;
  categories?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EditorialColumn {
  id: string;
  title: string;
  slug: string;
  author_id?: string;
  description?: string;
  cover_image?: string;
  frequency?: string;
  created_at?: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  excerpt?: string;
  content: string;
  content_format?: string;
  author_id?: string;
  publication_id?: string;
  column_id?: string;
  reflection_id?: string;
  publication_type: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  cover_image?: string;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED' | 'REJECTED';
  visibility?: string;
  featured?: boolean;
  is_editors_pick?: boolean;
  is_research_highlight?: boolean;
  scheduled_at?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  seo_title?: string;
  seo_description?: string;
  canonical_url?: string;
  reading_time?: number;
  view_count?: number;
  revision_number?: number;
  watermark_text?: string;
  authors?: Author;
  publications?: Publication;
  editorial_columns?: EditorialColumn;
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text ? text.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export async function getPublishedArticles(options?: {
  publicationType?: string;
  publicationSlug?: string;
  category?: string;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select(`
      *,
      authors(*),
      publications(*)
    `)
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false });

  if (options?.publicationType) {
    query = query.eq('publication_type', options.publicationType);
  }
  if (options?.category) {
    query = query.eq('category', options.category);
  }
  if (options?.featuredOnly) {
    query = query.eq('featured', true);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching published articles:', error);
    return [];
  }

  let results = data as Article[];
  if (options?.publicationSlug) {
    results = results.filter((art) => art.publications?.slug === options.publicationSlug);
  }

  return results;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      authors(*),
      publications(*),
      editorial_columns(*)
    `)
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Article;
}

export async function getPublications(): Promise<Publication[]> {
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching publications:', error);
    return [];
  }
  return data as Publication[];
}

export async function getAuthors(): Promise<Author[]> {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
  return data as Author[];
}

export async function incrementArticleViews(articleId: string): Promise<void> {
  try {
    const { data } = await supabase
      .from('articles')
      .select('view_count')
      .eq('id', articleId)
      .single();

    if (data) {
      const newCount = (data.view_count || 0) + 1;
      await supabase
        .from('articles')
        .update({ view_count: newCount })
        .eq('id', articleId);
    }
  } catch (err) {
    console.error('Failed to increment view count:', err);
  }
}
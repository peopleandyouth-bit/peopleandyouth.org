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

/** Calculate estimated reading time in minutes */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text ? text.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/** Fetch published articles with flexible filtering options */
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
    .lte('published_at', new Date().toISOString())
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

/** Fetch a single article by slug */
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

/** Fetch all active publications / journals */
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

/** Fetch all authors */
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

/** Atomically increment article view count */
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

/** Save or update an article with revision logging and workflow notifications */
export async function saveArticleWithRevision(
  articleData: Partial<Article>,
  editorName: string = 'Admin'
): Promise<Article> {
  const readingTime = calculateReadingTime(articleData.content || '');
  const isPublishing = articleData.status === 'PUBLISHED';

  const payload: Partial<Article> = {
    ...articleData,
    reading_time: readingTime,
    updated_at: new Date().toISOString(),
    published_at: isPublishing
      ? articleData.published_at || new Date().toISOString()
      : articleData.published_at,
  };

  let savedArticle: Article;

  if (articleData.id) {
    // Fetch existing revision number
    const { data: existing } = await supabase
      .from('articles')
      .select('revision_number')
      .eq('id', articleData.id)
      .single();

    const currentRev = existing?.revision_number || 1;
    payload.revision_number = currentRev + 1;

    const { data, error } = await supabase
      .from('articles')
      .update(payload)
      .eq('id', articleData.id)
      .select()
      .single();

    if (error) throw error;
    savedArticle = data as Article;
  } else {
    payload.revision_number = 1;
    const { data, error } = await supabase
      .from('articles')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    savedArticle = data as Article;
  }

  // Record revision snapshot in history
  await supabase.from('article_revisions').insert({
    article_id: savedArticle.id,
    revision_number: savedArticle.revision_number || 1,
    title: savedArticle.title,
    content: savedArticle.content,
    change_summary: `Saved as ${savedArticle.status} by ${editorName}`,
    edited_by: editorName,
  });

  // Workflow Email Notification
  if (process.env.RESEND_API_KEY && savedArticle.status) {
    await sendWorkflowNotification(savedArticle, savedArticle.status, editorName);
  }

  return savedArticle;
}

/** Send Workflow Status Notifications via Resend */
export async function sendWorkflowNotification(
  article: Article,
  newStatus: string,
  editorName: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    const resend = new Resend(apiKey);
    const recipient = process.env.SMTP_USER || 'contact@peopleandyouth.org';

    await resend.emails.send({
      from: 'People & Youth System <contact@peopleandyouth.org>',
      to: [recipient],
      subject: `[CMS Notification] Article "${article.title}" updated to ${newStatus}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #030611; color: #f3f4f6;">
          <h2 style="color: #fbbf24;">Institutional Editorial Board Notice</h2>
          <p>The publication <strong>"${article.title}"</strong> has been updated.</p>
          <ul>
            <li><strong>Status:</strong> ${newStatus}</li>
            <li><strong>Editor:</strong> ${editorName}</li>
            <li><strong>Category:</strong> ${article.category}</li>
            <li><strong>Type:</strong> ${article.publication_type}</li>
          </ul>
          <p><a href="https://www.peopleandyouth.org/admin/command-centre" style="color: #fbbf24;">Open Command Centre</a></p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Workflow notification email error:', err);
  }
}
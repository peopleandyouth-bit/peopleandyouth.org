export type ContentType = 
  | 'editorial' | 'opinion' | 'research_paper' | 'policy_brief' 
  | 'case_study' | 'white_paper' | 'report' | 'book' | 'newsletter' | 'announcement';

export type ContentStatus = 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived';

export interface MountainRange {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon?: string;
}

export interface KnowledgeCave {
  id: string;
  mountain_range_id: string;
  slug: string;
  title: string;
  overview: string;
  icon?: string;
  curator_user_id?: string;
}

export interface RenaissanceJournal {
  id: string;
  slug: string;
  title: string;
  issn?: string;
  description: string;
  editor_in_chief?: string;
  submission_guidelines?: string;
  impact_factor?: number;
}

export interface CimsArticle {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  content_type: ContentType;
  journal_id?: string;
  cave_id?: string;
  author_id?: string;
  abstract?: string;
  body_markdown: string;
  featured_image?: string;
  reading_time_minutes: number;
  status: ContentStatus;
  published_at?: string;
  views_count: number;
  seo_title?: string;
  seo_description?: string;
  tags?: string[];
}

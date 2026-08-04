export type EssayCategory = 'long_form_essay' | 'expert_column' | 'opinion_editorial' | 'policy_debate' | 'interview';
export type EssayStatus = 'draft' | 'under_review' | 'published' | 'archived';

export interface DissentEssay {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: EssayCategory;
  author_name: string;
  author_title: string;
  author_passport_id?: string;
  reading_time_minutes: number;
  featured_image: string;
  content_markdown: string;
  status: EssayStatus;
  published_at: string;
}

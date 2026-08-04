export type ManuscriptStatus = 'submitted' | 'under_peer_review' | 'revision_requested' | 'accepted' | 'published' | 'rejected';

export interface JournalManuscript {
  id: string;
  doi_code: string;
  journal_slug: string;
  title: string;
  abstract: string;
  keywords: string[];
  author_name: string;
  author_email: string;
  author_affiliation: string;
  author_passport_id?: string;
  manuscript_pdf_url: string;
  cave_id?: string;
  status: ManuscriptStatus;
  published_at?: string;
  submitted_at: string;
}

export interface RenaissanceJournal {
  id: string;
  slug: string;
  journal_number: number;
  title: string;
  issn_code: string;
  domain_category: string;
  chief_editor_name: string;
  chief_editor_role: string;
  overview: string;
  scope_topics: string[];
  manuscripts_count: number;
  is_active: boolean;
}

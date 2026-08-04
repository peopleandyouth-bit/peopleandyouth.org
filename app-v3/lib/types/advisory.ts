export type DirectiveStatus = 'draft' | 'under_review' | 'enacted' | 'archived';

export interface PolicyDirective {
  id: string;
  directive_code: string;
  division_slug: string;
  title: string;
  summary: string;
  full_text_markdown: string;
  lead_advisor_name: string;
  lead_passport_id?: string;
  status: DirectiveStatus;
  enacted_at: string;
}

export interface AdvisoryDivision {
  id: string;
  slug: string;
  division_number: number;
  title: string;
  category: string;
  lead_chair_name: string;
  lead_chair_title: string;
  overview: string;
  mandate_objectives: string[];
  members_count: number;
  directives_count: number;
  is_active: boolean;
}

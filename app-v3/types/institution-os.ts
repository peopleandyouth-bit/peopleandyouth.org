export type AppRole =
  | 'founder'
  | 'chairperson'
  | 'ceo'
  | 'super_administrator'
  | 'administrator'
  | 'executive_director'
  | 'department_head'
  | 'managing_editor'
  | 'research_director'
  | 'hr_manager'
  | 'finance_manager'
  | 'recruitment_team'
  | 'publications_team'
  | 'events_team'
  | 'communications_team'
  | 'moderator'
  | 'reviewer'
  | 'volunteer_coordinator';

export type EntityType =
  | 'page'
  | 'office'
  | 'leadership'
  | 'position'
  | 'org_unit'
  | 'journal'
  | 'cave'
  | 'campaign'
  | 'media';

export type EntityStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface SEOMetadata {
  meta_title: string;
  meta_description: string;
  og_image: string;
  keywords: string[];
}

export interface InstitutionalEntity {
  id: string;
  entity_type: EntityType;
  title: string;
  slug: string;
  status: EntityStatus;
  summary: string;
  content_markup: string;
  metadata: Record<string, any>;
  seo_data: SEOMetadata;
  featured_image?: string;
  author_id?: string;
  author_name: string;
  version: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadershipMetadata {
  official_portrait: string;
  position: string;
  office: string;
  department: string;
  biography: string;
  editorial_column: string;
  vision_statement: string;
  expertise: string[];
  education: string[];
  experience: string[];
  publications: string[];
  awards: string[];
  social_links: {
    linkedin?: string;
    website?: string;
    email?: string;
    twitter?: string;
  };
  office_location: string;
  contact_preferences: string;
  appointment_date: string;
  term?: string;
}

export interface ExecutiveOfficeMetadata {
  chamber_name: string;
  incumbent_name: string;
  incumbent_title: string;
  strategic_vision: string;
  official_message: string;
  editorial_columns: string[];
  public_addresses: string[];
  media_gallery: string[];
  timeline: Array<{ year: string; event: string }>;
  initiatives: string[];
  office_team: string[];
  contact_email: string;
}

export interface CareerPositionMetadata {
  department: string;
  office_hierarchy: string;
  reporting_to: string;
  responsibilities: string[];
  qualifications: string[];
  employment_type: 'Full-Time' | 'Part-Time' | 'Fellowship' | 'Honorary';
  compensation_category: string;
  application_deadline?: string;
}

export interface AuditLogRecord {
  id: string;
  user_email: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'ROLLBACK';
  module: string;
  entity_id?: string;
  previous_value?: Record<string, any>;
  updated_value?: Record<string, any>;
  ip_address: string;
  created_at: string;
}
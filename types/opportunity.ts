export type OpportunityCategory = 'career' | 'fellowship' | 'scholarship' | 'grant' | 'residency';
export type OpportunityType = 'full_time' | 'part_time' | 'contract' | 'fellowship_term' | 'grant_award';
export type LocationType = 'on_site' | 'hybrid' | 'remote';
export type OpportunityStatus = 'draft' | 'published' | 'archived' | 'closed';
export type ApplicationStatus = 'submitted' | 'under_review' | 'shortlisted' | 'interviewed' | 'accepted' | 'rejected' | 'withdrawn';

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  category: OpportunityCategory;
  type: OpportunityType;
  location_type: LocationType;
  location: string;
  department: string;
  summary: string;
  description: string;
  eligibility?: string | null;
  benefits?: string | null;
  requirements: string[];
  is_featured: boolean;
  status: OpportunityStatus;
  deadline?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunityApplication {
  id: string;
  opportunity_id: string;
  applicant_id?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  resume_url: string;
  cover_letter?: string | null;
  answers?: Record<string, unknown>;
  status: ApplicationStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  opportunity?: Partial<Opportunity>;
}

export interface OpportunityFilters {
  category?: OpportunityCategory | 'all';
  type?: OpportunityType | 'all';
  location_type?: LocationType | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateOpportunityDTO {
  title: string;
  category: OpportunityCategory;
  type: OpportunityType;
  location_type: LocationType;
  location: string;
  department: string;
  summary: string;
  description: string;
  eligibility?: string;
  benefits?: string;
  requirements?: string[];
  is_featured?: boolean;
  status?: OpportunityStatus;
  deadline?: string | null;
}

export interface SubmitApplicationDTO {
  opportunity_id: string;
  full_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url: string;
  cover_letter?: string;
}

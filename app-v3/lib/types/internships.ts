export type InternshipCategory = 'public_policy' | 'rti_audits' | 'dpi_ai_ethics' | 'legal_research' | 'rural_health';
export type InternshipStatus = 'submitted' | 'shortlisted' | 'placed' | 'completed' | 'rejected';

export interface InternshipProgram {
  id: string;
  slug: string;
  title: string;
  category: InternshipCategory;
  duration_weeks: number;
  stipend_amount: string;
  location_type: 'district_field' | 'remote' | 'hybrid';
  overview: string;
  responsibilities: string[];
  qualifications: string[];
  is_active: boolean;
  created_at: string;
}

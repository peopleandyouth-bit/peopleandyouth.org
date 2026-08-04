export type EntityCategory = 'municipal_corporation' | 'university_campus' | 'public_sector_unit' | 'district_panchayat';
export type GrievanceStatus = 'filed' | 'under_investigation' | 'hearing_scheduled' | 'resolved' | 'dismissed';

export interface TransparencyScorecard {
  id: string;
  audit_code: string;
  entity_name: string;
  category: EntityCategory;
  location_state: string;
  transparency_rating: number;
  rti_compliance_score: number;
  infrastructure_readiness_score: number;
  budget_disclosure_score: number;
  last_audited_at: string;
  lead_auditor_name: string;
  auditor_passport_id?: string;
  audit_summary: string;
  findings_markdown: string;
}

export interface PublicGrievance {
  id: string;
  grievance_code: string;
  complainant_name: string;
  email: string;
  phone: string;
  passport_id?: string;
  target_entity: string;
  category: string;
  subject: string;
  description_markdown: string;
  proof_document_url?: string;
  status: GrievanceStatus;
  resolution_notes?: string;
  filed_at: string;
}

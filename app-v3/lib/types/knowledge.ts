export type ResourceType = 'policy_brief' | 'empirical_dataset' | 'audit_report' | 'monograph' | 'video_lecture' | 'case_study';

export interface KnowledgeResource {
  id: string;
  title: string;
  slug: string;
  resource_type: ResourceType;
  cave_id: string;
  summary: string;
  author_name: string;
  author_passport_id?: string;
  download_url?: string;
  citation_code: string;
  published_at: string;
}

export interface KnowledgeCave {
  id: string;
  slug: string;
  cave_number: number;
  mountain_slug: string;
  title: string;
  subtitle: string;
  category: string;
  icon_emoji: string;
  description: string;
  lead_expert_name: string;
  resources_count: number;
  is_active: boolean;
}

export interface IFSCSpecification {
  regulatory_framework: string;
  clearing_mechanisms: string[];
  tax_neutrality_policy: string;
  offshore_banking_units: string;
  capital_convertibility_index: string;
}

export interface MountainRange {
  id: string;
  slug: string;
  mountain_number: number;
  title: string;
  subtitle: string;
  overview: string;
  banner_image: string;
  caves_count: number;
  caves: KnowledgeCave[];
  ifsc_specifications?: IFSCSpecification;
}

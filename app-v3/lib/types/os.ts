export type UserRole =
  | 'visitor' | 'member' | 'volunteer' | 'contributor' | 'researcher'
  | 'author' | 'reviewer' | 'editor' | 'campaign_manager' | 'district_coordinator'
  | 'state_coordinator' | 'national_coordinator' | 'youth_ambassador' | 'faculty'
  | 'advisor' | 'partner' | 'donor' | 'employee' | 'director' | 'administrator' | 'founder';

export type MembershipTier = 
  | 'tier_0_visitor' 
  | 'tier_1_verified_fellow' 
  | 'tier_2_senior_scholar' 
  | 'tier_3_district_leader' 
  | 'tier_4_executive_director';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'under_review' | 'completed';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  biography?: string;
  institution?: string;
  district?: string;
  state?: string;
  country: string;
  passport_id?: string;
  skills: string[];
  education: Array<{ degree: string; institution: string; year: string }>;
  experience: Array<{ role: string; organization: string; duration: string }>;
  research_interests: string[];
  joined_since: string;
}

export interface CivicPassport {
  id: string;
  user_id: string;
  passport_id: string;
  membership_tier: MembershipTier;
  qr_code_hash: string;
  digital_signature: string;
  impact_score: number;
  volunteer_hours: number;
  research_score: number;
  leadership_score: number;
  learning_score: number;
  status: 'active' | 'suspended';
}

export interface ProjectTask {
  id: string;
  project_id: string;
  department_id: string;
  title: string;
  description?: string;
  assignee_user_id?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
}

export interface KnowledgeNode {
  id: string;
  title: string;
  entity_type: 'paper' | 'cave' | 'author' | 'brief' | 'campaign';
  summary: string;
  content_url?: string;
  metadata?: Record<string, any>;
}

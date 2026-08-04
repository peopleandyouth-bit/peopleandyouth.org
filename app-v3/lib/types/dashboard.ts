export interface MemberDashboardMetrics {
  passport_id: string;
  full_name: string;
  role_title: string;
  district_state: string;
  impact_score: number;
  learning_score: number;
  audits_filed: number;
  papers_published: number;
  events_attended: number;
  recent_activity: {
    id: string;
    action_type: string;
    title: string;
    timestamp: string;
    status: string;
  }[];
}

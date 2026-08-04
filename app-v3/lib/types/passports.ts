export type PassportTier = 'fellow' | 'district_coordinator' | 'youth_ambassador' | 'council_member' | 'scholar';

export interface CredentialBadge {
  id: string;
  badge_code: string;
  badge_name: string;
  category: string;
  issued_by: string;
  issued_at: string;
  icon_emoji: string;
}

export interface SovereignPassport {
  id: string;
  passport_id: string;
  full_name: string;
  email: string;
  role_title: string;
  tier: PassportTier;
  district_state: string;
  country: string;
  avatar_url?: string;
  impact_score: number;
  learning_score: number;
  audits_count: number;
  publications_count: number;
  digital_signature: string;
  qr_code_url?: string;
  is_verified: boolean;
  issued_at: string;
  badges: CredentialBadge[];
}

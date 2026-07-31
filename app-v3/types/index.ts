export interface JournalTopic {
  id: string;
  title: string;
  category: 'Public Policy' | 'Economics' | 'AI & Tech' | 'Psychology' | 'Rural India' | 'Governance' | 'International Business';
  description: string;
  iconName: string;
}

export interface FounderMilestone {
  role: string;
  organization: string;
  period: string;
  description: string;
  tag: string;
}

export interface DissentTopic {
  id: string;
  motion: string;
  category: string;
  proVotes: number;
  conVotes: number;
  status: 'Live Debate' | 'Voting Open' | 'Archived Paper';
}
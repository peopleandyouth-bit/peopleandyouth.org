import { AppRole } from '@/types/institution-os';

export const ROLE_HIERARCHY: Record<string, number> = {
  founder: 100,
  chairperson: 95,
  ceo: 90,
  super_administrator: 85,
  administrator: 80,
  executive_director: 75,
  department_head: 70,
  managing_editor: 65,
  research_director: 65,
  hr_manager: 60,
  finance_manager: 60,
  recruitment_team: 50,
  publications_team: 50,
  events_team: 50,
  communications_team: 50,
  moderator: 40,
  reviewer: 30,
  volunteer_coordinator: 20,
};

export function hasPermission(
  userRole: AppRole | string,
  requiredRole: AppRole | string
): boolean {
  const userRank = ROLE_HIERARCHY[userRole?.toLowerCase()] || 0;
  const reqRank = ROLE_HIERARCHY[requiredRole?.toLowerCase()] || 0;
  return userRank >= reqRank;
}

export function canPublishContent(role: AppRole | string): boolean {
  return hasPermission(role, 'managing_editor');
}

export function canManageOffices(role: AppRole | string): boolean {
  return hasPermission(role, 'ceo');
}

export function canManageCareers(role: AppRole | string): boolean {
  return hasPermission(role, 'hr_manager');
}

export function getRoleBadgeColor(role: AppRole | string): string {
  const cleanRole = (role || '').toString().toLowerCase();
  switch (cleanRole) {
    case 'founder':
    case 'chairperson':
    case 'ceo':
      return 'bg-amber-400/20 text-amber-300 border-amber-400/40';
    case 'super_administrator':
    case 'administrator':
    case 'executive_director':
      return 'bg-sky-400/20 text-sky-300 border-sky-400/40';
    case 'managing_editor':
    case 'research_director':
      return 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40';
    default:
      return 'bg-white/10 text-gray-300 border-white/20';
  }
}
import { UserRole } from './types/os';

export const ROLE_HIERARCHY_LEVELS: Record<UserRole, number> = {
  visitor: 0,
  member: 1,
  volunteer: 2,
  contributor: 2,
  youth_ambassador: 3,
  researcher: 3,
  author: 3,
  reviewer: 4,
  editor: 5,
  campaign_manager: 5,
  district_coordinator: 6,
  state_coordinator: 7,
  national_coordinator: 8,
  faculty: 6,
  advisor: 7,
  partner: 4,
  donor: 4,
  employee: 7,
  director: 9,
  administrator: 10,
  founder: 10,
};

export function hasPermission(userRoles: UserRole[], requiredRole: UserRole): boolean {
  const maxUserLevel = Math.max(...userRoles.map(r => ROLE_HIERARCHY_LEVELS[r] || 0));
  const requiredLevel = ROLE_HIERARCHY_LEVELS[requiredRole] || 0;
  return maxUserLevel >= requiredLevel;
}

export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'founder':
    case 'administrator':
      return 'bg-red-500/20 border-red-500 text-red-300';
    case 'director':
    case 'national_coordinator':
      return 'bg-amber-500/20 border-amber-400 text-amber-300';
    case 'editor':
    case 'district_coordinator':
      return 'bg-cyan-500/20 border-cyan-400 text-cyan-300';
    default:
      return 'bg-white/10 border-white/20 text-gray-300';
  }
}

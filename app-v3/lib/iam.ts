import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase server environment variables.');
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export type Permission =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'REVIEW'
  | 'APPROVE'
  | 'PUBLISH'
  | 'ARCHIVE'
  | 'DELETE'
  | 'ADMIN';

export interface IamIdentity {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  role: string;
  designation: string | null;
  organization: string | null;
  department: string | null;
  office: string | null;
  permissions: Permission[];
  status: string;
}

export interface IamRole {
  id: string;
  user_id: string;
  role: string;
  department_id: string | null;
  district_jurisdiction: string | null;
  assigned_at: string;
}

/**
 * Retrieve the institutional IAM identity associated with a Supabase Auth user.
 *
 * Source of truth:
 *   public.command_centre_admins
 */
export async function getIamIdentity(
  userId: string
): Promise<IamIdentity | null> {
  const { data, error } = await supabaseAdmin
    .from('command_centre_admins')
    .select(
      'id, user_id, name, email, role, designation, organization, department, office, permissions, status'
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[IAM] Failed to retrieve institutional identity:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    user_id: data.user_id ?? null,
    name: data.name,
    email: data.email,
    role: data.role,
    designation: data.designation ?? null,
    organization: data.organization ?? null,
    department: data.department ?? null,
    office: data.office ?? null,
    permissions: Array.isArray(data.permissions)
      ? (data.permissions as Permission[])
      : [],
    status: data.status,
  };
}

/**
 * Retrieve the institutional role assignment associated with a user.
 *
 * Source of truth:
 *   public.user_roles
 */
export async function getIamRole(
  userId: string
): Promise<IamRole | null> {
  const { data, error } = await supabaseAdmin
    .from('user_roles')
    .select(
      'id, user_id, role, department_id, district_jurisdiction, assigned_at'
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[IAM] Failed to retrieve institutional role:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    role: String(data.role),
    department_id: data.department_id ?? null,
    district_jurisdiction: data.district_jurisdiction ?? null,
    assigned_at: data.assigned_at,
  };
}

/**
 * Evaluate whether an institutional identity possesses a permission.
 *
 * Founder and Super Administrator are institutionally privileged roles.
 */
export function hasPermission(
  identity: IamIdentity | null,
  permission: Permission
): boolean {
  if (!identity) {
    return false;
  }

  if (identity.status !== 'ACTIVE') {
    return false;
  }

  const privilegedRoles = [
    'founder',
    'chairperson',
    'super_administrator',
  ];

  if (privilegedRoles.includes(identity.role)) {
    return true;
  }

  return identity.permissions.includes(permission);
}

/**
 * Check whether an IAM identity is active.
 */
export function isIamActive(
  identity: IamIdentity | null
): boolean {
  return identity?.status === 'ACTIVE';
}

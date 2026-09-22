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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

export type Role = 'founder' | 'chairperson' | 'cto' | 'admin';

export type IdentityStatus = 'ACTIVE' | 'INACTIVE';

export interface IamIdentity {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  role: Role;
  designation: string | null;
  organization: string | null;
  department: string | null;
  office: string | null;
  permissions: Permission[];
  status: IdentityStatus;
}

export interface IamRole {
  id: string;
  user_id: string;
  role: string;
  department_id: string | null;
  district_jurisdiction: string | null;
  assigned_at: string;
}

// ---------------------------------------------------------------------------
// Role constants
// ---------------------------------------------------------------------------

/** Roles that bypass the permissions array and hold every permission. */
export const PRIVILEGED_ROLES: Role[] = ['founder', 'chairperson'];

/** Roles that can be granted through the IAM API (never founder). */
export const GRANTABLE_ROLES: Role[] = ['cto', 'admin'];

/** Every valid role in the system. */
export const ALL_ROLES: Role[] = ['founder', 'chairperson', 'cto', 'admin'];

// ---------------------------------------------------------------------------
// Permission helpers (pure, do not touch the database)
// ---------------------------------------------------------------------------

export function isPrivilegedRole(role: Role | string | null | undefined): boolean {
  if (!role) return false;
  return PRIVILEGED_ROLES.includes(role as Role);
}

export function isFounder(identity: IamIdentity | null): boolean {
  return identity?.role === 'founder' && identity.status === 'ACTIVE';
}

export function isChairperson(identity: IamIdentity | null): boolean {
  return identity?.role === 'chairperson' && identity.status === 'ACTIVE';
}

export function isCto(identity: IamIdentity | null): boolean {
  return identity?.role === 'cto' && identity.status === 'ACTIVE';
}

export function isAdminRole(identity: IamIdentity | null): boolean {
  return identity?.role === 'admin' && identity.status === 'ACTIVE';
}

/**
 * Evaluate whether an institutional identity possesses a permission.
 * Founder and Chairperson are privileged and hold every permission.
 * All other roles are limited to their explicit permissions array.
 */
export function hasPermission(
  identity: IamIdentity | null,
  permission: Permission
): boolean {
  if (!identity) return false;
  if (identity.status !== 'ACTIVE') return false;
  if (isPrivilegedRole(identity.role)) return true;
  return identity.permissions.includes(permission);
}

export function isIamActive(identity: IamIdentity | null): boolean {
  return identity?.status === 'ACTIVE';
}

// ---------------------------------------------------------------------------
// Grant rules (pure, used by the API to enforce "cannot grant what you don't hold")
// ---------------------------------------------------------------------------

/**
 * Can `actor` grant `targetRole` to someone else?
 * Only a founder can grant any role.
 * A chairperson can grant cto or admin, but not founder or chairperson.
 * A cto or admin cannot grant any role.
 */
export function canGrantRole(
  actor: IamIdentity | null,
  targetRole: Role
): boolean {
  if (!actor || actor.status !== 'ACTIVE') return false;

  if (actor.role === 'founder') {
    // Founder can grant anything, including another founder only if the
    // unique index permits it (which it will not, so this is a no-op for founder).
    return true;
  }

  if (actor.role === 'chairperson') {
    return targetRole === 'cto' || targetRole === 'admin';
  }

  return false;
}

/**
 * Can `actor` grant a permission they wish to assign?
 * Founder holds everything.
 * Chairperson holds everything.
 * CTO/Admin can only grant permissions they themselves hold.
 */
export function canGrantPermission(
  actor: IamIdentity | null,
  permission: Permission
): boolean {
  if (!actor || actor.status !== 'ACTIVE') return false;
  if (isPrivilegedRole(actor.role)) return true;
  return actor.permissions.includes(permission);
}

/**
 * Can `actor` grant *all* of the permissions in `permissions`?
 * The full grant must be legal; partial grant is not allowed.
 */
export function canGrantAllPermissions(
  actor: IamIdentity | null,
  permissions: Permission[]
): boolean {
  if (!actor || actor.status !== 'ACTIVE') return false;
  if (isPrivilegedRole(actor.role)) return true;
  return permissions.every((p) => actor.permissions.includes(p));
}

/**
 * Throw if `actor` cannot grant `targetRole` with `permissions`.
 * Used by the API to reject illegal grants early with a clear message.
 */
export function assertCanGrant(
  actor: IamIdentity | null,
  targetRole: Role,
  permissions: Permission[]
): void {
  if (!actor || actor.status !== 'ACTIVE') {
    throw new Error('No active admin identity.');
  }

  if (targetRole === 'founder') {
    throw new Error(
      'Founder role is not grantable through the API. Use SQL if a founder change is required.'
    );
  }

  if (!canGrantRole(actor, targetRole)) {
    throw new Error(
      `Role "${actor.role}" is not permitted to grant role "${targetRole}".`
    );
  }

  if (!canGrantAllPermissions(actor, permissions)) {
    const missing = permissions.filter(
      (p) => !isPrivilegedRole(actor.role) && !actor.permissions.includes(p)
    );
    throw new Error(
      `Cannot grant permissions the actor does not hold: ${missing.join(', ')}.`
    );
  }
}

// ---------------------------------------------------------------------------
// Database reads
// ---------------------------------------------------------------------------

/**
 * Retrieve the institutional IAM identity associated with a Supabase Auth user.
 *
 * Source of truth: public.command_centre_admins
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

  if (!data) return null;

  return {
    id: data.id,
    user_id: data.user_id ?? null,
    name: data.name,
    email: data.email,
    role: data.role as Role,
    designation: data.designation ?? null,
    organization: data.organization ?? null,
    department: data.department ?? null,
    office: data.office ?? null,
    permissions: Array.isArray(data.permissions)
      ? (data.permissions as Permission[])
      : [],
    status: data.status as IdentityStatus,
  };
}

/**
 * Retrieve the institutional role assignment associated with a user.
 *
 * Source of truth: public.user_roles
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

  if (!data) return null;

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
 * List every Command Centre admin row.
 * Founder-only at the API layer; this function does not gate.
 */
export async function getAllIdentities(): Promise<IamIdentity[]> {
  const { data, error } = await supabaseAdmin
    .from('command_centre_admins')
    .select(
      'id, user_id, name, email, role, designation, organization, department, office, permissions, status'
    )
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[IAM] Failed to list identities:', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id ?? null,
    name: row.name,
    email: row.email,
    role: row.role as Role,
    designation: row.designation ?? null,
    organization: row.organization ?? null,
    department: row.department ?? null,
    office: row.office ?? null,
    permissions: Array.isArray(row.permissions)
      ? (row.permissions as Permission[])
      : [],
    status: row.status as IdentityStatus,
  }));
}

// ---------------------------------------------------------------------------
// Database writes
// ---------------------------------------------------------------------------

export interface CreateIdentityInput {
  user_id: string;
  name: string;
  email: string;
  role: Role;
  designation?: string | null;
  organization?: string | null;
  department?: string | null;
  office?: string | null;
  permissions: Permission[];
  status?: IdentityStatus;
  actor_user_id: string;
}

/**
 * Create a new Command Centre admin identity.
 * Validation of who may create what must be done by the API before calling this.
 */
export async function createIdentity(
  input: CreateIdentityInput
): Promise<IamIdentity> {
  const { data, error } = await supabaseAdmin
    .from('command_centre_admins')
    .insert({
      user_id: input.user_id,
      name: input.name,
      email: input.email,
      role: input.role,
      designation: input.designation ?? null,
      organization: input.organization ?? null,
      department: input.department ?? null,
      office: input.office ?? null,
      permissions: input.permissions,
      status: input.status ?? 'ACTIVE',
      created_by: input.actor_user_id,
      granted_by: input.actor_user_id,
      granted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select(
      'id, user_id, name, email, role, designation, organization, department, office, permissions, status'
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create admin identity.');
  }

  return {
    id: data.id,
    user_id: data.user_id ?? null,
    name: data.name,
    email: data.email,
    role: data.role as Role,
    designation: data.designation ?? null,
    organization: data.organization ?? null,
    department: data.department ?? null,
    office: data.office ?? null,
    permissions: Array.isArray(data.permissions)
      ? (data.permissions as Permission[])
      : [],
    status: data.status as IdentityStatus,
  };
}

export interface UpdateIdentityInput {
  id: string;
  name?: string;
  designation?: string | null;
  organization?: string | null;
  department?: string | null;
  office?: string | null;
  role?: Role;
  permissions?: Permission[];
  status?: IdentityStatus;
  actor_user_id: string;
}

/**
 * Update an existing Command Centre admin identity.
 * Role and permissions changes must be validated by the API before calling this.
 */
export async function updateIdentity(
  input: UpdateIdentityInput
): Promise<IamIdentity> {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    updated_by: input.actor_user_id,
  };

  if (input.name !== undefined) patch.name = input.name;
  if (input.designation !== undefined) patch.designation = input.designation;
  if (input.organization !== undefined) patch.organization = input.organization;
  if (input.department !== undefined) patch.department = input.department;
  if (input.office !== undefined) patch.office = input.office;
  if (input.role !== undefined) patch.role = input.role;
  if (input.permissions !== undefined) patch.permissions = input.permissions;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabaseAdmin
    .from('command_centre_admins')
    .update(patch)
    .eq('id', input.id)
    .select(
      'id, user_id, name, email, role, designation, organization, department, office, permissions, status'
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to update admin identity.');
  }

  return {
    id: data.id,
    user_id: data.user_id ?? null,
    name: data.name,
    email: data.email,
    role: data.role as Role,
    designation: data.designation ?? null,
    organization: data.organization ?? null,
    department: data.department ?? null,
    office: data.office ?? null,
    permissions: Array.isArray(data.permissions)
      ? (data.permissions as Permission[])
      : [],
    status: data.status as IdentityStatus,
  };
}

/**
 * Soft-deactivate a Command Centre admin.
 * Never hard-deletes: audit trail matters.
 */
export async function deactivateIdentity(
  id: string,
  actor_user_id: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('command_centre_admins')
    .update({
      status: 'INACTIVE',
      updated_at: new Date().toISOString(),
      updated_by: actor_user_id,
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
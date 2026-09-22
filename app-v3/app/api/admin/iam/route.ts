import { NextRequest, NextResponse } from 'next/server';
import {
  getIamIdentity,
  getIamRole,
  hasPermission,
  getAllIdentities,
  createIdentity,
  updateIdentity,
  deactivateIdentity,
  assertCanGrant,
  isFounder,
  PRIVILEGED_ROLES,
  GRANTABLE_ROLES,
  type Permission,
  type Role,
} from '@/lib/iam';
import { requireAdmin, requireIdentity } from '@/lib/admin-auth';

// ---------------------------------------------------------------------------
// GET — resolve current user's identity (cookie-based, same as every other
// admin route in this codebase)
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const auth = await requireIdentity();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { user, identity } = auth;

    const [role, isAdmin] = await Promise.all([
      getIamRole(user.id),
      hasPermission(identity, 'ADMIN'),
    ]);

    return NextResponse.json({
      authenticated: true,
      identity,
      role,
      permissions: identity.permissions,
      isAdmin,
      isFounder: isFounder(identity),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to resolve institutional identity.';

    console.error('IAM GET error:', error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create a new Command Centre admin
// ---------------------------------------------------------------------------

interface PostBody {
  user_id?: string;
  name?: string;
  email?: string;
  role?: Role;
  designation?: string | null;
  organization?: string | null;
  department?: string | null;
  office?: string | null;
  permissions?: Permission[];
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { user, identity: actor } = auth;

    const body = (await request.json()) as PostBody;

    const userId = body.user_id?.trim();
    const name = body.name?.trim();
    const email = body.email?.trim();
    const role = body.role;
    const permissions = Array.isArray(body.permissions) ? body.permissions : [];

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required.' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'name is required.' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'email is required.' }, { status: 400 });
    }
    if (!role) {
      return NextResponse.json({ error: 'role is required.' }, { status: 400 });
    }

    if (!PRIVILEGED_ROLES.includes(actor.role) && !GRANTABLE_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Role "${role}" cannot be granted.` },
        { status: 403 }
      );
    }

    if (role === 'founder') {
      return NextResponse.json(
        { error: 'Founder role cannot be granted through the API.' },
        { status: 403 }
      );
    }

    try {
      assertCanGrant(actor, role, permissions);
    } catch (grantError) {
      return NextResponse.json(
        {
          error:
            grantError instanceof Error ? grantError.message : 'Grant rejected.',
        },
        { status: 403 }
      );
    }

    const created = await createIdentity({
      user_id: userId,
      name,
      email,
      role,
      designation: body.designation ?? null,
      organization: body.organization ?? null,
      department: body.department ?? null,
      office: body.office ?? null,
      permissions,
      status: 'ACTIVE',
      actor_user_id: user.id,
    });

    return NextResponse.json({ success: true, identity: created });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to create identity.';

    console.error('IAM POST error:', error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — update an existing Command Centre admin
// ---------------------------------------------------------------------------

interface PatchBody {
  id?: string;
  name?: string;
  designation?: string | null;
  organization?: string | null;
  department?: string | null;
  office?: string | null;
  role?: Role;
  permissions?: Permission[];
  status?: 'ACTIVE' | 'INACTIVE';
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { user, identity: actor } = auth;

    const body = (await request.json()) as PatchBody;
    const id = body.id?.trim();

    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const all = await getAllIdentities();
    const target = all.find((entry) => entry.id === id);

    if (!target) {
      return NextResponse.json({ error: 'Identity not found.' }, { status: 404 });
    }

    if (target.role === 'founder' && !isFounder(actor)) {
      return NextResponse.json(
        { error: 'Only a founder can modify a founder.' },
        { status: 403 }
      );
    }

    if (body.role !== undefined && body.role !== target.role) {
      if (body.role === 'founder') {
        return NextResponse.json(
          { error: 'Founder role cannot be granted through the API.' },
          { status: 403 }
        );
      }

      try {
        assertCanGrant(actor, body.role, body.permissions ?? target.permissions);
      } catch (grantError) {
        return NextResponse.json(
          {
            error:
              grantError instanceof Error ? grantError.message : 'Grant rejected.',
          },
          { status: 403 }
        );
      }
    }

    if (body.permissions !== undefined && body.role === undefined) {
      try {
        assertCanGrant(actor, target.role, body.permissions);
      } catch (grantError) {
        return NextResponse.json(
          {
            error:
              grantError instanceof Error ? grantError.message : 'Grant rejected.',
          },
          { status: 403 }
        );
      }
    }

    const updated = await updateIdentity({
      id,
      name: body.name,
      designation: body.designation,
      organization: body.organization,
      department: body.department,
      office: body.office,
      role: body.role,
      permissions: body.permissions,
      status: body.status,
      actor_user_id: user.id,
    });

    return NextResponse.json({ success: true, identity: updated });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to update identity.';

    console.error('IAM PATCH error:', error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — soft-deactivate a Command Centre admin
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { user, identity: actor } = auth;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')?.trim();

    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const all = await getAllIdentities();
    const target = all.find((entry) => entry.id === id);

    if (!target) {
      return NextResponse.json({ error: 'Identity not found.' }, { status: 404 });
    }

    if (target.role === 'founder') {
      return NextResponse.json(
        { error: 'Founder cannot be deactivated through the API.' },
        { status: 403 }
      );
    }

    if (target.id === actor.id) {
      return NextResponse.json(
        { error: 'You cannot deactivate your own identity.' },
        { status: 403 }
      );
    }

    if (!PRIVILEGED_ROLES.includes(actor.role)) {
      return NextResponse.json(
        { error: 'Only a founder or chairperson can deactivate identities.' },
        { status: 403 }
      );
    }

    await deactivateIdentity(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to deactivate identity.';

    console.error('IAM DELETE error:', error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
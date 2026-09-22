import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getAllIdentities } from '@/lib/iam';

export async function GET() {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const identities = await getAllIdentities();

    return NextResponse.json({
      success: true,
      identities,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to load registry.';
    console.error('IAM list GET error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
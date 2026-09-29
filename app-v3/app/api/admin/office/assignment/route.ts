import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-auth';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server configuration is incomplete.');
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// POST — create or replace the ACTIVE assignment for an office.
//
// Body: {
//   office_slug: string,
//   author_id: string,                 // authors.id
//   title: string,                     // e.g. 'Founder' | 'Chairperson'
//   subtitle?: string,                 // e.g. 'Founder · CEO · CTO'
//   mandate_statement?: string,
// }
//
// If an ACTIVE assignment already exists for the office, it is ENDED
// (ended_at = now, status = 'ENDED') before the new ACTIVE row is created.
// This preserves tenure history.
//
// Requires: authenticated admin.
// ---------------------------------------------------------------------------

interface PostBody {
  office_slug?: string;
  author_id?: string;
  title?: string;
  subtitle?: string;
  mandate_statement?: string;
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

    let body: PostBody;
    try {
      body = (await request.json()) as PostBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const officeSlug = body.office_slug?.trim();
    const authorId = body.author_id?.trim();
    const title = body.title?.trim();

    if (!officeSlug || !authorId || !title) {
      return NextResponse.json(
        { error: 'office_slug, author_id, and title are required.' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Resolve office
    const { data: office, error: officeError } = await supabase
      .from('offices')
      .select('id, slug')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (officeError || !office) {
      return NextResponse.json(
        { error: 'Office not found.' },
        { status: 404 }
      );
    }

    // Verify author exists
    const { data: author, error: authorError } = await supabase
      .from('authors')
      .select('id, name')
      .eq('id', authorId)
      .maybeSingle();

    if (authorError || !author) {
      return NextResponse.json(
        { error: 'Author not found.' },
        { status: 404 }
      );
    }

    // End any current ACTIVE assignment for this office (tenure history)
    const { error: endError } = await supabase
      .from('office_assignments')
      .update({
        status: 'ENDED',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('office_id', office.id)
      .eq('status', 'ACTIVE');

    if (endError) {
      console.error('Failed to end prior assignment:', endError);
      return NextResponse.json(
        { error: 'Unable to record tenure transition.' },
        { status: 500 }
      );
    }

    // Create new ACTIVE assignment
    const { data: created, error: createError } = await supabase
      .from('office_assignments')
      .insert({
        office_id: office.id,
        author_id: author.id,
        title,
        subtitle: body.subtitle ?? null,
        mandate_statement: body.mandate_statement ?? null,
        status: 'ACTIVE',
        started_at: new Date().toISOString(),
      })
      .select(
        'id, office_id, author_id, title, subtitle, mandate_statement, status, started_at'
      )
      .single();

    if (createError) {
      console.error('Office assignment POST error:', createError);
      return NextResponse.json(
        { error: createError.message || 'Unable to assign officeholder.' },
        { status: 500 }
      );
    }

    // Mark office as ACTIVE if it was VACANT
    if (office.id) {
      await supabase
        .from('offices')
        .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
        .eq('id', office.id);
    }

    return NextResponse.json({ success: true, assignment: created });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to assign officeholder.';
    console.error('Office assignment POST exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — end the ACTIVE assignment of an office, marking it VACANT.
//
// ?office_slug=<slug>
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

    const { searchParams } = new URL(request.url);
    const officeSlug = searchParams.get('office_slug')?.trim();

    if (!officeSlug) {
      return NextResponse.json(
        { error: 'office_slug is required.' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: office, error: officeError } = await supabase
      .from('offices')
      .select('id, slug, name')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (officeError || !office) {
      return NextResponse.json(
        { error: 'Office not found.' },
        { status: 404 }
      );
    }

    // End the active assignment
    const { error: endError } = await supabase
      .from('office_assignments')
      .update({
        status: 'ENDED',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('office_id', office.id)
      .eq('status', 'ACTIVE');

    if (endError) {
      console.error('Failed to end assignment:', endError);
      return NextResponse.json(
        { error: 'Unable to end assignment.' },
        { status: 500 }
      );
    }

    // Set office back to VACANT
    await supabase
      .from('offices')
      .update({ status: 'VACANT', updated_at: new Date().toISOString() })
      .eq('id', office.id);

    return NextResponse.json({
      success: true,
      message: `Office "${office.name}" is now vacant.`,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to end assignment.';
    console.error('Office assignment DELETE exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
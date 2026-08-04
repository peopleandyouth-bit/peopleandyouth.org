import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { draftText } = await request.json();

    if (!draftText) {
      return NextResponse.json({ error: 'Draft text is required.' }, { status: 400 });
    }

    // AI Processing Simulation with strict Human Approval rule
    const suggestedAbstract = `Summary: ${draftText.slice(0, 150)}...`;
    const suggestedTags = ['Public Policy', 'Constitutional Law', 'Empirical Governance'];

    return NextResponse.json({
      summary: suggestedAbstract,
      suggestedTags,
      seoTitle: 'Optimized Title | People & Youth',
      requiresHumanApproval: true
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

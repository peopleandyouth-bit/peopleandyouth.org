import { createClient } from '@/lib/supabase/server';
import { Opportunity, OpportunityApplication, OpportunityFilters, CreateOpportunityDTO, SubmitApplicationDTO, ApplicationStatus } from '@/types/opportunity';

export class OpportunityRepository {
  static async getPublicOpportunities(filters: OpportunityFilters = {}): Promise<{ data: Opportunity[]; count: number }> {
    const supabase = await createClient();
    const { category, type, location_type, search, page = 1, limit = 12 } = filters;

    let query = supabase
      .from('opportunities')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false });

    if (category && category !== 'all') query = query.eq('category', category);
    if (type && type !== 'all') query = query.eq('type', type);
    if (location_type && location_type !== 'all') query = query.eq('location_type', location_type);
    if (search && search.trim() !== '') {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,department.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to fetch opportunities: ${error.message}`);

    return { data: (data as Opportunity[]) || [], count: count || 0 };
  }

  static async getBySlug(slug: string): Promise<Opportunity | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data as Opportunity;
  }

  static async getAllAdmin(filters: OpportunityFilters = {}): Promise<{ data: Opportunity[]; count: number }> {
    const supabase = await createClient();
    const { search, page = 1, limit = 20 } = filters;

    let query = supabase
      .from('opportunities')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search && search.trim() !== '') {
      query = query.or(`title.ilike.%${search}%,department.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to fetch admin opportunities: ${error.message}`);

    return { data: (data as Opportunity[]) || [], count: count || 0 };
  }

  static async create(payload: CreateOpportunityDTO, slug: string): Promise<Opportunity> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('opportunities')
      .insert({
        ...payload,
        slug,
        published_at: payload.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create opportunity: ${error.message}`);
    return data as Opportunity;
  }

  static async update(id: string, payload: Partial<CreateOpportunityDTO>): Promise<Opportunity> {
    const supabase = await createClient();
    const updatePayload: Record<string, unknown> = { ...payload };

    if (payload.status === 'published') {
      updatePayload.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('opportunities')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update opportunity: ${error.message}`);
    return data as Opportunity;
  }

  static async delete(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete opportunity: ${error.message}`);
  }

  static async submitApplication(payload: SubmitApplicationDTO, applicantId?: string): Promise<OpportunityApplication> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('opportunity_applications')
      .insert({
        ...payload,
        applicant_id: applicantId || null,
        status: 'submitted',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to submit application: ${error.message}`);
    return data as OpportunityApplication;
  }

  static async getApplicationsForOpportunity(opportunityId: string): Promise<OpportunityApplication[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('opportunity_applications')
      .select('*, opportunity:opportunities(title, category)')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch applications: ${error.message}`);
    return (data as OpportunityApplication[]) || [];
  }

  static async updateApplicationStatus(id: string, status: ApplicationStatus, notes?: string): Promise<OpportunityApplication> {
    const supabase = await createClient();
    const updatePayload: Record<string, unknown> = { status };
    if (notes !== undefined) updatePayload.admin_notes = notes;

    const { data, error } = await supabase
      .from('opportunity_applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update application status: ${error.message}`);
    return data as OpportunityApplication;
  }
}

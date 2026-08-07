import { supabase } from '@/lib/supabaseClient';
import { InstitutionalEntity, EntityType, EntityStatus } from '@/types/institution-os';

export class SchemaRegistry {
  /**
   * Fetch any institutional entity by type and slug
   */
  static async getEntityBySlug(type: EntityType, slug: string): Promise<InstitutionalEntity | null> {
    const { data, error } = await supabase
      .from('institutional_entities')
      .select('*')
      .eq('entity_type', type)
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return data as InstitutionalEntity;
  }

  /**
   * List all entities of a given type
   */
  static async listEntities(type?: EntityType, status?: EntityStatus): Promise<InstitutionalEntity[]> {
    let query = supabase.from('institutional_entities').select('*').order('created_at', { ascending: false });

    if (type) query = query.eq('entity_type', type);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error || !data) return [];
    return data as InstitutionalEntity[];
  }

  /**
   * Upsert an institutional entity (Creates or updates with automated versioning)
   */
  static async upsertEntity(entity: Partial<InstitutionalEntity>): Promise<{ data: InstitutionalEntity | null; error: any }> {
    const payload = {
      entity_type: entity.entity_type || 'page',
      title: entity.title,
      slug: entity.slug || entity.title?.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      status: entity.status || 'draft',
      summary: entity.summary || '',
      content_markup: entity.content_markup || '',
      metadata: entity.metadata || {},
      seo_data: entity.seo_data || { meta_title: entity.title, meta_description: entity.summary, keywords: [] },
      featured_image: entity.featured_image || '',
      author_name: entity.author_name || 'Swaraj Shandilya',
      updated_at: new Date().toISOString(),
    };

    if (entity.id) {
      const { data, error } = await supabase
        .from('institutional_entities')
        .update(payload)
        .eq('id', entity.id)
        .select()
        .single();
      return { data: data as InstitutionalEntity, error };
    } else {
      const { data, error } = await supabase
        .from('institutional_entities')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select()
        .single();
      return { data: data as InstitutionalEntity, error };
    }
  }

  /**
   * Archive an entity
   */
  static async archiveEntity(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('institutional_entities')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  }
}
'use server';

import { revalidatePath } from 'next/cache';
import { OpportunityRepository } from '@/lib/repositories/opportunity.repository';
import { CreateOpportunityDTO, SubmitApplicationDTO, ApplicationStatus, OpportunityStatus } from '@/types/opportunity';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createOpportunityAction(payload: CreateOpportunityDTO) {
  try {
    const baseSlug = slugify(payload.title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const opportunity = await OpportunityRepository.create(payload, slug);

    revalidatePath('/opportunities');
    revalidatePath('/admin/opportunities');
    return { success: true, data: opportunity };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create opportunity';
    return { success: false, error: message };
  }
}

export async function updateOpportunityAction(id: string, payload: Partial<CreateOpportunityDTO>) {
  try {
    const opportunity = await OpportunityRepository.update(id, payload);

    revalidatePath('/opportunities');
    revalidatePath(`/opportunities/${opportunity.slug}`);
    revalidatePath('/admin/opportunities');
    return { success: true, data: opportunity };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update opportunity';
    return { success: false, error: message };
  }
}

export async function setOpportunityStatusAction(id: string, status: OpportunityStatus) {
  try {
    const opportunity = await OpportunityRepository.update(id, { status });

    revalidatePath('/opportunities');
    revalidatePath('/admin/opportunities');
    return { success: true, data: opportunity };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update status';
    return { success: false, error: message };
  }
}

export async function deleteOpportunityAction(id: string) {
  try {
    await OpportunityRepository.delete(id);

    revalidatePath('/opportunities');
    revalidatePath('/admin/opportunities');
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete opportunity';
    return { success: false, error: message };
  }
}

export async function submitApplicationAction(payload: SubmitApplicationDTO, applicantId?: string) {
  try {
    if (!payload.full_name || !payload.email || !payload.resume_url) {
      return { success: false, error: 'Full name, email, and resume are required.' };
    }

    const application = await OpportunityRepository.submitApplication(payload, applicantId);
    return { success: true, data: application };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit application';
    return { success: false, error: message };
  }
}

export async function updateApplicationStatusAction(id: string, opportunityId: string, status: ApplicationStatus, notes?: string) {
  try {
    const updated = await OpportunityRepository.updateApplicationStatus(id, status, notes);
    revalidatePath(`/admin/opportunities/${opportunityId}/applications`);
    return { success: true, data: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update application status';
    return { success: false, error: message };
  }
}

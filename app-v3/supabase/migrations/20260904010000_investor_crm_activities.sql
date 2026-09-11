-- ============================================================
-- PEOPLE & YOUTH — INVESTOR CRM ACTIVITIES
-- PHASE 5 — INSTITUTIONAL OPERATIONS FOUNDATION
-- ADDITIVE ONLY
-- ============================================================

create table if not exists public.investor_crm_activities (
  id uuid primary key default gen_random_uuid(),

  investor_id uuid not null
    references public.investor_profiles(id)
    on delete cascade,

  activity_type text not null default 'NOTE',

  subject text,
  details text,

  occurred_at timestamptz not null default now(),

  due_at timestamptz,

  status text not null default 'COMPLETED',

  assigned_admin text,

  created_by uuid,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint investor_crm_activities_activity_type_check
    check (
      activity_type in (
        'NOTE',
        'CALL',
        'EMAIL',
        'MEETING',
        'STAGE_CHANGE',
        'FOLLOW_UP',
        'KYC',
        'NDA',
        'DUE_DILIGENCE',
        'COMMITMENT',
        'INVESTMENT',
        'OTHER'
      )
    ),

  constraint investor_crm_activities_status_check
    check (
      status in (
        'OPEN',
        'COMPLETED',
        'CANCELLED'
      )
    )
);

create index if not exists investor_crm_activities_investor_id_idx
  on public.investor_crm_activities(investor_id);

create index if not exists investor_crm_activities_due_at_idx
  on public.investor_crm_activities(due_at);

create index if not exists investor_crm_activities_status_due_at_idx
  on public.investor_crm_activities(status, due_at);

create index if not exists investor_crm_activities_occurred_at_idx
  on public.investor_crm_activities(occurred_at desc);

create index if not exists investor_crm_activities_assigned_admin_idx
  on public.investor_crm_activities(assigned_admin);

comment on table public.investor_crm_activities is
  'Institutional investor relationship activity, follow-up, stage history, and operational audit trail.';

comment on column public.investor_crm_activities.activity_type is
  'Institutional activity classification.';

comment on column public.investor_crm_activities.due_at is
  'Optional operational deadline for open actions.';

comment on column public.investor_crm_activities.status is
  'Operational status of the activity or action.';

-- ============================================================
-- UPDATED_AT MAINTENANCE
-- ============================================================

create or replace function public.set_investor_crm_activities_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists investor_crm_activities_updated_at
on public.investor_crm_activities;

create trigger investor_crm_activities_updated_at
before update on public.investor_crm_activities
for each row
execute function public.set_investor_crm_activities_updated_at();

-- Investor Data Room foundation
-- Safe additive migration.

create table if not exists public.investor_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  file_path text not null,
  file_type text,
  file_size_bytes bigint,
  access_level text not null default 'APPROVED',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.investor_documents
  add column if not exists title text;

alter table public.investor_documents
  add column if not exists description text;

alter table public.investor_documents
  add column if not exists category text;

alter table public.investor_documents
  add column if not exists file_path text;

alter table public.investor_documents
  add column if not exists file_type text;

alter table public.investor_documents
  add column if not exists file_size_bytes bigint;

alter table public.investor_documents
  add column if not exists access_level text default 'APPROVED';

alter table public.investor_documents
  add column if not exists display_order integer default 0;

alter table public.investor_documents
  add column if not exists is_active boolean default true;

alter table public.investor_documents
  add column if not exists created_at timestamptz default now();

alter table public.investor_documents
  add column if not exists updated_at timestamptz default now();

create index if not exists investor_documents_active_order_idx
on public.investor_documents (is_active, display_order);

create index if not exists investor_documents_access_level_idx
on public.investor_documents (access_level);

-- Private investor storage bucket.
insert into storage.buckets (id, name, public)
values ('investor-data-room', 'investor-data-room', false)
on conflict (id) do update
set public = false;

-- Storage is intentionally private.
-- Application access is mediated by the authenticated investor
-- document API and short-lived signed URLs.

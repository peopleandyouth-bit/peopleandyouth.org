-- Safe, Idempotent Migration: Global Opportunity Engine

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'opportunity_category') THEN
        CREATE TYPE opportunity_category AS ENUM ('career', 'fellowship', 'scholarship', 'grant', 'residency');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'opportunity_type') THEN
        CREATE TYPE opportunity_type AS ENUM ('full_time', 'part_time', 'contract', 'fellowship_term', 'grant_award');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'location_type') THEN
        CREATE TYPE location_type AS ENUM ('on_site', 'hybrid', 'remote');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'opportunity_status') THEN
        CREATE TYPE opportunity_status AS ENUM ('draft', 'published', 'archived', 'closed');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE application_status AS ENUM ('submitted', 'under_review', 'shortlisted', 'interviewed', 'accepted', 'rejected', 'withdrawn');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category opportunity_category NOT NULL,
    type opportunity_type NOT NULL,
    location_type location_type NOT NULL,
    location VARCHAR(255) NOT NULL DEFAULT 'Global / Remote',
    department VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    eligibility TEXT,
    benefits TEXT,
    requirements JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    status opportunity_status NOT NULL DEFAULT 'draft',
    deadline TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.opportunity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    resume_url TEXT NOT NULL,
    cover_letter TEXT,
    answers JSONB DEFAULT '{}'::jsonb,
    status application_status NOT NULL DEFAULT 'submitted',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_slug ON public.opportunities(slug);
CREATE INDEX IF NOT EXISTS idx_opportunities_status_category ON public.opportunities(status, category);
CREATE INDEX IF NOT EXISTS idx_opportunities_published_at ON public.opportunities(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_opp_id ON public.opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_status ON public.opportunity_applications(status);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_email ON public.opportunity_applications(email);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public opportunities are viewable by everyone" ON public.opportunities;
CREATE POLICY "Public opportunities are viewable by everyone"
    ON public.opportunities FOR SELECT
    USING (status = 'published');

DROP POLICY IF EXISTS "Applicants can submit applications" ON public.opportunity_applications;
CREATE POLICY "Applicants can submit applications"
    ON public.opportunity_applications FOR INSERT
    WITH CHECK (true);

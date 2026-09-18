-- ============================================================================
-- PEOPLE & YOUTH — PHASE 15 LAYER 3 MIGRATION
-- Institutional Data Room
-- ============================================================================
-- Introduces:
--   1. investor_dd_access — explicit per-investor DD grants
--   2. investor_access_requests — investors requesting DD access
--   3. investor_upload_requests — founder requests for materials
--   4. investor_uploads — actual files submitted by investors
--
-- Design principles:
--   - DD access is never granted automatically.
--   - All requests are append-only records.
--   - Investors can read their own grants, requests, and uploads.
--   - Investors can create access requests.
--   - Only admins (via service-role) can grant DD access, create
--     upload requests, or approve uploads.
--
-- Applied: 2026-09-18
-- ============================================================================

-- ============================================================================
-- 1. investor_dd_access
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.investor_dd_access (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id  uuid NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  granted_at   timestamptz NOT NULL DEFAULT now(),
  granted_by   text,
  notes        text,
  UNIQUE (investor_id)
);

CREATE INDEX IF NOT EXISTS investor_dd_access_investor_idx
  ON public.investor_dd_access (investor_id);

ALTER TABLE public.investor_dd_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS investor_dd_access_select_own ON public.investor_dd_access;
CREATE POLICY investor_dd_access_select_own
  ON public.investor_dd_access
  FOR SELECT
  TO authenticated
  USING (
    investor_id IN (
      SELECT id FROM public.investor_profiles
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 2. investor_access_requests
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.investor_access_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id   uuid NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  scope         text NOT NULL,
  reason        text,
  status        text NOT NULL DEFAULT 'PENDING',
  decided_at    timestamptz,
  decided_by    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS investor_access_requests_investor_idx
  ON public.investor_access_requests (investor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS investor_access_requests_status_idx
  ON public.investor_access_requests (status, created_at DESC);

ALTER TABLE public.investor_access_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS investor_access_requests_select_own ON public.investor_access_requests;
CREATE POLICY investor_access_requests_select_own
  ON public.investor_access_requests
  FOR SELECT
  TO authenticated
  USING (
    investor_id IN (
      SELECT id FROM public.investor_profiles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS investor_access_requests_insert_own ON public.investor_access_requests;
CREATE POLICY investor_access_requests_insert_own
  ON public.investor_access_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    investor_id IN (
      SELECT id FROM public.investor_profiles
      WHERE user_id = auth.uid()
        AND verification_status = 'VERIFIED'
        AND access_level = 'APPROVED'
    )
    AND status = 'PENDING'
  );

-- ============================================================================
-- 3. investor_upload_requests
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.investor_upload_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id   uuid NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  status        text NOT NULL DEFAULT 'OPEN',
  due_at        timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz,
  created_by    text
);

CREATE INDEX IF NOT EXISTS investor_upload_requests_investor_idx
  ON public.investor_upload_requests (investor_id, created_at DESC);

ALTER TABLE public.investor_upload_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS investor_upload_requests_select_own ON public.investor_upload_requests;
CREATE POLICY investor_upload_requests_select_own
  ON public.investor_upload_requests
  FOR SELECT
  TO authenticated
  USING (
    investor_id IN (
      SELECT id FROM public.investor_profiles
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. investor_uploads
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.investor_uploads (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id        uuid NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  request_id         uuid REFERENCES public.investor_upload_requests(id) ON DELETE SET NULL,
  file_name          text NOT NULL,
  file_path          text NOT NULL,
  file_type          text,
  file_size_bytes    bigint,
  status             text NOT NULL DEFAULT 'SUBMITTED',
  review_notes       text,
  uploaded_at        timestamptz NOT NULL DEFAULT now(),
  reviewed_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS investor_uploads_investor_idx
  ON public.investor_uploads (investor_id, uploaded_at DESC);

CREATE INDEX IF NOT EXISTS investor_uploads_request_idx
  ON public.investor_uploads (request_id);

ALTER TABLE public.investor_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS investor_uploads_select_own ON public.investor_uploads;
CREATE POLICY investor_uploads_select_own
  ON public.investor_uploads
  FOR SELECT
  TO authenticated
  USING (
    investor_id IN (
      SELECT id FROM public.investor_profiles
      WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.investor_dd_access IS
  'Phase 15 Layer 3 — Explicit founder grants of DD access.';
COMMENT ON TABLE public.investor_access_requests IS
  'Phase 15 Layer 3 — Investor requests for elevated access.';
COMMENT ON TABLE public.investor_upload_requests IS
  'Phase 15 Layer 3 — Founder-issued requests for investor materials.';
COMMENT ON TABLE public.investor_uploads IS
  'Phase 15 Layer 3 — Investor-submitted files.';
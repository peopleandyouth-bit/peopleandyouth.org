-- ============================================================================
-- PEOPLE & YOUTH — PHASE 15 MIGRATION
-- Investor Portal RLS Policies
-- ============================================================================
-- Purpose:
--   Enable investors to read their own profile and the documents they are
--   eligible for, directly from the browser with their own Supabase session,
--   under row-level security.
--
-- Design principles:
--   - Additive only. Existing pre-existing policies (gated by the
--     is_investor_admin() helper) remain in effect.
--   - Investors can only read their own profile.
--   - Investors can read investor_documents where is_active = true AND
--     access_level IN ('PUBLIC', 'APPROVED').
--   - No write policies. All investor writes flow through server routes.
--   - Admin routes continue to use service-role and bypass RLS.
--
-- Applied: 2026-09-17
-- ============================================================================

DROP POLICY IF EXISTS investor_profiles_select_own ON public.investor_profiles;
CREATE POLICY investor_profiles_select_own
  ON public.investor_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS investor_documents_select_active ON public.investor_documents;
CREATE POLICY investor_documents_select_active
  ON public.investor_documents
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND access_level IN ('PUBLIC', 'APPROVED')
  );
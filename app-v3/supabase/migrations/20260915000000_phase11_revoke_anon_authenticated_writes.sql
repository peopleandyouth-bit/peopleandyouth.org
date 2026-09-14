-- ============================================================================
-- PEOPLE & YOUTH — PHASE 11A MIGRATION
-- Revoke write access from anon and authenticated roles
-- ============================================================================
-- Rationale:
--   Anonymous and authenticated browser sessions must never write
--   directly to investor tables. TRUNCATE bypasses RLS entirely, so
--   revoking TRUNCATE is the most urgent part of this migration.
--
--   All investor mutations flow through server-side routes using the
--   service-role key.
--
-- Applied: 2026-09-15
-- ============================================================================

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON
  public.investor_profiles,
  public.investor_crm_logs,
  public.investor_crm_activities,
  public.investor_crm_audit_log,
  public.investor_automation_scans,
  public.investor_cms_config,
  public.investor_documents,
  public.investor_admin_allowlist
FROM anon;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON
  public.investor_profiles,
  public.investor_crm_logs,
  public.investor_crm_activities,
  public.investor_crm_audit_log,
  public.investor_automation_scans,
  public.investor_cms_config,
  public.investor_documents,
  public.investor_admin_allowlist
FROM authenticated;
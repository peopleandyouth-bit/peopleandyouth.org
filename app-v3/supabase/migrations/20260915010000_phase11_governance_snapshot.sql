-- ============================================================================
-- PEOPLE & YOUTH — PHASE 11B MIGRATION
-- Investor governance snapshot function
-- ============================================================================
-- Rationale:
--   Provides a single-call view of the institutional governance
--   posture: IAM, RLS, grants, audit coverage, automation execution,
--   and investor data state. Consumed by
--   GET /api/admin/investor-governance (requirePermission VIEW).
--
-- Applied: 2026-09-15
-- ============================================================================

CREATE OR REPLACE FUNCTION public.investor_governance_snapshot()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'generated_at', now(),
    'iam', (
      SELECT jsonb_build_object(
        'admin_count', COUNT(*),
        'active_admin_count', COUNT(*) FILTER (WHERE status = 'ACTIVE'),
        'roles', COALESCE(
          jsonb_agg(DISTINCT role) FILTER (WHERE role IS NOT NULL),
          '[]'::jsonb
        )
      )
      FROM public.command_centre_admins
    ),
    'rls', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'table_name', c.relname,
            'rls_enabled', c.relrowsecurity,
            'policy_count', (
              SELECT COUNT(*)
              FROM pg_policies p
              WHERE p.schemaname = 'public' AND p.tablename = c.relname
            )
          )
          ORDER BY c.relname
        ),
        '[]'::jsonb
      )
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND (
          c.relname LIKE 'investor%'
          OR c.relname IN ('command_centre_admins', 'user_roles')
        )
    ),
    'grants', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'grantee', grantee,
            'table_name', table_name,
            'privilege_type', privilege_type
          )
        ),
        '[]'::jsonb
      )
      FROM information_schema.role_table_grants
      WHERE table_schema = 'public'
        AND table_name LIKE 'investor%'
        AND grantee IN ('anon', 'authenticated')
        AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
    ),
    'audit', (
      SELECT jsonb_build_object(
        'total_events', COUNT(*),
        'latest_event_at', MAX(occurred_at),
        'event_type_count', COUNT(DISTINCT event_type),
        'distinct_actors', COUNT(DISTINCT actor_email),
        'event_type_breakdown', COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object('event_type', event_type, 'count', cnt)
              ORDER BY cnt DESC
            )
            FROM (
              SELECT event_type, COUNT(*) AS cnt
              FROM public.investor_crm_audit_log
              GROUP BY event_type
            ) sub
          ),
          '[]'::jsonb
        )
      )
      FROM public.investor_crm_audit_log
    ),
    'automation', (
      SELECT jsonb_build_object(
        'total_runs', COUNT(*),
        'last_cron_at', MAX(occurred_at) FILTER (WHERE triggered_by = 'CRON'),
        'last_manual_at', MAX(occurred_at) FILTER (WHERE triggered_by = 'MANUAL'),
        'failed_runs', COUNT(*) FILTER (WHERE status = 'FAILED'),
        'successful_runs', COUNT(*) FILTER (WHERE status = 'SUCCESS')
      )
      FROM public.investor_automation_scans
    ),
    'investors', (
      SELECT jsonb_build_object(
        'total_investors', COUNT(*),
        'verified_approved', COUNT(*) FILTER (
          WHERE verification_status = 'VERIFIED' AND access_level = 'APPROVED'
        ),
        'with_crm_records', (
          SELECT COUNT(DISTINCT investor_id)
          FROM public.investor_crm_logs
        )
      )
      FROM public.investor_profiles
    )
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.investor_governance_snapshot() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.investor_governance_snapshot() FROM anon;
REVOKE ALL ON FUNCTION public.investor_governance_snapshot() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.investor_governance_snapshot() TO service_role;
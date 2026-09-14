-- ============================================================================
-- PEOPLE & YOUTH — PHASE 12A MIGRATION
-- Composite indexes for investor read-path optimization
-- ============================================================================
-- Rationale:
--   Eliminate the sort step on the two most frequently executed read
--   queries. At current scale (single-digit rows) Postgres correctly
--   chooses sequential scans; these indexes engage automatically as
--   the tables grow past ~500 rows.
--
-- Applied: 2026-09-15
-- ============================================================================

CREATE INDEX IF NOT EXISTS investor_crm_logs_investor_updated_idx
  ON public.investor_crm_logs (investor_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS investor_crm_activities_investor_occurred_idx
  ON public.investor_crm_activities (investor_id, occurred_at DESC);
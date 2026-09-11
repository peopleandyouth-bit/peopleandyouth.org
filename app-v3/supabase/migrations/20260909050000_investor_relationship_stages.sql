-- 5A.3 — Investor relationship stages
-- Canonical relationship stage is distinct from lifecycle_state,
-- verification_status, and access_level.

ALTER TABLE public.investor_crm_logs
DROP CONSTRAINT IF EXISTS investor_crm_logs_stage_check;

ALTER TABLE public.investor_crm_logs
ADD CONSTRAINT investor_crm_logs_stage_check
CHECK (
  stage IN (
    'PROSPECT',
    'CONTACTED',
    'INTERESTED',
    'NDA',
    'DUE_DILIGENCE',
    'COMMITMENT',
    'INVESTED'
  )
);

CREATE INDEX IF NOT EXISTS investor_crm_logs_stage_idx
ON public.investor_crm_logs (stage);

COMMENT ON COLUMN public.investor_crm_logs.stage IS
'Investor relationship stage. Distinct from lifecycle_state, verification_status, and access_level.';

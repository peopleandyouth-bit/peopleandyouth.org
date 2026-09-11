-- 5A.2 — Investor lifecycle states
-- Adds the canonical lifecycle state to investor_profiles.
-- Does NOT alter relationship stage, verification status, or access level.

ALTER TABLE public.investor_profiles
ADD COLUMN IF NOT EXISTS lifecycle_state text;

ALTER TABLE public.investor_profiles
ALTER COLUMN lifecycle_state SET DEFAULT 'PROSPECT';

UPDATE public.investor_profiles
SET lifecycle_state =
  CASE
    WHEN verification_status = 'PENDING'
         AND COALESCE(access_level, 'REGISTERED') = 'REGISTERED'
      THEN 'APPLICANT'
    WHEN verification_status = 'VERIFIED'
      THEN 'VERIFIED'
    ELSE 'PROSPECT'
  END
WHERE lifecycle_state IS NULL;

ALTER TABLE public.investor_profiles
ALTER COLUMN lifecycle_state SET NOT NULL;

ALTER TABLE public.investor_profiles
DROP CONSTRAINT IF EXISTS investor_profiles_lifecycle_state_check;

ALTER TABLE public.investor_profiles
ADD CONSTRAINT investor_profiles_lifecycle_state_check
CHECK (
  lifecycle_state IN (
    'PROSPECT',
    'APPLICANT',
    'REGISTERED',
    'VERIFIED',
    'QUALIFIED',
    'ACTIVE',
    'COMMITTED',
    'INVESTED',
    'INACTIVE',
    'DISQUALIFIED'
  )
);

CREATE INDEX IF NOT EXISTS investor_profiles_lifecycle_state_idx
ON public.investor_profiles (lifecycle_state);

COMMENT ON COLUMN public.investor_profiles.lifecycle_state IS
'Canonical investor lifecycle state. Distinct from relationship stage, verification status, and access level.';

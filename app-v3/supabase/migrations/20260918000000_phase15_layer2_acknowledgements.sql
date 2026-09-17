-- ============================================================================
-- PEOPLE & YOUTH — PHASE 15 LAYER 2 MIGRATION
-- Investor Portal — Document Acknowledgements
-- ============================================================================
-- Purpose:
--   Track investor acknowledgements of sensitive documents. Each
--   acknowledgement is a permanent, tamper-evident record with
--   timestamp + investor identity. Used for NDA, DD materials,
--   investment documentation.
--
-- Design principles:
--   - Append-only by convention. No UPDATE or DELETE flow.
--   - Investors can create and read their own acknowledgements.
--   - Admins read all (via service-role).
--   - Idempotent. Safe to run multiple times.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.investor_document_acknowledgements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id     uuid NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  document_id     uuid NOT NULL REFERENCES public.investor_documents(id) ON DELETE CASCADE,
  acknowledged_at timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (investor_id, document_id)
);

CREATE INDEX IF NOT EXISTS investor_document_ack_investor_idx
  ON public.investor_document_acknowledgements (investor_id, acknowledged_at DESC);

CREATE INDEX IF NOT EXISTS investor_document_ack_document_idx
  ON public.investor_document_acknowledgements (document_id);

ALTER TABLE public.investor_document_acknowledgements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS investor_document_ack_select_own ON public.investor_document_acknowledgements;
CREATE POLICY investor_document_ack_select_own
  ON public.investor_document_acknowledgements
  FOR SELECT
  TO authenticated
  USING (
    investor_id IN (
      SELECT id FROM public.investor_profiles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS investor_document_ack_insert_own ON public.investor_document_acknowledgements;
CREATE POLICY investor_document_ack_insert_own
  ON public.investor_document_acknowledgements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    investor_id IN (
      SELECT id FROM public.investor_profiles
      WHERE user_id = auth.uid()
        AND verification_status = 'VERIFIED'
        AND access_level = 'APPROVED'
    )
  );

COMMENT ON TABLE public.investor_document_acknowledgements IS
  'Phase 15 Layer 2 — Append-only investor document acknowledgements.';
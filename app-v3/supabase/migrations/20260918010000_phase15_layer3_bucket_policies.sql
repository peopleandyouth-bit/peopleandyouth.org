-- ============================================================================
-- PEOPLE & YOUTH — PHASE 15 LAYER 3
-- investor-uploads bucket: storage policies
-- ============================================================================
-- Enforce that no client can list, read, or write directly to the
-- investor-uploads bucket. All access is brokered by server-side
-- routes that generate signed upload/download URLs using the
-- service-role key.
--
-- Applied: 2026-09-18
-- ============================================================================

DROP POLICY IF EXISTS "investor_uploads_deny_anon" ON storage.objects;
DROP POLICY IF EXISTS "investor_uploads_deny_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "investor_uploads_service_role_all" ON storage.objects;

CREATE POLICY "investor_uploads_deny_anon"
  ON storage.objects
  FOR ALL
  TO anon
  USING (bucket_id != 'investor-uploads')
  WITH CHECK (bucket_id != 'investor-uploads');

CREATE POLICY "investor_uploads_deny_authenticated"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id != 'investor-uploads')
  WITH CHECK (bucket_id != 'investor-uploads');

CREATE POLICY "investor_uploads_service_role_all"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'investor-uploads')
  WITH CHECK (bucket_id = 'investor-uploads');
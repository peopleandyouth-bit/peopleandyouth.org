# CRM — Investor Relationship Management

## Investor profile

`public.investor_profiles` is the canonical record per investor:

| Column | Purpose |
|---|---|
| `id` (uuid, PK) | Investor identity |
| `user_id` (uuid) | Link to Supabase Auth user (nullable before first login) |
| `full_name`, `email`, `phone` | Contact |
| `organization`, `investor_type`, `geography` | Classification |
| `linkedin_url`, `website_url` | External profiles |
| `proposed_ticket_inr` (numeric) | Investor-stated ticket from application |
| `verification_status` | PENDING → VERIFIED |
| `kyc_completed` (bool) | KYC flag |
| `nda_signed` (bool), `nda_signed_at` | NDA record |
| `access_level` | REGISTERED → APPROVED (data room gate) |
| `notes` | Investor-supplied notes from application |
| `lifecycle_state` | Additional lifecycle phase (read by investor scoring) |
| `created_at`, `updated_at` | Timestamps |

**Investor state machine:**
# Database

## Supabase project

- **Region:** (deployed region — check Supabase dashboard)
- **Schema:** `public`
- **Auth:** Supabase Auth (email + password)
- **Storage buckets:** `investor-data-room` (private)

## Tables

### Investor tables

| Table | Purpose | RLS | Writes from |
|---|---|---|---|
| `investor_profiles` | One row per investor (registration data, verification, KYC/NDA flags) | ✅ | service-role only |
| `investor_crm_logs` | Latest CRM state per investor (stage, capital, probability) | ✅ | service-role only |
| `investor_crm_activities` | Activity timeline (CALL, EMAIL, MEETING, FOLLOW_UP, NOTE, COMMITMENT, ...) | ✅ | service-role only |
| `investor_crm_audit_log` | Immutable audit trail for every mutation | ✅ | service-role only |
| `investor_automation_scans` | Daily automation scan history | ✅ | service-role only |
| `investor_documents` | Data room catalog (title, category, access level, file path) | ✅ | service-role only |
| `investor_cms_config` | Investor CMS configuration (target raise, etc.) | ✅ | service-role only |
| `investor_admin_allowlist` | Legacy allowlist (email + role) | ✅ | service-role only |

### IAM tables

| Table | Purpose |
|---|---|
| `command_centre_admins` | Institutional identities (email, role, permissions array, status) |
| `user_roles` | Role assignments (optional, parallel to `command_centre_admins`) |

## Indexes

### Hot-path composite indexes (added Phase 12)

| Index | Purpose |
|---|---|
| `investor_crm_logs_investor_updated_idx` | Latest CRM record per investor |
| `investor_crm_activities_investor_occurred_idx` | Activity timeline per investor |
| `investor_crm_audit_log_investor_idx` | Audit events per investor (already existed) |
| `investor_crm_audit_log_actor_idx` | Audit events by actor |
| `investor_crm_audit_log_event_type_idx` | Audit events by type |
| `investor_automation_scans_occurred_idx` | Recent scans |
| `investor_automation_scans_triggered_idx` | Scans by trigger + recency |

### Verification

```sql
SELECT tablename, indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename LIKE 'investor%'
ORDER BY tablename, indexname;
# Audit — Institutional Accountability

## The audit table

`public.investor_crm_audit_log` records every mutation against investor CRM entities.

| Column | Purpose |
|---|---|
| `id` (uuid, PK) | Event identity |
| `investor_id` (uuid, FK) | Related investor (nullable, ON DELETE SET NULL) |
| `activity_id` (uuid, FK) | Related activity (nullable, ON DELETE SET NULL) |
| `event_type` (text) | Event category |
| `actor_id` (uuid) | Supabase Auth user id |
| `actor_email` (text) | Actor email at time of action |
| `actor_role` (text) | Institutional role at time of action |
| `source` (text) | Which API route |
| `summary` (text) | Human-readable summary |
| `payload` (jsonb) | Before/after state + metadata |
| `occurred_at` (timestamptz) | When the mutation occurred |
| `created_at` (timestamptz) | When the row was written |

## Event types

| Type | Trigger |
|---|---|
| `ACTIVITY_CREATED` | POST `/api/admin/investor-crm/activities` |
| `ACTIVITY_COMPLETED` | PATCH status → COMPLETED |
| `ACTIVITY_CANCELLED` | PATCH status → CANCELLED |
| `ACTIVITY_RESCHEDULED` | PATCH with only `due_at` change |
| `ACTIVITY_REASSIGNED` | PATCH with only `assigned_admin` change |
| `ACTIVITY_DETAILS_UPDATED` | PATCH with other field changes |
| `STAGE_TRANSITION` | PATCH `/api/admin/investor-crm` with `stage` change |
| `CRM_CAPITAL_UPDATED` | Capital change or first CRM record creation |
| `CRM_PROBABILITY_UPDATED` | `probability_percent` change |
| `CRM_NEXT_ACTION_UPDATED` | `next_action` change |
| `CRM_CONTACT_RECORDED` | `last_contact_date` change |
| `INVESTOR_NOTES_UPDATED` | `meeting_notes` change |

## Payload structure

`payload` is jsonb. Common shape:

```json
{
  "before": { "stage": "CONTACTED" },
  "after": { "stage": "INTERESTED" },
  "changed_fields": ["stage"],
  "stage_before": "CONTACTED",
  "stage_after": "INTERESTED"
}
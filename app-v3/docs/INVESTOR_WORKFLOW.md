# Investor Workflow — End to End

## Phase 1 — Discovery

1. Visitor lands on `https://peopleandyouth.org/investors`
2. Sees public prospectus (institutional overview, target raise, thesis)
3. Clicks **Request Access**

## Phase 2 — Application

1. Submits `POST /api/investors/access` with: full name, email, phone, organisation, investor type, LinkedIn, proposed ticket
2. Server creates `investor_profiles` row with:
   - `verification_status = 'PENDING'`
   - `access_level = 'REGISTERED'`
   - `lifecycle_state = 'APPLIED'` (or equivalent)
3. Confirmation email sent via Resend
4. New investor appears in admin CRM as **PROSPECT** stage

## Phase 3 — Verification (Founder)

1. Founder reviews applicant in `/admin/investor-crm`
2. Reviews:
   - Organisation credibility
   - Proposed ticket size
   - LinkedIn / website
   - Notes / statement of intent
3. Updates `investor_profiles.verification_status` from `PENDING` → `VERIFIED`
4. May request KYC completion (updated via investor record)

## Phase 4 — Approval (Founder)

1. Once verified, founder updates `access_level` from `REGISTERED` → `APPROVED`
2. Investor now eligible for data room access

## Phase 5 — Data room access (Investor)

1. Investor signs in at `/signin`
2. `GET /api/investors/document?id=X` is called by the portal
3. Server checks:
   - Authenticated user ✓
   - `investor_profiles WHERE user_id = user.id`
   - `verification_status = 'VERIFIED'` ✓
   - `access_level = 'APPROVED'` ✓
   - Document `is_active = true` ✓
   - Document `access_level IN ('PUBLIC', 'APPROVED')` ✓
4. Server issues a **5-minute signed URL** from Supabase Storage
5. Investor downloads the document

**If any check fails → 403.**

## Phase 6 — Relationship building (Founder)

Via `/admin/investor-crm`:

- **Composer** records interactions: Call, Meeting, Email, Document, Commitment, Objection, Next Step
- **Note tool** records internal notes
- **Follow-up tool** creates operational actions with due dates
- **Stage** advances through pipeline as the relationship progresses
- **Probability** adjusts based on investor signals
- **Expected ticket** updates as investor interest crystallizes

Every mutation writes an audit event.

## Phase 7 — Operations

Via `/admin/investor-operations`:

- Open actions appear in the queue (sorted by due date)
- Overdue actions flagged in red
- Bulk operations: Complete All, Cancel All, Reschedule All, Reassign All
- One-click "Tomorrow" reschedule for overdue items

## Phase 8 — Resolution & audit (Founder)

When an action resolves via `/admin/investor-crm` obligations panel:

- Click **Mark Completed** or **Cancel Action**
- A modal requires a **resolution reason** (mandatory)
- Optional **outcome** field
- Both are appended to activity details AND written to audit payload

## Phase 9 — Commitment

1. Investor reaches **COMMITMENT** stage
2. Founder records commitment via composer (Commitment tab)
3. Expected ticket finalized
4. Investor moves to **INVESTED** upon capital receipt
5. `actual_investment_inr` populated with received amount

## Phase 10 — Ongoing relationship

- **Relationship intelligence** (`/admin/investor-relationship`) surfaces engagement score, dormancy, objections
- **Executive dashboard** (`/admin/investor-executive`) rolls up pipeline, coverage, alerts
- **Automation** runs daily at 06:00 UTC, logging a scan summary to `investor_automation_scans`
- **Audit trail** (`/admin/investor-audit`) records every mutation for institutional continuity

## Phase 11 — Governance review

Periodic via `/admin/investor-governance`:

- Check IAM state
- Check RLS on all tables
- Check zero anon/authenticated write grants
- Check audit trail activity
- Check automation cron firing

**All checks should return PASS.** Any WARN/FAIL requires attention.

## State transition summary

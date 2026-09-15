# Operations — Daily, Weekly, Monthly

## Daily

### 1. Check the automation scan
`https://peopleandyouth.org/admin/investor-automation/scans`

- Confirm the latest `CRON / SUCCESS` entry exists
- Review the executive narrative (9C.6)
- Note overdue count, dormancy count, coverage %
- If any indicator is degraded, act on it

### 2. Clear the operations queue
`https://peopleandyouth.org/admin/investor-operations`

- Filter **OVERDUE** → handle each
- Filter **TODAY** → handle each
- Filter **APPROACHING** (72h warning) → plan
- Use **Tomorrow** quick-reschedule for genuinely-late items
- Use bulk actions for many similar items

### 3. Review the pipeline
`https://peopleandyouth.org/admin/investor-pipeline`

- Drag stalled investors forward if warranted
- Flag any investor with red priority for immediate contact

### 4. Review executive alerts
`https://peopleandyouth.org/admin/investor-executive` → **Executive Overview** tab

- 6 alert cards: overdue, dormant, coverage, awaiting decision, risk, management attention
- Each links to the relevant page for action

## Weekly

### 1. Relationship intelligence sweep
`https://peopleandyouth.org/admin/investor-relationship`

- Sort by priority score
- Address every **DORMANT** relationship
- Review objections raised in the last 7 days
- Consider follow-up-only filter

### 2. Analytics review
`https://peopleandyouth.org/admin/investor-analytics`

- Acquisition trend (any week with 0 new investors?)
- Engagement trend (any sustained decline?)
- Conversion funnel (any stage bottleneck?)
- Forecast vs actual acquisition rate

### 3. Reports for the record
`https://peopleandyouth.org/admin/investor-reports`

- Generate **Weekly View** and **Fundraising Report**
- Copy for internal records / board prep

## Monthly

### 1. Governance verification
`https://peopleandyouth.org/admin/investor-governance`

- Click **Re-verify now**
- Posture must read **HEALTHY** (or WARNING with explained cause)
- Confirm "No anon/authenticated write grants" = PASS
- Confirm audit coverage growth

### 2. Monthly report
`https://peopleandyouth.org/admin/investor-reports` → **Monthly View**

- Copy the Monthly View block
- Copy the Investor Report block
- Archive externally

### 3. CRM integrity
`https://peopleandyouth.org/admin/investor-audit/integrity`

- Status must be **HEALTHY**
- Any HIGH severity issue needs immediate attention
- Sample IDs help locate the affected records

## Infrastructure maintenance

### Env vars (Vercel → Settings → Environment Variables)

| Var | Required in | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All envs | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All envs | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Prod + Preview | **Server-only** — never `NEXT_PUBLIC_` |
| `CRON_SECRET` | Prod + Preview | Vercel cron bearer token |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Prod + Preview | Email |
| `RAZORPAY_*` (3) | Prod + Preview | Payments (production keys pending) |

**After any env change:** Vercel prompts to redeploy. Do it.

### Cron schedule

`vercel.json` at `app-v3/` root:
```json
{
  "crons": [
    { "path": "/api/admin/investor-automation/scan", "schedule": "0 6 * * *" }
  ]
}
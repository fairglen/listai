# Mode: tracker

Show and update the listings tracker.

## When to use

- User asks "show my tracker", "what's the status", "where am I at"
- User says "mark [listing] as contacted/visited/etc"
- Periodic review (every 1-2 weeks)

## Inputs

1. `data/listings.md`
2. `templates/states.yml` for canonical statuses

## Read mode (default)

Display a summary:

```
# Tracker summary

**Total listings tracked:** N
**By status:**
- Evaluated: X
- Contacted: Y
- Visit Scheduled: Z
- Visited: A
- Offer Sent: B
- Negotiating: C
- Under Contract: D
- Closed: E
- Rejected: F
- Discarded: G
- Off Market: H

**Active pipeline (not Discarded / Rejected / Off Market / Closed):** N

**By score band:**
- 4.5+: X listings
- 4.0-4.4: Y
- 3.5-3.9: Z
- < 3.5: A

**Recent activity (last 14 days):**
| Date | Listing | Status | Notes |
|------|---------|--------|-------|

**Stale (no movement in 21+ days):**
| Listing | Last activity | Suggested next step |
|---------|---------------|---------------------|
```

After the summary, surface 1-3 concrete recommendations:
- "3 listings still `Contacted` with no reply after 7+ days → suggest follow-up"
- "5 listings scored above 4.0 still `Evaluated` — did you decide to skip them?"
- "2 listings `Visited` 14+ days ago without next step — pursue or close out"

## Update mode

When user says "mark [listing] as [status]":

1. Find the listing entry in `data/listings.md` by either:
   - Report number ("listing 042")
   - Address or area + typology
2. Confirm the match with the user before editing
3. Edit `data/listings.md` directly to update:
   - Status column (must be a canonical state from `templates/states.yml`)
   - Date column → today (if status change is meaningful)
   - Notes column → append 1-line context
4. If status moves to `Visit Scheduled` → also note the visit date in notes
5. If status moves to `Offer Sent` → also note the offered amount in notes
6. If status moves to `Closed` → suggest archiving the report and adding a postmortem

## Rules

1. **Never add NEW entries via direct edit of listings.md.** New entries go through `batch/tracker-additions/` + `merge-tracker.mjs`.
2. **Status updates are direct edits to listings.md** — that's the exception.
3. **Canonical statuses only.** Look up `templates/states.yml`. No bold, no dates, no extra text.
4. **Always confirm before destructive changes** (Rejected, Discarded, Off Market).
5. **Surface insights, not just data.** "5 stale listings" is data; "3 of those scored 4.0+ and probably deserve a follow-up" is insight.

## Examples

User: "Mark 42 as visited, going to make an offer"
→ Edit row 42: status = `Visited`, date = today, notes += "Visit 2026-05-30, considering offer"
→ Suggest: "Want me to run /listai offer for this one?"

User: "What's stale?"
→ Show listings without status changes in 21+ days, with suggested next steps

# Mode: offer

Draft a purchase offer letter after a visit.

## When to use

- Tracker status is `Visited` and the user wants to proceed
- User says "draft an offer for [listing]"

## Inputs

1. The full listing report (`reports/{num}-{slug}-{date}.md`) — including any `## Visit notes` section
2. `config/profile.yml` for buyer identity, financing, timeline
3. `modes/_profile.md` for the user's offer strategy (opening anchor, walk-away rules, closing date target)
4. `templates/offer-letter-template.md` for the structure

## Process

### Step 1 — Anchor

Decide the opening offer.

Default: 90-95% of asking unless:
- Listing is already at or below comparable €/m² → 97-100% (don't insult)
- Listing is 60+ days old AND priced above comparables → 85-90% (leverage exists)
- Visit revealed material undisclosed issues → adjust down by estimated repair cost / 2
- Visit revealed surprise positives (more space, better light) → consider matching asking

Show the math:
```
Asking: €420,000
Comparables: €4,200-4,600/m² for similar T2 in Alvalade (3 cites)
Listing €/m²: €4,800
Visit revealed: kitchen needs full redo (~€15k), 1980s electrical (~€8k)
Suggested opening: €380,000 (-9.5% from asking)
  Rationale: brings €/m² to €4,348, mid-range of comparables, leaves room for upward movement
Walk-away: €395,000 (still 5% off asking, justified by works estimate)
```

### Step 2 — Draft

Use `templates/offer-letter-template.md`. Fill in:
- Property reference / address
- Visit date
- Offered price + clear €/m² calculation
- 2-3 specific reasons (comparables + observed issues)
- Financing status (pre-approved → name the bank)
- Deposit % (default 10%)
- Closing date target (from `_profile.md`)
- Offer expiration (default 48-72h)

Match the language of the listing (PT default; EN if user prefers).

### Step 3 — Counter playbook

Anticipate the seller's counter and pre-write the user's response options:

| If seller... | User responds... |
|--------------|------------------|
| Accepts immediately | Don't celebrate. Trigger pre-CPCV checklist (see template). Start due diligence. |
| Counters at midpoint | Accept if within walk-away, or counter at midpoint minus 25% of the remaining gap |
| Counters above walk-away | Reply same day: revised offer at walk-away + 1 specific reason for the cap |
| Refuses to move | Ask what would make a deal — terms, closing date, included furniture |
| Claims competing offer | Ask for a deadline. If real, decide. If tactic, hold firm. |
| Doesn't reply by expiration | Send 1 follow-up. If still silent after 48h more → walk. |

### Step 4 — Output

Present to the user:

1. The draft offer letter (ready to copy-paste)
2. The reasoning summary (anchor + walk-away + math)
3. The counter playbook table
4. The pre-CPCV checklist reminder (from template)

ASK the user to confirm before sending. Never send on their behalf.

### Step 5 — Post-send

- Update tracker status to `Offer Sent` with date and offered amount in notes
- Add `## Offer sent ({date})` section to the report with the exact text sent and the reasoning
- Set a 48-72h reminder for the user to follow up if no reply

## Rules

1. **Never inflate comparables.** Cite real listings or sales. If you don't have them, say so.
2. **Never offer above the user's `max_price` from profile.yml.**
3. **No emotional language.** This is a contract negotiation.
4. **Always set an expiration.** No open-ended offers.
5. **Always note: this is a non-binding offer.** Binding stage is CPCV with sinal.

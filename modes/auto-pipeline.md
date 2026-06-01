# Mode: auto-pipeline

Triggered when the user pastes a listing URL (or text description) with no explicit mode.

## Steps

1. **Detect the input.** URL → fetch. Text → parse as listing description.
2. **Run `listing` mode end-to-end** (Blocks A-G + report + tracker TSV).
3. **Report status to user** in 4-6 lines:
   - Score X.X/5
   - Archetype
   - Top 2 strengths
   - Top 2 concerns
   - Recommended next step

## What this mode does NOT do

- Does not contact the agent (that's `contact` mode, with user confirmation)
- Does not draft an offer (that's `offer` mode, after a visit)
- Does not modify `config/profile.yml` or `modes/_profile.md` without asking

## What this mode DOES include

- Saves the report to `reports/`
- Writes the tracker TSV to `batch/tracker-additions/`
- If `merge-tracker.mjs` exists, run it after every batch
- Updates `data/pipeline.md` to remove the URL if it came from there

## Example output

```
Score: 4.2/5 — Cosmetic Refresh archetype.
Strengths: Right area (Alvalade), good €/m² (€4,100 vs €4,400 area avg), elevator + parking.
Concerns: Energy cert D (below your minimum C); kitchen needs full redo (~€15k).
Next step: Worth a visit. Want me to draft a contact message?
Report: reports/042-alvalade-t2-2026-05-31.md
```

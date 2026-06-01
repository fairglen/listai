# Mode: scan

Search portals and tracked agencies for new listings matching the user's profile.

## When to use

- User says "scan", "find new listings", "what's new"
- Periodic (suggest weekly or every few days via /loop or /schedule)

## Inputs

1. `portals.yml` — search queries, tracked agencies, filters
2. `data/scan-history.tsv` — dedup history (URLs already seen)
3. `config/profile.yml` — budget, areas, typology

## Process

### Step 1 — Run queries

For each enabled query in `portals.yml`:

- **Direct portal URL:** WebFetch the search results page (or Playwright if JS-heavy).
- **WebSearch query:** Run the search, collect URLs from the results.
- **Tracked agency website:** WebFetch the agency's listings page.

For each listing found, extract:
- URL
- Address / area
- Typology (T0, T1, T2, T3...)
- Useful area
- Price
- Posted date (if available)
- Agent / agency

### Step 2 — Filter

Apply filters from `portals.yml`:
- `area_filter` — must be in target cities/freguesias, not in excluded
- `price_filter` — within range, €/m² within max
- `listing_filter.positive` / `negative` — at least 1 positive, 0 negatives
- Check against `config/profile.yml` `must_haves` and `deal_breakers`

Filter out anything already in `data/scan-history.tsv` (dedup by URL).

### Step 3 — Pre-score

For each survivor, do a lightweight "Block A+B" only:
- Archetype detection (move-in ready / cosmetic refresh / renovation project / new build)
- Quick match score against profile (4-dimensional: area / typology / price / must-haves)
- **Quick photo glance** (see Image Interpretation in `_shared.md`): scan the thumbnails/lead photos for outdoor space the text omits, obvious condition signals, and red flags. Use this to upgrade a listing whose text hides a garden/terrace, or to flag one whose photos look off. Don't drop a listing for a missing photo-evident must-have during scan — that's the full evaluation's job; just note it as "outdoor space unconfirmed".
- This is NOT a full evaluation — just enough to decide which ones merit one

Photo-based checks here are **best-effort in batch mode** — if thumbnails aren't reachable (Idealista et al.), skip them and rely on text; the full evaluation will inspect images properly.

Output a triage list:

```
# Scan results — {date}

**New listings found:** N (after dedup and filters)

## High-fit (recommend full evaluation)
- [Address / area, typology, €X, €/m² Y] — [URL] — quick score 4.5+
- ...

## Medium-fit (worth a quick look)
- [Address / area, typology, €X, €/m² Y] — [URL] — quick score 4.0-4.4

## Low-fit (skipped by default)
- [Address / area, typology, €X, €/m² Y] — [URL] — quick score < 4.0
```

### Step 4 — Pipeline

For each High-fit listing, append the URL to `data/pipeline.md` under a `## Pending` section so the user can process them later in batch.

Append every found URL (high, medium, low) to `data/scan-history.tsv` to prevent re-scanning.

### Step 5 — Notify

Tell the user:

```
Scan complete. Found N new listings.
- {X} high-fit, queued in pipeline.md for evaluation
- {Y} medium-fit, listed above for your call
- {Z} low-fit, skipped

Want me to run full evaluations on the high-fit ones now?
```

## Rules

1. **Most portals block plain fetches (HTTP 403).** Casa Sapo serves plain requests; Idealista/Imovirtual/SuperCasa/OLX/CustoJusto don't. For the blocked ones, use the optional **browser scanner** — `node scan-browser.mjs "<url>"` (needs Playwright; see `docs/browser-scanning.md`). It clears Imovirtual + SuperCasa reliably; **Idealista (DataDome) stays blocked** even via headless — fall back to its official API, email alerts, or manual paste. If Playwright isn't installed, the script says so and the core scan still works on Casa Sapo + WebSearch.
2. **Don't double-count.** Same listing on multiple portals → use URL canonicalization (strip query params, strip trailing slashes).
3. **Respect portal terms.** Don't hammer with concurrent requests. One query at a time.
4. **scan-history.tsv columns:** `date`, `url`, `portal`, `address`, `price`, `quick_score`, `decision`.
5. **Never auto-evaluate without asking.** Scanner triages; the user (or the user's explicit instruction) triggers full evaluations.

## Example

```
$ listai scan

Scan complete. Found 14 new listings.
- 3 high-fit, queued in pipeline.md
- 6 medium-fit, listed below
- 5 low-fit, skipped

High-fit:
1. T2 Alvalade, 76m², €365k (€4,803/m²) — quick score 4.6
   https://idealista.pt/...
2. T3 Arroios, 88m², €410k (€4,659/m²) — quick score 4.5
   ...

Want me to run full evaluations on the 3 high-fit listings?
```

# Mode: listing — Full Evaluation A-G

When the user pastes a listing URL (or description), ALWAYS deliver all 7 blocks (A-F evaluation + G legitimacy).

## Step 0 — Extract listing data

1. **WebFetch the URL.** If it's Idealista or another JS-heavy portal and the content comes back thin, fall back to Playwright (`browser_navigate` + `browser_snapshot`). In headless batch mode, mark `**Verification:** unconfirmed (batch mode)`.
2. **Capture these fields:**
   - Listing reference, posted date, last update
   - Address (or area if address withheld)
   - Type (apartment / house / etc.)
   - Typology (T1, T2, T3...)
   - Useful area (área útil), gross area (área bruta)
   - Price, €/m² (compute = price / useful area)
   - Floor, building year, year of last renovation
   - Energy certificate
   - Features mentioned (elevator, balcony, garage, AC, etc.)
   - Photos count and quality observation
   - Agent name + agency
3. **Inspect the photos and floor plan** (see Image Interpretation in `_shared.md`). Before reading the text's feature list, look at the images for outdoor space, condition, light, floor level, and red flags. Note for each finding whether it's *confirmed from photos*, *inferred*, or *unverified*. If images can't be fetched, say so and ask the user to paste image URLs/screenshots.
4. **Detect archetype** (see `_shared.md`). If hybrid, note 2 closest. This determines weighting in later blocks.

## Block A — Listing Summary

Table with:
- Archetype detected
- Type, typology, useful area
- Price, €/m²
- Floor / building year
- Energy cert
- Address / area
- TL;DR in 1 sentence

## Block B — Match vs Buyer Profile

Read `config/profile.yml` and `modes/_profile.md`. Build a table comparing each profile requirement to what the listing offers.

**For each row:**
- Profile requirement (from must_haves, deal_breakers, typology, area, etc.)
- Listing value
- Verdict (✅ match / ⚠️ partial / ❌ miss)

**Then a "gaps" section:**
- List every must-have NOT covered
- List every deal-breaker present (auto-cap)
- For each gap, note whether it's recoverable (e.g. parking can be rented nearby) or fundamental (e.g. wrong area)

**Outdoor space and other photo-evident must-haves:** check the photos before marking these missing. If a garden/terrace/patio/balcony/plot/annex is visible, it counts as a match even if the text never mentions it (note "confirmed from photos"). If neither text nor photos confirm it and images were available, mark it a miss. If images couldn't be inspected, mark it `unconfirmed — verify` and do NOT apply the must-have cap on a guess.

## Block C — Price Analysis

1. **Compute €/m²** = price / useful area. Show the math.
2. **Find comparables.** Use WebSearch with the area + typology + recent listings. Cite 3-5 comparables with their €/m².
3. **Position the listing:**
   - Below market (-10% or more) → why? Hidden issue, motivated seller, or scam?
   - At market → fair, focus negotiation on terms not price
   - Above market (+10% or more) → either premium product (justified) or overpriced (negotiate hard)
4. **Days on market.** Cross-check posting date. 60+ days = leverage. Brand new = competing buyers.
5. **Negotiation range.** Suggest opening offer (% of asking) and walk-away (% of asking) based on archetype and comparables.

## Block D — Location Analysis

Use WebSearch and the buyer's `area_map` in `modes/_profile.md`.

| Dimension | Finding | Score 1-5 |
|-----------|---------|-----------|
| Commute to `commute_anchor` | [Minutes by transit mode of preference] | |
| Transit options (metro, bus, train) | [What's within 10min walk] | |
| Daily amenities (groceries, pharmacy, café) | [Within 5min walk] | |
| Schools (if `has_children: true`) | [Quality, distance] | |
| Natural light / orientation | [From photos: brightness, sun on surfaces, window direction — note confirmed vs inferred] | |
| Noise (busy road, nightlife, construction) | [Observation from photos + map] | |
| Future development | [Planned projects affecting area — WebSearch "PDM" + freguesia] | |
| Safety | [Qualitative, only if specific concern] | |

## Block E — Condition & Renovation

Base condition findings on the photos (see Image Interpretation in `_shared.md`), not just the listing's adjectives. Mark each row *confirmed from photos*, *inferred from year/text*, or *unverified* where photos didn't show it. Don't assume worst-case condition the photos contradict, or best-case the text claims but photos don't show.

| Item | Observation | Estimated cost |
|------|-------------|----------------|
| Last renovation | [Year + scope, from listing] | — |
| Kitchen | [State from photos] | €[X] if redo |
| Bathrooms | [State, count] | €[X] each if redo |
| Windows / glazing | [Double / single, age] | €[X] for full replace |
| Heating / AC | [System, state] | €[X] for install |
| Floors | [Wood, tile, vinyl, state] | €[X] for refinish or replace |
| Electrical | [If old, may need rewiring] | €[X] full rewire |
| Plumbing | [Likely state from age] | €[X] if redo |
| Structural concerns | [Cracks visible, humidity stains] | Visit required |
| **Total estimated works** | | **€[sum]** |

Compare total works estimate to user's `renovation_budget` in profile.yml. Flag if over.

## Block F — Legal & Process

Portugal-specific checks:

| Item | Status from listing | Action |
|------|---------------------|--------|
| Licença de Utilização | [Mentioned? Year?] | Ask before visit if missing |
| Certificado Energético | [Letter A-F] | Mandatory before sale |
| Caderneta Predial | — | Request before CPCV |
| Certidão Predial Permanente (Predial Online) | — | Check ónus/hipotecas before CPCV |
| AL (Alojamento Local) license | [Yes / No / unmentioned] | If yes and user is residential → deal-breaker check |
| Condomínio quotas | — | Request quotas paid + minutes at visit |
| Year built | [From listing] | Affects insulation, electrical, plumbing risk |
| Ficha Técnica de Habitação | [Required if built >2004] | Request |
| Mortgage feasibility | [Based on user's bank + LTV] | Likely / risky / cash only |
| IMI status | — | Verify with caderneta |
| Inheritance / share situation | [Mentioned?] | If shared inheritance, flag complexity |

Compare to user's `risk_tolerance` in profile.yml.

## Block G — Listing Legitimacy

See `_shared.md` for the framework. Output:

**Assessment:** High Confidence / Proceed with Caution / Suspicious

**Photo check:** Do the photos match the stated address/area and property type (e.g. street view, building style, surroundings consistent with the freguesia)? Stock-looking or mismatched photos, or images that contradict the described floor/view, are a red flag — record in the signals table.

**Signals table:**
| Signal | Finding | Weight |
|--------|---------|--------|

**Context notes:** Any caveats (luxury listing with no public address, off-plan new build, etc.).

---

## Post-evaluation

**ALWAYS** after blocks A-G:

### 1. Compute global score

Apply weighted average from `modes/_profile.md` weights. Apply caps:
- Any deal-breaker present → cap at 2.5
- Any must-have missing and not compensated → cap at 3.5
- Energy cert below user's `min_energy_cert` → -0.5
- €/m² above `max_eur_per_sqm` → cap at 3.5

### 2. Save report

`reports/{###}-{slug}-{YYYY-MM-DD}.md` where:
- `{###}` = next sequential number, 3-digit zero-padded
- `{slug}` = area + typology lowercase, hyphenated (e.g. `alvalade-t2`)
- `{YYYY-MM-DD}` = today

**Header format:**

```markdown
# Evaluation: {address or area} — {typology}

**Date:** {YYYY-MM-DD}
**Archetype:** {detected}
**Score:** {X.X/5}
**URL:** {listing url}
**Legitimacy:** {High Confidence | Proceed with Caution | Suspicious}
**Price:** €{X} ({€/m²}/m²)
**Verification:** {confirmed / unconfirmed (batch mode)}

---

## A) Listing Summary
## B) Match vs Buyer Profile
## C) Price Analysis
## D) Location Analysis
## E) Condition & Renovation
## F) Legal & Process
## G) Listing Legitimacy

## Recommendation
{Concrete next step: visit / skip / monitor + reason}
```

### 3. Write tracker TSV

`batch/tracker-additions/{num}-{slug}.tsv` — single line, 9 tab-separated columns:

```
{num}\t{date}\t{address_or_area}\t{type+typology}\t{status}\t{score}/5\t€{price}\t[{num}](reports/{num}-{slug}-{date}.md)\t{1-line summary}
```

Default status after evaluation = `Evaluated`. If score < 3.5 and user accepts → `Discarded`.

### 4. Recommend next step

Based on score:
- 4.5+ → "Schedule a visit. Want me to draft a contact message to the agent?"
- 4.0-4.4 → "Worth a visit. Draft contact?"
- 3.5-3.9 → "Marginal. What specifically draws you here? If you want to proceed, I'll draft contact."
- Below 3.5 → "Recommend against. Mark Discarded?"

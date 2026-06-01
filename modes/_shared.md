# System Context -- listai

<!-- ============================================================
     THIS FILE IS AUTO-UPDATABLE. Don't put personal data here.

     Your customizations go in modes/_profile.md (never auto-updated).
     This file contains system rules, scoring logic, and tool config
     that improve with each listai release.
     ============================================================ -->

## Sources of Truth

| File | Path | When |
|------|------|------|
| profile.yml | `config/profile.yml` | ALWAYS (buyer identity, budget, areas, must-haves) |
| _profile.md | `modes/_profile.md` | ALWAYS (archetypes, weightings, contact/offer scripts) |
| states.yml | `templates/states.yml` | When writing or updating tracker entries |
| portals.yml | `portals.yml` | When scanning |

**RULE: NEVER hardcode budgets, areas, or constraints.** Read them from `config/profile.yml` at evaluation time.
**RULE: Read `_profile.md` AFTER this file. User customizations in `_profile.md` override defaults here.**

---

## Scoring System

The evaluation uses 6 blocks (A-F) with a global score of 1-5:

| Dimension | What it measures |
|-----------|-----------------|
| Listing match | Type, typology, area, key features vs buyer profile |
| Price | Asking vs €/m² comparables, days on market, room for negotiation |
| Location | Neighborhood fit, transit, amenities, future development, noise |
| Condition | Year built, recent renovations, energy cert, estimated works needed |
| Legal & process | Title, license of use, condo health, ónus, mortgage feasibility |
| **Global** | Weighted average, capped if a must-have is missing or a deal-breaker is present |

**Score interpretation:**
- 4.5+ → Strong fit, schedule visit ASAP
- 4.0-4.4 → Good fit, worth a visit
- 3.5-3.9 → Marginal, only visit if specific draw (e.g. unique location)
- Below 3.5 → Skip (see Ethical Use in AGENTS.md)

**Caps and overrides:**
- Any deal-breaker present → score capped at 2.5 with explanation
- Any must-have missing → score capped at 3.5 unless the listing compensates elsewhere
- Energy cert below user's minimum → -0.5 to global score
- Above max_eur_per_sqm in portals.yml → score capped at 3.5

## Listing Legitimacy (Block G)

Block G assesses whether the listing is real, current, and accurate. It does NOT affect the 1-5 score — it is a separate qualitative assessment.

**Three tiers:**
- **High Confidence** — Real, current listing, accurate description
- **Proceed with Caution** — Mixed signals worth noting
- **Suspicious** — Multiple red flags, investigate before contacting

**Key signals:**

| Signal | Source | Reliability | Notes |
|--------|--------|-------------|-------|
| Listing age | Portal | High | Under 30d good; 60d+ may signal overpricing or hidden issues |
| Price vs €/m² comparables | Calculation | High | 30%+ below market = likely scam or undisclosed issue |
| Photos vs description | Visual + text | Medium | Mismatch (wrong building, stock photos) = red flag |
| Agent reputation | WebSearch | Medium | Check name + agency for complaints |
| Repeated listing across portals with different prices | Cross-check | Medium | Price drops are normal; same listing same day at different prices = fraud |
| Generic boilerplate description | Listing text | Low | Some agencies just write thin copy; weight lightly |
| Asks for payment before visit | Communication | High (when present) | Always a scam |
| No street address, "exact location on request" | Listing | Medium | Common for higher-end, less for mid-market |

**Ethical framing (MANDATORY):**
- Present signals, let the user decide
- Never accuse an agent of fraud without strong evidence
- Always note legitimate explanations

## Image Interpretation (DEFAULT)

At the user's price/area, key facts are often in the PHOTOS, not the text — outdoor space (a common must-have) especially. Looking at the images is a default step in evaluating and scanning, not an optional extra.

**Always inspect the listing's photos (and floor plan, if present) before drawing conclusions about:**

| Read from photos | What to look for |
|------------------|------------------|
| Outdoor space | Garden, terrace, patio, balcony, the plot, a visible annex/outbuilding — presence, rough size, usability |
| Condition / reno level | Move-in-ready vs dated vs needs work: kitchen, bathrooms, windows, walls, floors |
| Natural light / orientation | Brightness, sun on surfaces, shadows, which way windows face |
| Floor level / elevator | View height, stairs, lift doors in hallway shots |
| Red flags | Damp/mould stains, cracks, derelict surroundings, neighbouring structures |

**Fetching images:** Use WebFetch to pull photo URLs; on JS-heavy/bot-blocked portals (Idealista et al.) fall back to Playwright (`browser_snapshot` captures rendered images). If images still aren't reachable, tell the user they can paste image URLs or screenshots, and fall back to text while flagging the gap.

**RULES:**
- **Never conclude a must-have is ABSENT (e.g. "no outdoor space") from text alone — check photos first.** If photos are unavailable, mark it `unconfirmed — verify`; do NOT auto-fail the must-have or apply the must-have cap on a guess.
- **Be honest about provenance.** Distinguish what was *confirmed from photos*, what was *inferred*, and what is *unverified*. Never fabricate a feature that isn't visible.
- Photo checks are best-effort in headless/batch mode — note when they couldn't run.

## Archetype Detection

Classify every listing into one of these archetypes (or hybrid of 2):

| Archetype | Key signals |
|-----------|-------------|
| **Move-in Ready** | "Renovado", "remodelado a estreia", recent year, photos show modern finishes |
| **Cosmetic Refresh** | Dated but functional, "para pequenos arranjos", paint + floors needed |
| **Renovation Project** | "Para recuperar", "obras profundas", priced below market, "potencial" |
| **New Build** | "Em construção", "entrega 2026", off-plan, developer sale |
| **Heritage / Pre-1951** | Lisbon center, "edifício histórico", "prédio pombalino", specific legal regime |
| **Investment / Yield** | "Rentabilidade", "Alojamento Local licenciado", "investidor", thin photos |

After detecting the archetype, read `modes/_profile.md` for the user's specific framing and weighting for that archetype.

## Global Rules

### NEVER

1. Invent comparables, area data, or features not visible in the photos
2. Conclude a must-have is missing from text alone without checking the photos
3. Modify `config/profile.yml` without confirmation
4. Send a message or offer on behalf of the user
5. Share the user's phone number in generated drafts without their email already exposed
6. Recommend a property above the user's `max_price`
7. Skip the tracker (every evaluated listing gets registered)
8. Quote €/m² without showing the math (price ÷ useful area)

### ALWAYS

1. Read `config/profile.yml` and `modes/_profile.md` before evaluating
2. Inspect the listing's photos (and floor plan) before judging outdoor space, condition, or light — see Image Interpretation
3. Detect the archetype and adapt framing per `_profile.md`
4. Cite source listings or sales when stating €/m² comparables
5. Use WebSearch for area data (transit, schools, future development, recent sales)
6. Register in tracker after evaluating
7. Generate content in the language of the listing (PT for PT portals; EN if user asked)
8. Be direct -- no real estate fluff ("charming", "unique opportunity", "won't last")
9. **Tracker additions as TSV** -- never edit `data/listings.md` directly to add new rows
10. Include `**URL:**` and `**Legitimacy:**` in every report header

### Tools

| Tool | Use |
|------|-----|
| WebSearch | Area data, transit, schools, recent sales, agent reputation |
| WebFetch | Extract listing data and photo URLs from portal URLs |
| Playwright | Idealista and other JS-heavy portals (browser_navigate + browser_snapshot, also for rendered photos). **NEVER 2+ agents with Playwright in parallel.** |
| Read | profile.yml, _profile.md, portals.yml, reports |
| Write | Report .md files, contact drafts, offer drafts, tracker TSVs |
| Edit | Update listings.md status for existing entries |
| Bash | merge-tracker, scan |

### Time-to-decision priority

- Visiting > endless online debate
- A confident "no" is as valuable as a confident "yes"
- Budget for "looking is free; offering is committed" — first impressions are unreliable

---

## Writing Style for Drafted Messages

These rules apply to ALL generated text the user will send (contact emails, offer letters, visit follow-ups). They do NOT apply to internal evaluation reports.

### Match the channel

- Portal contact form → 4-6 sentences max
- Email → can run 8-12 sentences if there's substance
- WhatsApp → 2-4 sentences, no greeting block
- Phone call script → bullets, not prose

### Avoid clichés

- "Charming", "cosy", "won't last long", "rare opportunity"
- "I'm very interested in your beautiful property"
- "Looking forward to hearing from you" (replace with concrete asks)
- Long greetings ("Bom dia, espero que esteja tudo bem consigo...")

### Be specific

- "T2 in Alvalade, ref. 87654" beats "your apartment"
- "Visit Saturday 10-12 or Sunday 14-16" beats "let me know when you're available"
- "€/m² of €4,200 vs €4,800 area average" beats "asking seems high"

### One ask per message

- First contact: visit + 1 question
- Visit follow-up: decision (interested / not) + next step
- Offer: price + terms + deadline
- Counter: revised price + reasoning, nothing else

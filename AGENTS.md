# listai -- AI Property Search Pipeline

## What is listai

CLI-agnostic property search automation for Portugal (and other markets): listing evaluation, neighborhood research, pipeline tracking, agent outreach, offer drafting. Inspired by [career-ops](https://github.com/santifer/career-ops), adapted for house hunting.

Runs on any AI coding CLI that follows the [open agent skill standard](https://agentskills.io) (Claude Code, Codex, Gemini, OpenCode, Qwen, Copilot, Kimi).

**It will work out of the box, but it's designed to be made yours.** If the archetypes don't match your needs (family home vs investment vs renovation), the modes are in the wrong language, or the scoring doesn't fit your priorities — just ask. The AI agent can edit the files. You say "weight schools higher than transit" and it happens.

## Data Contract

There are two layers. See `DATA_CONTRACT.md`.

**User Layer (NEVER auto-updated, personalization goes HERE):**
- `config/profile.yml`, `modes/_profile.md`, `portals.yml`
- `data/*`, `reports/*`, `output/*`

**System Layer (auto-updatable, DON'T put user data here):**
- `modes/_shared.md`, `modes/listing.md`, all other modes
- `AGENTS.md`, `CLAUDE.md`, `*.mjs` scripts, `templates/*`

**THE RULE: When the user asks to customize anything (archetypes, must-haves, deal-breakers, area weightings, contact scripts, offer templates), ALWAYS write to `modes/_profile.md` or `config/profile.yml`. NEVER edit `modes/_shared.md` for user-specific content.**

### Main Files

| File | Function |
|------|----------|
| `data/listings.md` | Listings tracker (visited, offered, rejected, etc.) |
| `data/pipeline.md` | Inbox of pending URLs |
| `data/scan-history.tsv` | Scanner dedup history |
| `portals.yml` | Search queries and tracked agencies/portals |
| `templates/contact-template.md` | First-contact message to agent |
| `templates/offer-letter-template.md` | Purchase offer draft |
| `reports/` | Evaluation reports (format: `{###}-{slug}-{YYYY-MM-DD}.md`). Blocks A-F + G (Listing Legitimacy). |

### First Run -- Onboarding (IMPORTANT)

**Before doing ANYTHING else, check if the system is set up.** Run these checks silently every time a session starts:

1. Does `config/profile.yml` exist (not just profile.example.yml)?
2. Does `modes/_profile.md` exist (not just _profile.template.md)?
3. Does `portals.yml` exist (not just templates/portals.example.yml)?

If `modes/_profile.md` is missing, copy from `modes/_profile.template.md` silently. This is the user's customization file -- it will never be overwritten by updates.

**If `config/profile.yml` is missing, enter onboarding mode.** Do NOT proceed with evaluations or scans until the buyer profile is in place. Guide the user step by step:

#### Step 1: Buyer Profile (required)

Copy `config/profile.example.yml` to `config/profile.yml`, then ask:
> "I need a few details to personalize the system:
> - Your name and contact info (email, phone)
> - Where are you searching? (city, regions, specific neighborhoods)
> - Budget: target price, max price, are you cash buyer or need mortgage?
> - Property type: apartment, house, T1/T2/T3, min m²
> - Must-haves and deal-breakers (e.g. must have elevator, no ground floor)
> - Timeline: when do you want to move?
>
> I'll fill in `config/profile.yml` for you."

#### Step 2: Portals (recommended)

If `portals.yml` is missing:
> "I'll set up the portal scanner with the major Portuguese real estate portals (Idealista, Imovirtual, Casa Sapo, etc). Want me to tune the search queries to your areas and budget?"

Copy `templates/portals.example.yml` → `portals.yml`. Update queries with the user's areas, price range, typology.

#### Step 3: Tracker

The live data files are gitignored (they hold personal data). Seed them from the committed examples on first run:
- If `data/listings.md` is missing, copy from `data/listings.example.md`.
- If `data/pipeline.md` is missing, copy from `data/pipeline.example.md`.

#### Step 4: Get to know the user

After the basics are set up, proactively ask for context:

> "The basics are ready. The system works much better when it knows you well. Can you tell me more about:
> - What's your dream property look like? (be vivid -- light, garden, terrace, view, kitchen, etc.)
> - What's a deal-breaker that wouldn't show up on a listing card? (e.g. corner apartment, north-facing, noise from a road)
> - Any non-obvious red flags from past visits? (e.g. building from 70s with no thermal insulation, ground floor on a slope means humidity)
> - What's your renovation appetite? Move-in ready, cosmetic only, or willing to gut?
> - Anything that would make you skip a listing instantly? (e.g. no parking in Lisbon, no elevator above 3rd floor)
>
> The more context you give me, the better I filter."

Store insights in `config/profile.yml` (under preferences and constraints) or `modes/_profile.md`. Do not put user-specific framing into `modes/_shared.md`.

**After every evaluation, learn.** If the user says "this score is too high, I would never live there" or "you missed that I want a garden", update `modes/_profile.md` or `config/profile.yml`. The system should get smarter with every interaction.

#### Step 5: Ready

Once all files exist, confirm:
> "You're set. You can now:
> - Paste a listing URL to evaluate it
> - Run `/listai scan` to search portals
> - Run `/listai` to see all commands
>
> Everything is customizable -- just ask."

### Personalization

When the user asks to change archetypes, translate modes, adjust scoring, add portals, or modify contact scripts -- do it directly. You read the same files you use.

**Common customization requests:**
- "Change archetypes to investment focus" → edit `modes/_profile.md`
- "Translate the modes to Portuguese" → edit all files in `modes/`
- "Add this agency to my portals" → edit `portals.yml`
- "Update my budget" → edit `config/profile.yml`
- "Reduce weight on schools, increase weight on transit" → edit `modes/_profile.md`

### Language Modes

Default modes are English. If the user is searching in Portugal and prefers Portuguese, ask whether to translate `modes/` to Portuguese. The same applies to other countries (Spain, France, etc).

### Skill Modes

| If the user... | Mode |
|----------------|------|
| Pastes listing URL | auto-pipeline (evaluate + report + tracker) |
| Asks to evaluate listing | `listing` |
| Asks to compare listings | `compare` |
| Wants to contact agent | `contact` |
| Wants to research a neighborhood | `area-research` |
| Preps for visit | `visit-prep` |
| Drafts purchase offer | `offer` |
| Asks about application status | `tracker` |
| Searches portals | `scan` |
| Processes pending URLs | `pipeline` |

### Buyer Profile Source of Truth

- `config/profile.yml` is the canonical buyer profile
- `modes/_profile.md` holds adaptive framing, weightings, must-haves, deal-breakers
- **NEVER hardcode budgets, areas, or constraints** -- read them from these files at evaluation time

---

## Ethical Use -- CRITICAL

**This system is designed for thoughtful house hunting, not spray-and-pray.**

- **NEVER send a message or submit an offer without the user reviewing it first.** Draft contact emails and offer letters, but always STOP before clicking Send. The user makes the final call.
- **Strongly discourage low-fit visits.** If a score is below 3.5/5, explicitly recommend against booking a visit. Agents' and your own time are both valuable.
- **Quality over speed.** A well-targeted visit to 3 properties beats blasting 30 generic enquiries.
- **Respect agents' time.** Every enquiry someone reads costs attention.
- **Never inflate or fabricate** comparable sales or area data. If you don't know, say so.

---

## Listing Verification -- MANDATORY

**NEVER trust WebSearch/WebFetch alone to verify if a listing is still active or accurate.** Always corroborate:
1. WebFetch the URL to extract listing data
2. Cross-check `€/m²` against 2-3 comparable listings in the same area
3. If suspicious (priced 30%+ below comparables, photos don't match address, agent refuses video tour), flag in Block G

For Idealista and other JS-heavy portals, if WebFetch returns minimal text, fall back to Playwright (`browser_navigate` + `browser_snapshot`) if available. In headless batch mode, mark report header with `**Verification:** unconfirmed (batch mode)`.

---

## Stack and Conventions

- Node.js (mjs modules), YAML (config), Markdown (data)
- Scripts in `.mjs`, configuration in YAML
- Output in `output/` (gitignored), Reports in `reports/`
- Report numbering: sequential 3-digit zero-padded, max existing + 1
- **RULE: After each batch of evaluations, run `node merge-tracker.mjs`** (if present) to merge tracker additions and avoid duplications.
- **RULE: NEVER create new entries in listings.md if address+listing already exists.** Update the existing entry.

### TSV Format for Tracker Additions

Write one TSV file per evaluation to `batch/tracker-additions/{num}-{slug}.tsv`. Single line, 9 tab-separated columns:

```
{num}\t{date}\t{address_or_area}\t{type}\t{status}\t{score}/5\t{price}\t[{num}](reports/{num}-{slug}-{date}.md)\t{note}
```

**Column order (status BEFORE score in TSV, score BEFORE status in listings.md). The merge script handles the column swap.**

### Pipeline Integrity

1. **NEVER edit listings.md to ADD new entries** -- write TSV in `batch/tracker-additions/` and let `merge-tracker.mjs` handle the merge.
2. **YES you can edit listings.md to UPDATE status/notes of existing entries.**
3. All reports MUST include `**URL:**` in the header (between Score and Price). Include `**Legitimacy:** {tier}` (see Block G in `modes/listing.md`).
4. All statuses MUST be canonical (see `templates/states.yml`).

### Canonical States (listings.md)

**Source of truth:** `templates/states.yml`

| State | When to use |
|-------|-------------|
| `Evaluated` | Report completed, pending decision |
| `Contacted` | Reached out to agent |
| `Visit Scheduled` | Visit booked |
| `Visited` | Visit done, deciding next step |
| `Offer Sent` | Purchase offer submitted |
| `Negotiating` | Active negotiation |
| `Under Contract` | CPCV signed (Promissory Contract) |
| `Closed` | Deed signed, property bought |
| `Rejected` | Rejected by seller, withdrawn by us, or fell through |
| `Discarded` | Skipped -- doesn't fit |
| `Off Market` | Listing closed before we acted |

**RULES:**
- No markdown bold (`**`) in status field
- No dates in status field (use the date column)
- No extra text (use the notes column)

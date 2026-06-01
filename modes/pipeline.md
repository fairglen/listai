# Mode: pipeline

Process pending URLs in `data/pipeline.md` and run full evaluations on them.

## When to use

- User says "process the pipeline", "evaluate the pending ones", "run pipeline"
- After a `scan` that queued items

## Inputs

1. `data/pipeline.md` — under `## Pending`, a bullet list of URLs

## Process

### Step 1 — Read pipeline

Parse `data/pipeline.md`. Collect every URL under `## Pending`.

### Step 2 — Confirm scope

Tell the user:

```
Found N pending URLs.
- Idealista: X
- Imovirtual: Y
- Casa Sapo: Z
- Other: W

Estimated time: ~N min (M min per evaluation).
Cost: each evaluation does 1-3 WebSearches and 1 WebFetch/Playwright.

Proceed with all N? Or filter first?
```

### Step 3 — Evaluate sequentially

For each URL:
1. Run `listing` mode end-to-end (Blocks A-G)
2. Save report to `reports/`
3. Write tracker TSV to `batch/tracker-additions/`
4. Move the URL from `## Pending` to `## Processed ({date})` in pipeline.md

NEVER run Playwright in parallel — sequential only.

### Step 4 — Merge tracker

After all evaluations, run `node merge-tracker.mjs` (if present) to merge TSV files into `data/listings.md`.

### Step 5 — Summarize

```
Pipeline processed. N evaluations complete.

| Score band | Count | Action |
|------------|-------|--------|
| 4.5+ | X | Recommend visit — see report list below |
| 4.0-4.4 | Y | Worth visit — review |
| 3.5-3.9 | Z | Marginal |
| < 3.5 | A | Recommend skip |

Top 3 by score:
1. [Address, typology] — score X.X — [report link]
2. ...

Recommended next step: draft contact for the top 2?
```

## Rules

1. **Sequential, never parallel** when Playwright is involved.
2. **One TSV per evaluation**, never edit listings.md directly to add rows.
3. **Move processed URLs** out of `## Pending` so re-running doesn't repeat work.
4. **If a URL is dead (404, removed)** → log it as `Off Market` in tracker, note in pipeline.md.
5. **If the user wants to filter first** (only high-quick-score ones) → use scan history's `quick_score` column to prioritize.

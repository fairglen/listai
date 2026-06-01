# Mode: export

Generate a shareable spreadsheet (`.xlsx`) or `.csv` from listai data — a ranked
shortlist, the tracker, or scan history — that the user can open in Excel /
Google Sheets / Numbers or upload to Google Drive.

## When to use

- User says "export", "give me a spreadsheet", "xlsx", "a sheets file",
  "shareable list", "send to Drive", "put this in a spreadsheet"
- After a scan or a batch of evaluations, when the user wants the results in a
  portable, sortable format

## Inputs

1. The data to export — one or more of:
   - A **shortlist** assembled from `data/scan-history.tsv` (filter + rank by
     quick score) or from `reports/`
   - The **tracker** (`data/listings.md` — a Markdown table)
   - The raw **scan history** (`data/scan-history.tsv`)
2. `config/profile.yml` / `modes/_profile.md` — to decide ranking and which
   columns matter

## Process

### Step 1 — Assemble the data as CSV/TSV

Write the rows you want to export to a CSV (or TSV) file in `output/`
(gitignored). Keep a clean header row and one record per line.

- For a **shortlist**: pull candidates from `data/scan-history.tsv`, drop
  rejects/dupes, sort by score (and apply the buyer's rules from `_profile.md`,
  e.g. the commute-scaled outdoor requirement). Suggested columns:
  `Rank, Score, Type, Typology, Area_m2, Price_EUR, Location, Concelho,
  Commute, Outdoor_and_Condition_Note, Status, Link`.
- For the **tracker**: convert the `data/listings.md` Markdown table to CSV
  (strip the `|` and separator row).
- Numeric columns (Score, Area, Price) should hold bare numbers so they sort
  and sum correctly in the sheet.

Name it with a date, e.g. `output/listai-shortlist-{YYYY-MM-DD}.csv`.

### Step 2 — Convert to .xlsx

Run the bundled, dependency-free converter (Node built-ins only, no install):

```
node export-xlsx.mjs <output.xlsx> <input1.csv|tsv> [input2 ...]
```

- Each input file becomes one **sheet** (named after the file).
- The header row is **frozen + filtered**; columns are **auto-sized**; numeric
  cells are written as real numbers.
- Delimiter is inferred from the extension (`.tsv` → tab, else comma).

Examples:

```
# one sheet
node export-xlsx.mjs output/listai-shortlist-2026-06-01.xlsx output/listai-shortlist-2026-06-01.csv

# multi-sheet workbook: shortlist + full scan history
node export-xlsx.mjs output/listai-export-2026-06-01.xlsx \
  output/listai-shortlist-2026-06-01.csv data/scan-history.tsv
```

Or via npm: `npm run export -- <output.xlsx> <input...>`.

### Step 3 — Deliver

Tell the user the file path(s) in `output/` and how to share:

- **Google Drive:** drag the `.xlsx` into Drive → it opens as a native Google
  Sheet (the `.xlsx` converts more faithfully than the raw CSV).
- **Direct upload:** if the Google Drive connector is authorized, offer to
  upload it to their Drive for them.

## Rules

1. **Output goes to `output/`** (gitignored) — it contains the user's personal
   shortlist and must never be committed.
2. **Never fabricate** listings, prices, or scores to fill the sheet. Carry over
   exactly what's in the data, and keep "unconfirmed/verify" flags intact.
3. **Flag broken data** — if a listing's link came back truncated from a scrape,
   keep the note and a fallback search URL rather than inventing a URL.
4. **Keep numeric columns numeric** so sorting/summing works.
5. The converter is **zero-dependency** — do not add npm packages for export.

## Example

```
$ "export my shortlist as a sheets file"

Wrote output/listai-shortlist-2026-06-01.xlsx — 1 sheet "Shortlist" (18 listings).
Drag it into Google Drive to open as a Sheet, or I can upload it for you.
```

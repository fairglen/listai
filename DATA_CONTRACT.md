# Data Contract

listai has two layers. Mixing them breaks updates and personalization.

## User Layer (NEVER auto-updated)

Anything containing your personal data, preferences, or accumulated history.

| Path | What it holds |
|------|---------------|
| `config/profile.yml` | Buyer identity, budget, areas, contact info |
| `modes/_profile.md` | Adaptive framing, scoring weights, contact scripts, deal-breakers |
| `portals.yml` | Search queries, tracked agencies, custom title filters |
| `data/listings.md` | Tracker — every listing you've evaluated |
| `data/pipeline.md` | Inbox of pending URLs |
| `data/scan-history.tsv` | Scanner dedup history |
| `reports/` | Generated evaluations |
| `output/` | Generated artifacts (gitignored) |

**Rule:** Auto-update will never touch any path in this list. Personalization goes here.

**Git:** every path above is gitignored so personal data is never committed. The repo ships committed seeds only — `config/profile.example.yml`, `modes/_profile.template.md`, `templates/portals.example.yml`, `data/listings.example.md`, `data/pipeline.example.md` — which onboarding copies into the live (ignored) files.

## System Layer (auto-updatable)

The engine: prompts, scoring rules, scripts, templates. Updated by `update-system.mjs` (when present).

| Path | What it holds |
|------|---------------|
| `AGENTS.md`, `CLAUDE.md` | Top-level agent instructions |
| `modes/_shared.md` | Shared system context across modes |
| `modes/_profile.template.md` | Template copied to `_profile.md` on first run |
| `modes/listing.md`, `modes/contact.md`, etc. | Mode definitions |
| `templates/*` | Boilerplate (states, portals example, message templates) |
| `export-xlsx.mjs` | Shipped helper: zero-dependency CSV/TSV → XLSX exporter (used by `export` mode) |
| `*.mjs` (other) | Any further optional helper scripts you add |
| `VERSION` | Semver of the system layer |

**Rule:** Don't put personal data here. If you customize something in this layer, an update will overwrite it.

## When in doubt

- **Customizing for your search?** → User layer
- **Improving the engine for everyone?** → System layer (and consider upstreaming)

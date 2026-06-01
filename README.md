# listai

> **An AI agent that hunts for your next home.** Paste a listing and it scores it against what *you* actually want; tell it to scan and it sweeps the portals for you.

## What kind of tool is this?

**listai is an [Agent Skill](https://agentskills.io)** — not an app you install, but a folder of plain-language instructions and config that any **AI coding assistant** loads and follows.

Agent Skills are an open standard (originally created by Anthropic). A skill is just a folder with two things: a **`name`** and a **`description`** that tell the AI what it does and when to use it, plus the instructions themselves. Because it's an open standard, the *same* listai folder works across many AI tools — **Claude Code, OpenAI Codex, Gemini CLI, Cursor, GitHub Copilot, OpenCode**, and more.

In skill terms, listai's metadata reads:

```yaml
name: listai
description: >
  AI property-search assistant for Portugal and beyond. Evaluates and scores
  home listings against the user's buyer profile (budget, area, typology,
  must-haves, deal-breakers), scans property portals for new matches, tracks
  the pipeline from first contact to closing, and drafts agent messages, visit
  checklists, and purchase offers. Use whenever the user is house-hunting:
  pastes a listing URL, asks to evaluate/compare/scan, or wants to contact an
  agent or make an offer.
```

> **Sibling skill:** listai is adapted from **[career-ops](https://github.com/santifer/career-ops)** by santifer — the same Agent-Skill architecture, but for job hunting instead of house hunting. If you've used one, listai will feel familiar.

## What it does

You talk to it in plain English. Under the hood it can:

- **Evaluate listings** against your buyer profile (budget, area, typology, must-haves, deal-breakers)
- **Score** each listing 1-5 across price, location, condition, legal/process risk, and overall fit
- **Track** every listing through the full pipeline: contacted, visited, offer sent, negotiating, closed
- **Draft** contact messages, visit prep checklists, and purchase offer letters
- **Scan** portals for new listings that match your criteria

## How you use it (important)

**listai is driven by talking to your AI assistant in plain language — not by typing commands.**
There is no `/listai` command. Once the `listai` folder is open in your assistant (see [Setup](#setup-about-10-minutes-no-coding-required)), just say what you want:

| You say… | What happens |
|----------|--------------|
| "set me up" / first run | Agent reads `AGENTS.md` and walks you through onboarding |
| *paste a listing URL* | Evaluates it, writes a report, adds it to the tracker |
| "scan" / "what's new" | Searches the portals in `portals.yml`, triages, queues good ones |
| "evaluate this listing" | Full scored report (Blocks A–G) |
| "compare these two" | Side-by-side comparison |
| "contact the agent" | Drafts a first-contact message (you review before sending) |
| "research this neighborhood" | Area report |
| "prep me for the visit" | Visit checklist tailored to you |
| "draft an offer" | Purchase-offer letter (you review before sending) |
| "show my pipeline" / "status" | Tracker overview |
| "process the pipeline" | Batch-evaluates URLs queued in `data/pipeline.md` |

The agent picks the right mode (in `modes/`) automatically based on what you ask.

## Setup (about 10 minutes, no coding required)

You don't need to be technical. You need two things: **(1)** an AI assistant that supports Agent Skills, and **(2)** this folder on your computer. Then you just talk to it.

These steps use **Claude Code** because it's the easiest to get going (Mac & Windows app). Any [skills-compatible tool](https://agentskills.io) works the same way.

### Step 1 — Install the AI assistant

- **Mac:** Go to **[claude.ai/download](https://claude.ai/download)**, download the Claude desktop app, open it, and sign in. Claude Code is built in.
- **Windows:** Go to **[claude.ai/download](https://claude.ai/download)**, download the Windows app, open it, and sign in.

*(You'll need a Claude account — a free or paid plan works to start.)*

### Step 2 — Get the listai folder onto your computer

Easiest, no-tools way:

1. On this project's page, click the green **`Code`** button → **Download ZIP**.
2. **Unzip it** (Mac: double-click the file. Windows: right-click → *Extract All*).
3. You'll get a folder called **`listai`**. Move it somewhere easy to find, like your **Documents**.

### Step 3 — Open the folder in the assistant

In Claude (or your tool of choice), choose **Open Folder** and pick the **`listai`** folder you just unzipped. That's it — the assistant now "is" listai.

### Step 4 — Say the magic words

Type:

> **set me up**

The assistant reads its instructions and walks you through a short interview — where you're searching, your budget, what you must have and won't accept, your commute. It fills in all the config files for you. You never edit a file by hand unless you want to.

### Step 5 — Start hunting

- **Paste a listing link** → it evaluates and scores it.
- Type **`scan`** → it searches the portals and brings back the best matches.
- Type **`help`** or **`what can you do?`** → it lists everything.

That's the whole setup. **No installing packages, no command line, no build step** — listai is just text files your assistant reads.

> 💡 **Stuck on anything?** Just tell the assistant in plain words — *"I can't find the folder"*, *"redo my budget"*, *"translate everything to Portuguese."* It can fix its own setup.

> **Note:** there is no `npm run scan` or `/listai` command — everything is plain language. Just say **"scan."**

## Scanning — what to expect

When you say "scan," the agent works through every `enabled: true` query in `portals.yml`, dedups against `data/scan-history.tsv`, pre-scores survivors against your profile, queues the best into `data/pipeline.md`, and shows you a high/medium/low triage list. It never runs full evaluations without asking.

**Portal reality (Portugal, 2026):**
- **Casa Sapo** and **SuperCasa** are usually fetchable directly (but rate-limit if hammered — the scan runs one query at a time on purpose).
- **Idealista** and **Imovirtual** block bots (HTTP 403). The agent will fall back to Playwright if available, otherwise it tells you to **paste the listing/search URL manually**.
- **Bank-owned** (Santander, BPI/Quatru, Caixa Imobiliário, Imobancos), **auctions** (e-leilões), and **Facebook Marketplace** are best checked manually — they're configured but marked `enabled: false` by default.

## Files you own (never auto-updated)

- `config/profile.yml` — buyer profile (budget, areas, must-haves)
- `modes/_profile.md` — your archetypes, weightings, contact scripts
- `portals.yml` — search queries, tracked agencies
- `data/` — your tracker (`listings.md`), pipeline (`pipeline.md`), scan history
- `reports/` — evaluations

## Files the system owns (auto-updatable)

- `AGENTS.md`, `CLAUDE.md`, `modes/_shared.md`, `modes/listing.md`, and all other modes
- `templates/*` (and any optional `*.mjs` helper scripts you add — none ship by default)

See `DATA_CONTRACT.md` for the full split. **Personalization always goes in the files you own** — when you ask to change archetypes, weightings, scripts, or portals, the agent edits those, never the shared system files.

## Customizing

Just ask. "Weight schools higher than transit," "translate the modes to Portuguese," "add this agency to my portals," "raise my budget to €380k" — the agent edits the right file for you. After evaluations, tell it when a score feels wrong ("I'd never live there", "you missed that I want a garden") and it updates your profile so it gets smarter over time.

## Origin

Adapted from **[career-ops](https://github.com/santifer/career-ops)** by santifer — the same Agent-Skill architecture, pointed at house hunting instead of job hunting. Built to the open [Agent Skills](https://agentskills.io) standard.

## License

MIT

# Browser scanning (optional) — reaching bot-blocked portals

Most Portuguese portals (Idealista, Imovirtual, SuperCasa, OLX, CustoJusto) return
**HTTP 403** to plain requests — they sit behind Cloudflare / DataDome. The normal
agent scanner can't read them; only **Casa Sapo** serves plain fetches.

`scan-browser.mjs` drives a **real headless browser (Playwright)** that executes the
portals' JavaScript and clears the bot challenge, retrieving pages a plain fetch
cannot. It is **opt-in** and **does not touch the zero-dependency core** — Playwright
is never installed unless you ask for it, and nothing else in listai needs it.

## What actually works (measured 2026-06)

A vanilla headless browser is **not** a silver bullet — anti-bot strength varies:

| Portal | Plain fetch | Headless browser (this script) |
|--------|-------------|-------------------------------|
| Casa Sapo | ✅ works | ✅ (not needed) |
| **Imovirtual** | ❌ 403 | ✅ **works** — full listings |
| **SuperCasa** | ❌ 403 | ✅ **works** — full listings |
| OLX / CustoJusto | ❌ 403 | ⚠️ usually works, verify |
| **Idealista** | ❌ 403 | ❌ **still blocked** (DataDome) — returns an empty shell |

So the browser scanner roughly **doubles** portal coverage (adds Imovirtual +
SuperCasa, the two biggest after Idealista). **Idealista needs more** — a stealth
plugin, a paid scraping API, or its official API (see "Idealista" below).

## Enable it (one time)

```bash
npm install playwright          # the library (~50 MB)
npx playwright install chromium # the browser binary (~90 MB)
```

That's the only time listai asks you to install anything. If you skip it, the
script simply prints these instructions and exits — everything else keeps working.

## Use it

```bash
# one portal search page at a time (respect rate limits + terms)
node scan-browser.mjs "https://www.imovirtual.com/pt/resultados/comprar/apartamento,moradia,t2,t3,t4/lisboa/sintra?priceMin=250000&priceMax=360000"

# or via npm
npm run scan:browser -- "<url>"
```

Options: `--out <file>` (where to save), `--html` (also save raw HTML),
`--headful` (show the window — useful to solve a challenge by hand),
`--timeout <ms>`, `--wait <ms>`.

The script writes the **rendered visible text + listing links** to
`output/browser-scan-<host>-<timestamp>.txt`. It does **not** triage — it hands that
text to the agent, which reads the file and ranks listings exactly like a normal
scan. In practice you just say **"scan Imovirtual with the browser"** and the agent
runs the script, reads the output, and updates the pipeline.

The `STATUS:` line in the output says `ok` or `BLOCKED` so you know whether the
challenge cleared.

## Alternative: a Playwright MCP (drive the browser inside the chat)

If you'd rather the agent control a browser directly in conversation (no script),
add a **Playwright MCP server** to your AI tool. Then the agent gets
`browser_navigate` / `browser_snapshot` tools and can open a portal, read the
rendered page, and even click through — interactively. Setup (Claude Code):

```bash
claude mcp add playwright npx '@playwright/mcp@latest'
```

Script vs MCP: the **script** is best for repeatable batch sweeps; the **MCP** is
best for one-off "open this and look" and for pages that need a click or scroll.

## Idealista specifically

Idealista uses DataDome, which detects plain headless Chromium. Options, cheapest
first:

1. **Official Idealista API** — free tier, OAuth key on request (~100 calls/month).
   Legit and stable; apply at the Idealista developer portal.
2. **Stealth** — `playwright-extra` + `puppeteer-extra-plugin-stealth` sometimes
   gets through; an arms race, not guaranteed.
3. **Scraping API** — ScraperAPI / Zyte / Apify (Apify has a ready-made Idealista
   actor). Reliable but paid.
4. **Email alerts + paste** — save a search on idealista.pt, let it email you new
   matches, paste the links → the agent evaluates them. Zero infrastructure.

## Rules & etiquette

- **One page at a time**, with the built-in settle delay. Don't hammer — you'll get
  rate-limited or IP-banned, and it's rude.
- **Respect each portal's Terms of Service.** This is for personal, low-volume home
  searching, not bulk data harvesting or resale.
- Output goes to `output/` (gitignored) — never commit scraped pages.
- Keep Playwright **out of the core**: it stays opt-in, never a declared dependency.

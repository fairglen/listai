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
| **Idealista** | ❌ 403 | ❌ plain headless — needs `--stealth` + a one-time headful solve from a home IP (see "Stealth mode") |

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

## Stealth mode — for Idealista / DataDome

The `--stealth` flag turns on the anti-bot stack: it uses **real Google Chrome**
(not bundled Chromium), **masks the automation fingerprints** DataDome looks for
(`navigator.webdriver`, plugins, WebGL, etc.), and **warms up via the portal
homepage** so the visit looks organic. Combine it with `--profile` to **save and
reuse the cleared session cookie** (including DataDome's `datadome` clearance).

```bash
# FIRST run — headful, so you can solve the one-time challenge by hand:
node scan-browser.mjs "https://www.idealista.pt/comprar-casas/sintra/com-preco-max_360000,preco-min_250000,t2,t3,t4/" \
  --stealth --headful --profile output/.idealista-state.json --out output/idealista-sintra.txt

# LATER runs — reuse the saved cookie (can be headless):
node scan-browser.mjs "<idealista url>" --stealth --profile output/.idealista-state.json --out output/idealista-sintra.txt
```

### What YOU need to do (the levers the script can't pull for you)

1. **Run it on your own computer (home internet), not a server.** This is the
   single biggest factor. DataDome trusts residential IPs and instantly blocks
   datacenter/cloud ones — a headless run from a cloud IP fails *even with*
   stealth (measured). On your own Mac at home you already have a residential IP.
2. **Have Google Chrome installed.** `--stealth` uses it via `channel: "chrome"`;
   it auto-falls back to bundled Chromium (weaker) if Chrome isn't found.
3. **Do the first run with `--headful`.** A window opens; if Idealista shows a
   "press & hold" / CAPTCHA challenge, **solve it once by hand.** The script then
   saves the cleared cookie to your `--profile` file. Later runs reuse it and can
   run headless until it expires (then just repeat the headful solve).
4. **Go slow and low-volume.** A few pages, with the built-in delays. Hammering
   re-triggers the wall and risks an IP/account ban.

### Honest expectations

Stealth meaningfully raises your odds but is **not guaranteed** — DataDome is an
arms race and updates regularly. If it keeps failing even headful from home, fall
back to the **official Idealista API** or **email alerts** (below), or a paid
**unlocker** (Zyte / ScraperAPI / Bright Data / Apify's Idealista actor) which
bundles residential proxies + fingerprinting + CAPTCHA solving.

### Stealth engines (undetected-chromedriver-style)

`--stealth` auto-selects the best browser engine that's installed, in this order
(then falls back to plain Playwright + the built-in fingerprint masking):

1. **patchright** — patched Playwright, drop-in, hides the CDP/`Runtime.enable`
   leak DataDome detects. The Node equivalent of undetected-chromedriver. Best.
   ```bash
   npm install patchright && npx patchright install chromium
   ```
2. **playwright-extra + puppeteer-extra-plugin-stealth** — the same stealth-plugin
   family used with Puppeteer.
   ```bash
   npm install playwright-extra puppeteer-extra-plugin-stealth
   ```

Install either, then run with `--stealth` as usual — the scanner uses it
automatically and prints `engine="patchright"` (etc.).

### If you get hard-banned ("uso indevido / acesso bloqueado")

A page like *"Foi detetado um uso indevido. O acesso foi bloqueado"* with an
incident ID is a **hard IP/fingerprint ban**, not a CAPTCHA. No stealth flag beats
it on the same IP. To recover:

1. **Stop hitting the site** — bans are often temporary (minutes to a day or two).
2. **Change IP** — phone hotspot, a different network, or a **residential/mobile
   proxy**. DataDome weights IP reputation most heavily; a fresh good IP is the
   single biggest lever (this is what made undetected-chromedriver work on other
   sites — driver **plus** a clean IP).
3. **Then** use a stealth engine (patchright) + go slow + solve the CAPTCHA once +
   reuse the session. Low volume, human pace.

If it keeps banning, it isn't worth the arms race for a personal search — the
**official Idealista API** or **email alerts** are the sane, durable paths, and
Imovirtual + SuperCasa + Casa Sapo already cover most of the same inventory.

The `--profile` session file lands in `output/` (gitignored) — it holds cookies,
so it's personal; never commit it.

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

0. **`--stealth` from your home machine** (see "Stealth mode" above) — real Chrome
   + fingerprint masking + a one-time headful challenge solve + cookie reuse. Free,
   best-effort, your first thing to try.
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

#!/usr/bin/env node
// scan-browser.mjs — OPTIONAL Playwright-powered fetcher for bot-blocked portals.
//
// Idealista / Imovirtual / SuperCasa / OLX / CustoJusto return HTTP 403 to plain
// requests (Cloudflare). A real headless browser executes their JS and clears the
// challenge, so this script can retrieve pages the normal scanner cannot.
//
// THIS IS OPT-IN AND DOES NOT TOUCH THE ZERO-DEPENDENCY CORE.
// Playwright is NOT a declared dependency. If it isn't installed, this script
// prints install instructions and exits — nothing else in listai needs it.
//
// Enable it (one time):
//   npm install playwright        # ~ the package
//   npx playwright install chromium   # ~ the browser binary
//
// Usage:
//   node scan-browser.mjs <url> [<url2> ...] [options]
//
// Options:
//   --out <file>     Write extracted text+links here (default: output/browser-scan-<host>-<ts>.txt)
//   --html           Also save the full rendered HTML next to the .txt
//   --headful        Show the browser window (debugging / solving a challenge by hand)
//   --timeout <ms>   Navigation timeout (default 45000)
//   --wait <ms>      Extra settle time after load for lazy content (default 3500)
//   --stealth        Anti-bot mode: use real Google Chrome + mask automation fingerprints
//                    + warm up via the portal homepage first. For tough walls (Idealista/
//                    DataDome). RUN FROM YOUR OWN MACHINE (residential IP) — cloud IPs fail.
//   --channel <name> Browser channel for --stealth (default "chrome"; falls back to bundled).
//   --profile <file> Persist + reuse the session (cookies incl. the DataDome clearance cookie)
//                    in <file>. First run with --headful: solve any challenge by hand once;
//                    the cleared cookie is saved and reused on later (even headless) runs.
//
// The script does NOT parse listings itself — it hands the rendered text + listing
// links to the agent, which triages them exactly like a normal scan result. Run
// ONE portal at a time; respect each portal's rate limits and terms of use.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// ---- arg parsing ----
const argv = process.argv.slice(2);
const urls = [];
const opts = { out: null, html: false, headful: false, timeout: 45000, wait: 3500, stealth: false, channel: null, profile: null };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--out') opts.out = argv[++i];
  else if (a === '--html') opts.html = true;
  else if (a === '--headful') opts.headful = true;
  else if (a === '--timeout') opts.timeout = parseInt(argv[++i], 10);
  else if (a === '--wait') opts.wait = parseInt(argv[++i], 10);
  else if (a === '--stealth') opts.stealth = true;
  else if (a === '--channel') opts.channel = argv[++i];
  else if (a === '--profile') opts.profile = argv[++i];
  else if (a.startsWith('http')) urls.push(a);
  else {
    console.error(`Unknown argument: ${a}`);
    process.exit(1);
  }
}
if (urls.length === 0) {
  console.error('Usage: node scan-browser.mjs <url> [<url2> ...] [--out f] [--html] [--headful] [--timeout ms] [--wait ms]');
  process.exit(1);
}

// ---- load Playwright, or explain how to get it (keeps the core zero-dep) ----
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    [
      '',
      'Playwright is not installed — this OPTIONAL browser scanner needs it.',
      'The rest of listai works without it; only bot-blocked portals need a real browser.',
      '',
      'Enable it (one time):',
      '  npm install playwright',
      '  npx playwright install chromium',
      '',
      'Then re-run your command. See docs/browser-scanning.md for details.',
      '',
    ].join('\n')
  );
  process.exit(2);
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const CHALLENGE_HINTS = ['just a moment', 'attention required', 'verifying you are human', 'cf-challenge', 'enable javascript and cookies', 'geo.captcha-delivery', 'datadome'];

// Hand-rolled stealth: mask the automation tells DataDome/Cloudflare look for.
// (No extra packages — runs inside the page before any portal script.)
const STEALTH_SCRIPT = `
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  Object.defineProperty(navigator, 'languages', { get: () => ['pt-PT', 'pt', 'en'] });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  window.chrome = window.chrome || { runtime: {}, app: {}, csi: () => {}, loadTimes: () => {} };
  const _q = window.navigator.permissions && window.navigator.permissions.query;
  if (_q) window.navigator.permissions.query = (p) =>
    p && p.name === 'notifications'
      ? Promise.resolve({ state: Notification.permission })
      : _q(p);
  const _gp = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function (p) {
    if (p === 37445) return 'Intel Inc.';
    if (p === 37446) return 'Intel Iris OpenGL Engine';
    return _gp.call(this, p);
  };
`;

function tsStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

async function extract(page) {
  return page.evaluate(() => {
    const text = document.body ? document.body.innerText : '';
    const links = Array.from(document.querySelectorAll('a[href]'))
      .map((a) => a.href)
      .filter((h) => /(imovel|comprar|venda|anuncio|listing|property|-id-|\d{6,}|\.html)/i.test(h));
    return { title: document.title, text, links: Array.from(new Set(links)) };
  });
}

let browser;
let exitCode = 0;
try {
  const launchOpts = { headless: !opts.headful };
  if (opts.stealth || opts.channel) {
    const channel = opts.channel || 'chrome';
    try {
      browser = await chromium.launch({ ...launchOpts, channel });
      process.stderr.write(`  (stealth: using real browser channel "${channel}")\n`);
    } catch (e) {
      process.stderr.write(`  (channel "${channel}" unavailable — falling back to bundled Chromium: ${e.message.split('\n')[0]})\n`);
      browser = await chromium.launch(launchOpts);
    }
  } else {
    browser = await chromium.launch(launchOpts);
  }

  const contextOpts = {
    userAgent: UA,
    viewport: { width: 1366, height: 900 },
    locale: 'pt-PT',
    timezoneId: 'Europe/Lisbon',
  };
  if (opts.profile && fs.existsSync(opts.profile)) {
    contextOpts.storageState = opts.profile;
    process.stderr.write(`  (loaded saved session from ${opts.profile})\n`);
  }
  const context = await browser.newContext(contextOpts);
  if (opts.stealth) await context.addInitScript(STEALTH_SCRIPT);

  for (const url of urls) {
    const host = (() => {
      try {
        return new URL(url).host.replace(/^www\./, '');
      } catch {
        return 'page';
      }
    })();
    const page = await context.newPage();
    process.stderr.write(`\n→ ${url}\n`);
    try {
      // Warm up via the portal homepage so the visit looks organic (helps DataDome).
      if (opts.stealth) {
        try {
          await page.goto(`https://${host}/`, { waitUntil: 'domcontentloaded', timeout: opts.timeout });
          await page.waitForTimeout(1500 + Math.random() * 1500);
        } catch {
          /* warmup is best-effort */
        }
      }
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: opts.timeout });
      await page.waitForTimeout(opts.wait);

      // If we hit a Cloudflare interstitial, give it longer (and a chance to auto-clear).
      let info = await extract(page);
      const looksBlocked = CHALLENGE_HINTS.some((h) => info.title.toLowerCase().includes(h) || info.text.slice(0, 400).toLowerCase().includes(h));
      if (looksBlocked) {
        process.stderr.write('  …challenge detected, waiting 8s for it to clear');
        await page.waitForTimeout(8000);
        info = await extract(page);
      }

      // gentle scroll to trigger lazy-loaded cards
      await page.evaluate(async () => {
        for (let y = 0; y < 4; y++) {
          window.scrollBy(0, document.body.scrollHeight / 4);
          await new Promise((r) => setTimeout(r, 350));
        }
      });
      info = await extract(page);

      const stillBlocked = CHALLENGE_HINTS.some((h) => info.title.toLowerCase().includes(h));
      const outFile = opts.out || path.join('output', `browser-scan-${host}-${tsStamp()}.txt`);
      fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
      const body =
        `URL: ${url}\nTITLE: ${info.title}\nFETCHED: ${new Date().toISOString()}\n` +
        `STATUS: ${stillBlocked ? 'BLOCKED (challenge not cleared)' : 'ok'}\n` +
        `LISTING LINKS (${info.links.length}):\n${info.links.join('\n')}\n\n` +
        `--- VISIBLE TEXT ---\n${info.text}\n`;
      fs.writeFileSync(outFile, body);
      if (opts.html) fs.writeFileSync(outFile.replace(/\.txt$/, '.html'), await page.content());

      process.stderr.write(
        `  ${stillBlocked ? '⚠ blocked' : '✓ ok'} — ${info.links.length} links → ${outFile}\n`
      );
      if (stillBlocked) exitCode = 3;
    } catch (e) {
      process.stderr.write(`  ✗ error: ${e.message}\n`);
      if (/Executable doesn.t exist|playwright install/i.test(e.message)) {
        process.stderr.write('  Browser binary missing — run:  npx playwright install chromium\n');
      }
      exitCode = 3;
    } finally {
      await page.close();
    }
  }

  // Persist cookies/session (incl. any DataDome clearance) for reuse next run.
  if (opts.profile) {
    await context.storageState({ path: opts.profile });
    process.stderr.write(`\n  (saved session to ${opts.profile})\n`);
  }
} catch (e) {
  console.error(`Browser launch failed: ${e.message}`);
  if (/Executable doesn.t exist|playwright install/i.test(e.message)) {
    console.error('Run:  npx playwright install chromium');
  }
  exitCode = 2;
} finally {
  if (browser) await browser.close();
}
process.exit(exitCode);

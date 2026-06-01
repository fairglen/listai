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
const opts = { out: null, html: false, headful: false, timeout: 45000, wait: 3500 };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--out') opts.out = argv[++i];
  else if (a === '--html') opts.html = true;
  else if (a === '--headful') opts.headful = true;
  else if (a === '--timeout') opts.timeout = parseInt(argv[++i], 10);
  else if (a === '--wait') opts.wait = parseInt(argv[++i], 10);
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

const CHALLENGE_HINTS = ['just a moment', 'attention required', 'verifying you are human', 'cf-challenge'];

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
  browser = await chromium.launch({ headless: !opts.headful });
  const context = await browser.newContext({
    userAgent: UA,
    viewport: { width: 1366, height: 900 },
    locale: 'pt-PT',
  });

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

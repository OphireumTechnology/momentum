import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4173';
const widths = [320, 360, 375, 390, 430, 768, 1024, 1440];
const out = 'mobile-browser-results';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = [];
let failed = false;
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 850 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 45000 });
  await page.screenshot({ path: `${out}/home-${width}.png`, fullPage: true });
  const homeOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  const quoteLink = page.getByRole('button', { name: /request a quote|quote/i }).first();
  const quoteAnchor = page.getByRole('link', { name: /request a quote|quote/i }).first();
  if (await quoteLink.isVisible().catch(() => false)) await quoteLink.click();
  else if (await quoteAnchor.isVisible().catch(() => false)) await quoteAnchor.click();
  else {
    const menu = page.getByRole('button', { name: /menu|navigation/i }).first();
    if (await menu.isVisible().catch(() => false)) await menu.click();
    const item = page.getByRole('button', { name: /request a quote|quote/i }).first();
    if (await item.isVisible().catch(() => false)) await item.click();
    else await page.getByRole('link', { name: /request a quote|quote/i }).first().click();
  }
  await page.getByText('Request a Transportation Quote').first().waitFor({ timeout: 15000 });
  await page.screenshot({ path: `${out}/quote-${width}.png`, fullPage: true });
  const quoteOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  const row = { width, homeOverflow, quoteOverflow, errors };
  report.push(row);
  if (homeOverflow || quoteOverflow || errors.length) failed = true;
  await page.close();
}
await browser.close();
await fs.writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failed) process.exitCode = 1;

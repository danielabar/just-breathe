/**
 * QA screenshot script for the Night Garden design update.
 *
 * Captures 8 UI states that cover the full redesign:
 *   main, main-custom-duration, countdown, session-just-started,
 *   session-in-progress, history-empty, history, about
 *
 * HOW TO USE:
 *   npm run dev                           (keep dev server running in a separate terminal)
 *   node scripts/design-review.js step-10 (saves to scratch/design-update/screenshots/step-10/)
 *   node scripts/design-review.js         (saves to scratch/design-update/screenshots/run/)
 *
 * Screenshots are saved to scratch/design-update/screenshots/<label>/
 *
 * History data is injected via localStorage so timestamps show
 * "Yesterday · ..." and "Feb XX · ..." without waiting for real sessions.
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE_URL = 'http://localhost:8080';
const LABEL    = process.argv[2] ?? 'run';
const OUT_DIR  = `scratch/design-update/screenshots/${LABEL}`;
const VIEWPORT = { width: 390, height: 844 };

async function shot(page, name) {
  const path = `${OUT_DIR}/${name}.png`;
  await page.screenshot({ path });
  console.log(`  ✓ ${path}`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();
  await page.setViewportSize(VIEWPORT);

  // ── Fresh start — clear history so history-empty is truly empty ──────────
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('justBreathe:history'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.main-view-card');

  // 1. main — home view, default form state
  await shot(page, 'main');

  // 2. main-custom-duration — Duration dropdown set to "Custom"
  await page.selectOption('select[name="duration"]', 'custom');
  await page.waitForSelector('input[name="customDuration"]:visible');
  await shot(page, 'main-custom-duration');

  // 3. history-empty — navigate to History before any session runs
  await page.click('#tab-history');
  await page.waitForSelector('.history-view');
  await shot(page, 'history-empty');

  // ── Back to home, set up for session screenshots ─────────────────────────
  await page.click('#tab-home');
  await page.waitForSelector('.main-view-card');
  await page.selectOption('select[name="duration"]', '5');

  // 4. countdown — submit form, capture "Starting in 3..."
  await page.click('button[type="submit"]');
  await page.waitForSelector('#stop-btn');
  await page.waitForFunction(() => {
    const el = document.getElementById('breathing-state');
    return el && el.textContent.includes('...');
  }, { timeout: 5000 });
  await shot(page, 'countdown');

  // 5. session-just-started — first breath state after countdown
  await page.waitForFunction(() => {
    const el = document.getElementById('breathing-state');
    return el && el.textContent && !el.textContent.includes('...');
  }, { timeout: 15_000 });
  await shot(page, 'session-just-started');

  // 6. session-in-progress — wait ~45s for ~15% progress bar fill (5-min session)
  await page.waitForTimeout(45_000);
  await shot(page, 'session-in-progress');

  // Stop session (saves one entry to history)
  await page.click('#stop-btn');
  await page.waitForSelector('.main-view-card');

  // 7. history — inject synthetic sessions so timestamps show friendly format.
  //    Replaces whatever was saved by the stopped session above.
  await page.evaluate(() => {
    const sessions = [
      { timestamp: Date.now() - 86_400_000,  inSec: 4.5, outSec: 4.5, duration: 10 },
      { timestamp: Date.now() - 172_800_000, inSec: 4,   outSec: 6,   duration: 5  },
    ];
    localStorage.setItem('justBreathe:history', JSON.stringify(sessions));
  });
  await page.click('#tab-history');
  await page.waitForSelector('.history-list');
  await shot(page, 'history');

  // 8. about
  await page.click('#tab-about');
  await page.waitForSelector('.about-view-card');
  await shot(page, 'about');

  await browser.close();
  console.log(`\nAll 8 screenshots saved to ${OUT_DIR}/`);
}

main().catch(err => { console.error(err); process.exit(1); });

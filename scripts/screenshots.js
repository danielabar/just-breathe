/**
 * Visual regression baseline tool for CSS refactoring.
 *
 * WHY THIS EXISTS:
 * The CSS in this project is being reorganized (see scratch/css-reorg/analysis.md).
 * CSS refactors are risky because small changes can break layout in subtle ways that
 * are hard to catch by reading code alone. This script captures screenshots of every
 * meaningful UI state before and after each refactor phase so we can visually verify
 * nothing broke.
 *
 * HOW TO USE:
 *   npm run dev          (keep the dev server running in a separate terminal)
 *   node scripts/screenshots.js baseline     (before any changes)
 *   node scripts/screenshots.js phase-1      (after each refactor phase)
 *
 * Screenshots are saved to scratch/css-reorg/screenshots/<label>/
 * Compare before/after by asking Claude to read both sets of PNGs.
 *
 * NOTE: This script starts a real breathing session (to populate history) and waits
 * ~60s for the progress bar to show visible fill. The full run takes about 90 seconds.
 * Each run also writes one entry to localStorage history — clear it in the app if needed.
 *
 * WHY PLAYWRIGHT (not MCP):
 * Playwright's own docs recommend the CLI approach over MCP for coding agents — it's
 * more token-efficient and avoids loading large tool schemas into context. We use
 * Playwright here as a plain Node.js script rather than as an MCP server.
 *
 * WHY MOBILE ONLY (375px):
 * This app is mobile-only. There is no desktop layout to test.
 *
 * WHY HEADLESS SPEECH SYNTHESIS CAVEAT:
 * The Web Speech API is unavailable in headless Chromium. session.js detects this and
 * falls back to plain setTimeout for countdown timing, so the ~3s countdown still works
 * correctly — it just runs silently.
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE_URL = 'http://localhost:8080';
const VIEWPORT = { width: 375, height: 812 };
const OUT_DIR = `scratch/css-reorg/screenshots/${process.argv[2] ?? 'run'}`;

/** Save a full-page screenshot of the current page state. */
async function capture(page, name) {
  const file = `${OUT_DIR}/${name}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log('saved', file);
}

async function run() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize(VIEWPORT);

  // Main view — the form with inhale/exhale/duration inputs and Start button.
  await page.goto(BASE_URL);
  await page.waitForSelector('.main-view-card');
  await capture(page, 'main');

  // Main view with custom duration — selecting "Custom" from the duration dropdown
  // reveals a hidden text input for entering an arbitrary minute value.
  await page.selectOption('select[name="duration"]', 'custom');
  await page.waitForSelector('input[name="customDuration"]:visible');
  await capture(page, 'main-custom-duration');

  // History view (empty) — the state before any sessions have been completed.
  // This looks different from the populated history view so both are worth capturing.
  await page.goto(BASE_URL);
  await page.click('#hamburger-btn');
  await page.waitForSelector('.mobile-menu:not([hidden])');
  await page.click('#nav-history');
  await page.waitForSelector('.history-view');
  await page.waitForTimeout(300); // wait for menu slide-out transition (0.22s)
  await capture(page, 'history-empty');

  // About view — static informational content.
  await page.goto(BASE_URL);
  await page.click('#hamburger-btn');
  await page.waitForSelector('.mobile-menu:not([hidden])');
  await page.click('#nav-about');
  await page.waitForSelector('.about-view-card');
  await page.waitForTimeout(300); // wait for menu slide-out transition (0.22s)
  await capture(page, 'about');

  // Mobile menu (open) — the slide-in drawer with Home/History/About buttons.
  // The drawer uses a CSS transform transition (0.22s); we wait for it to fully open.
  await page.goto(BASE_URL);
  await page.click('#hamburger-btn');
  await page.waitForSelector('.mobile-menu:not([hidden])');
  await page.waitForTimeout(300); // wait for menu slide-in transition (0.22s)
  await capture(page, 'menu-open');

  // Countdown state — captured immediately after clicking Start.
  // session.js shows "Starting in 3...", "2...", "1..." in #breathing-state before the
  // session loop begins. The progress bar track is visible but unfilled at this point.
  //
  // We set duration to 5 minutes (the shortest standard option) so that the same wait
  // time produces more visible progress bar fill — 30s at 5min = 10% vs 5% at 10min.
  await page.goto(BASE_URL);
  await page.waitForSelector('.main-view-card');
  await page.selectOption('select[name="duration"]', '5');
  await page.click('button[type="submit"]');
  await page.waitForSelector('#stop-btn');
  await page.waitForFunction(() => {
    const el = document.getElementById('breathing-state');
    return el && el.textContent.includes('...');
  }, { timeout: 5000 });
  await capture(page, 'countdown');

  // Session just started — captured the moment the countdown finishes.
  // The progress bar is visible but essentially empty (0% elapsed time).
  await page.waitForFunction(() => {
    const el = document.getElementById('breathing-state');
    return el && el.textContent && !el.textContent.includes('...');
  }, { timeout: 10000 });
  await capture(page, 'session-just-started');

  // Session in progress — wait ~30s so the progress bar shows visible fill.
  // With a 5-minute session, 30s = ~10% progress, which is clearly visible.
  await page.waitForTimeout(30000);
  await capture(page, 'session-in-progress');

  // Stop the session early — session.js saves to history immediately on stop,
  // so the history view will have an entry even though the session didn't complete.
  await page.click('#stop-btn');

  // History view (populated) — shows session cards with timestamp, inhale/exhale/duration.
  // We navigate via the hamburger menu the same way a real user would.
  await page.waitForSelector('.main-view-card'); // wait for return to main view after stop
  await page.click('#hamburger-btn');
  await page.waitForSelector('.mobile-menu:not([hidden])');
  await page.click('#nav-history');
  await page.waitForSelector('.history-view');
  await page.waitForTimeout(300); // wait for menu slide-out transition (0.22s)
  await capture(page, 'history');

  await browser.close();
}

run().catch(err => { console.error(err); process.exit(1); });

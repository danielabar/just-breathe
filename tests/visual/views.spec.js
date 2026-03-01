import { test, expect } from '@playwright/test';

test('main view', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.main-view-card');
  await expect(page).toHaveScreenshot('main.png');
});

test('main view — custom duration revealed', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('select[name="duration"]', 'custom');
  await page.waitForSelector('input[name="customDuration"]:visible');
  await expect(page).toHaveScreenshot('main-custom-duration.png');
});

test('history view — empty', async ({ page }) => {
  await page.goto('/');
  await page.click('#tab-history');
  await page.waitForSelector('.history-view');
  await expect(page).toHaveScreenshot('history-empty.png');
});

test('about view', async ({ page }) => {
  await page.goto('/');
  await page.click('#tab-about');
  await page.waitForSelector('.about-view-card');
  await expect(page).toHaveScreenshot('about.png');
});

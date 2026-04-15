import { test, expect } from '@playwright/test';

/**
 * Retries: global `retries` in playwright.config.js + optional per-suite override.
 * On failure, Playwright re-runs the test; pair with `trace: 'on-first-retry'`.
 */
test.describe('Per-suite retry override', () => {
  test.describe.configure({ retries: 2 });

  test('stable navigation (demonstrates retry config)', async ({ page }) => {
    await page.goto('/docs/intro');
    await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText('Installation');
  });
});

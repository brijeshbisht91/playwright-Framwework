import '../config/load-env.js';
import { test as base, expect } from '@playwright/test';
import { PlaywrightDocPage } from '../pages/PlaywrightDocPage.js';
import { BASE_URL } from '../config/constants.js';

/**
 * Custom fixtures = dependency injection for tests.
 * - docPage: fresh POM per test
 * - baselineApp: `auto: true` fixture (always runs; test need not list it)
 *
 * Worker-scoped fixtures (interview): use `scope: 'worker'` for expensive
 * one-time-per-worker setup, e.g. DB connection pools or shared auth file.
 */
export const test = base.extend({
  /** POM bound to the test's `page` */
  docPage: async ({ page }, use) => {
    const docPage = new PlaywrightDocPage(page);
    await use(docPage);
  },

  /**
   * Auto fixture: runs before each test that uses the extended `test`.
   * Interview note: `auto: true` fixtures run even if the test does not
   * destructure them — good for consistent baseline (cookies, locale).
   */
  baselineApp: [
    async ({ page }, use) => {
      await page.context().setExtraHTTPHeaders({
        'x-demo-framework': 'playwright-interview',
      });
      await use(undefined);
    },
    { auto: true },
  ],
});

export { expect };

/** Typed-ish helper for specs that need raw baseURL */
export function resolveUrl(path) {
  const base = BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

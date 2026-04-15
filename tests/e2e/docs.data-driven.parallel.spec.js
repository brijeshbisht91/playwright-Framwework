import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '../../fixtures/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, '../../data/docs-routes.json');

/** @type {Array<{ id: string; path: string; expectedHeading: string }>} */
const scenarios = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

/**
 * Data-driven + parallelization:
 * - Rows come from JSON (also common: CSV, DB, env matrix).
 * - `describe.configure({ mode: 'parallel' })` runs independent rows concurrently.
 */
test.describe('Docs routes (data-driven, parallel)', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const scenario of scenarios) {
    test(`[${scenario.id}] opens and shows heading`, async ({ page, docPage }) => {
      await docPage.goto(scenario.path);
      await expect(page).toHaveURL(new RegExp(`${escapeRe(scenario.path)}`));
      await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(
        scenario.expectedHeading,
      );
    });
  }
});

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

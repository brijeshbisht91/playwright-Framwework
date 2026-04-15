import { epic, feature, story } from 'allure-js-commons';
import { test, expect } from '../../fixtures/index.js';

test.describe('Allure metadata', () => {
  test('labels appear in Allure report', async ({ page }) => {
    await epic('Interview Framework');
    await feature('Reporting');
    await story('Allure integration');

    await page.goto('/docs/intro');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });
});

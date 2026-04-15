import { test, expect } from '../../fixtures/index.js';

/**
 * Custom fixtures (`docPage`, auto `baselineApp`) + POM.
 * Interview: fixtures compose dependencies; POM hides selectors/DOM.
 */
test.describe('Fixtures + POM', () => {
  test('docPage opens home', async ({ docPage }) => {
    await docPage.openHome();
    await expect(docPage.page).toHaveTitle(/Playwright/);
  });

  test('POM navigates to docs intro', async ({ docPage }) => {
    await docPage.openDocsIntro();
    await docPage.expectHeadingContains('Installation');
  });
});

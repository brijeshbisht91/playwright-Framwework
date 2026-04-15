import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * Page Object for playwright.dev — stable target for demos / CI.
 */
export class PlaywrightDocPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async openHome() {
    await this.goto('/');
  }

  async openDocsIntro() {
    await this.goto('/docs/intro');
  }

  async expectHeadingContains(text) {
    const h1 = this.page.getByRole('heading', { level: 1 }).first();
    await h1.waitFor({ state: 'visible' });
    await expect(h1).toContainText(text);
  }
}

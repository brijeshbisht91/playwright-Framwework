import { DEFAULT_TIMEOUT } from '../config/constants.js';

/**
 * Base POM: shared navigation + common waits/locators.
 */
export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async goto(path = '/', options = {}) {
    await this.page.goto(path, {
      waitUntil: 'domcontentloaded',
      timeout: DEFAULT_TIMEOUT,
      ...options,
    });
  }
}

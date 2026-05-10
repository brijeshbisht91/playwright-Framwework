import { expect } from '@playwright/test';
import { SAUCE_DEMO_URL } from '../../config/constants.js';

/**
 * Sauce Demo login — https://www.saucedemo.com/
 */
export class SauceLoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.username = page.locator('#user-name');
    this.password = page.locator('#password');
    this.loginButton = page.locator('#login-button');
    this.errorBanner = page.locator('[data-test="error"]');
    this.errorContainer = page.locator('.error-message-container');
  }

  async open() {
    await this.page.goto(SAUCE_DEMO_URL, { waitUntil: 'domcontentloaded' });
  }

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(/saucedemo\.com\/?$/);
    await expect(this.loginButton).toBeVisible();
  }

  async login(username, password) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async expectErrorContains(text) {
    await expect(this.errorBanner).toContainText(text);
  }

  async expectErrorBannerBackgroundColor(expectedRgb) {
    // On SauceDemo, the error message is an <h3> with transparent background;
    // the visible background is on the container.
    await expect(this.errorContainer).toHaveCSS('background-color', expectedRgb);
  }
}

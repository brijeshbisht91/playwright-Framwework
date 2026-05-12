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

  // --- Actions ---

  async open() {
    await this.page.goto(SAUCE_DEMO_URL, { waitUntil: 'domcontentloaded' });
  }

  async login(username, password) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  /**
   * Fills credentials, clicks login, and waits for the inventory URL. Uses Promise.all so the
   * navigation clock starts with the click. A small `inventoryNavigationTimeoutMs` will fail for
   * `performance_glitch_user` if the app responds slower than that budget (unlike calling
   * `waitForURL` only after `login()`, when navigation has often already finished).
   *
   * @param {string} username
   * @param {string} password
   * @param {number} inventoryNavigationTimeoutMs
   */
  async submitAndWaitForInventory(username, password, inventoryNavigationTimeoutMs) {
    await this.username.fill(username);
    await this.password.fill(password);
    await Promise.all([
      this.page.waitForURL(/inventory\.html/, { timeout: inventoryNavigationTimeoutMs }),
      this.loginButton.click(),
    ]);
  }

  // --- Assertions ---

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(/saucedemo\.com\/?$/);
    await expect(this.loginButton).toBeVisible();
  }

  async expectErrorContains(text) {
    await expect(this.errorBanner).toContainText(text);
  }

  async expectErrorBannerBackgroundColor(expectedRgb) {
    await expect(this.errorContainer).toHaveCSS('background-color', expectedRgb);
  }
}

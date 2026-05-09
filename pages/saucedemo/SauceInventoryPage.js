import { expect } from '@playwright/test';

export class SauceInventoryPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('.inventory_item');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.title).toHaveText('Products');
  }

  /**
   * @param {string} productName e.g. "Sauce Labs Backpack"
   */
  async addToCartByProductName(productName) {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.getByRole('button', { name: 'Add to cart' }).click();
  }

  async expectCartBadgeCount(count) {
    await expect(this.cartBadge).toHaveText(String(count));
  }
}

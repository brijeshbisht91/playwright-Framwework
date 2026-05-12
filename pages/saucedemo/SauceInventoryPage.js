import { expect } from '@playwright/test';

export class SauceInventoryPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('.inventory_item');
    /** Chain from `inventoryItems.nth(i)` or `.filter(...)`. */
    this.itemRowPrice = '[data-test="inventory-item-price"]';
    this.itemRowName = '[data-test="inventory-item-name"]';
    this.itemRowImg = 'img.inventory_item_img';
    this.itemRowImgLink = '[data-test$="-img-link"]';
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.filterContainer = page.locator('[data-test="product-sort-container"]');
    this.burgerButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.resetAppStateLink = page.locator('#reset_sidebar_link');
    this.linkAnchors = page.locator('a[href]');
    /** inventory-item.html */
    this.detailItemPrice = page.locator('[data-test="inventory-item-price"]');
    this.detailItemImage = page.locator('img.inventory_details_img');
  }

  // --- Actions ---

  async filter(text) {
    switch (text) {
      case 'Price (low to high)':
        await this.filterContainer.selectOption('lohi');
        break;
      case 'Price (high to low)':
        await this.filterContainer.selectOption('hilo');
        break;
      case 'Name (A to Z)':
        await this.filterContainer.selectOption('az');
        break;
      case 'Name (Z to A)':
        await this.filterContainer.selectOption('za');
        break;
      default:
        throw new Error(`Unsupported filter option: ${text}`);
    }
  }

  /**
   * @param {string} productName e.g. "Sauce Labs Backpack"
   */
  async addToCartByProductName(productName) {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.getByRole('button', { name: 'Add to cart' }).click();
  }

  async addToCartByProducts(productNames) {
    for (const name of productNames) {
      await this.addToCartByProductName(name);
    }
  }

  /**
   * Clicks Remove on the inventory list row (not the cart page).
   * @param {string} productName e.g. "Sauce Labs Backpack"
   */
  async removeFromCartOnInventoryListing(productName) {
    const row = this.inventoryItems.filter({ hasText: productName });
    await row.getByRole('button', { name: 'Remove' }).click();
  }

  async logout() {
    await this.burgerButton.click();
    await this.logoutLink.click();
  }

  async resetAppState() {
    await this.burgerButton.click();
    await this.resetAppStateLink.click();
  }

  /**
   * Opens inventory-item from the list by clicking the row image link (not the title).
   * @param {string} productName e.g. "Sauce Labs Backpack"
   * @returns {Promise<{ listPrice: string, listImgSrc: string }>}
   */
  async openProductDetailByClickingProductImage(productName) {
    const row = this.inventoryItems.filter({ hasText: productName });
    await expect(row).toBeVisible();
    const listPrice =
      (await row.locator(this.itemRowPrice).textContent())?.trim() ?? '';
    const listImgSrc = (await row.locator(this.itemRowImg).getAttribute('src')) ?? '';
    await row.locator(this.itemRowImgLink).click();
    await expect(this.page).toHaveURL(/inventory-item\.html/);
    return { listPrice, listImgSrc };
  }

  // --- Assertions ---

  async verifyDataAccordingToFilter(text) {
    if (text === 'Price (low to high)') {
      const prices = [];
      const count = await this.inventoryItems.count();
      for (let i = 0; i < count; i++) {
        const item = this.inventoryItems.nth(i);
        const priceText = await item.locator(this.itemRowPrice).textContent();
        const price = parseFloat(priceText.replace('$', ''));
        prices.push(price);
      }
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    } else if (text === 'Price (high to low)') {
      const prices = [];
      const count = await this.inventoryItems.count();
      for (let i = 0; i < count; i++) {
        const item = this.inventoryItems.nth(i);
        const priceText = await item.locator(this.itemRowPrice).textContent();
        const price = parseFloat(priceText.replace('$', ''));
        prices.push(price);
      }
      const sortedPrices = [...prices].sort((a, b) => b - a);
      expect(prices).toEqual(sortedPrices);
    } else if (text === 'Name (A to Z)') {
      const names = [];
      const count = await this.inventoryItems.count();
      for (let i = 0; i < count; i++) {
        const item = this.inventoryItems.nth(i);
        const name = await item.locator(this.itemRowName).textContent();
        names.push(name.trim());
      }
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    } else if (text === 'Name (Z to A)') {
      const names = [];
      const count = await this.inventoryItems.count();
      for (let i = 0; i < count; i++) {
        const item = this.inventoryItems.nth(i);
        const name = await item.locator(this.itemRowName).textContent();
        names.push(name.trim());
      }
      const sortedNames = [...names].sort().reverse();
      expect(names).toEqual(sortedNames);
    }
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.title).toHaveText('Products');
  }

  /**
   * Same-origin `<a href>` only: each URL is checked with the page's APIRequestContext (GET), no new tabs,
   * no per-host branching (e.g. blogspot vs browser). Skips `#`, `mailto:`, `javascript:`.
   */
  async expectSameOriginInventoryLinksReachable() {
    const pageUrl = this.page.url();
    const origin = new URL(pageUrl).origin;

    const hrefs = await this.linkAnchors.evaluateAll((anchors) =>
      anchors.map((a) => a.getAttribute('href')).filter(Boolean),
    );

    const unique = new Set(
      hrefs
        .filter((h) => !h.startsWith('#'))
        .filter((h) => !h.startsWith('mailto:'))
        .filter((h) => !h.startsWith('javascript:'))
        .map((h) => new URL(h, pageUrl).href)
        .filter((abs) => {
          try {
            return new URL(abs).origin === origin;
          } catch {
            return false;
          }
        }),
    );

    if (unique.size === 0) return;

    const { request } = this.page;
    const results = await Promise.all(
      [...unique].map(async (url) => {
        const res = await request.get(url);
        return { url, ok: res.ok(), status: res.status(), statusText: res.statusText() };
      }),
    );

    const broken = results.filter((r) => !r.ok);
    if (broken.length > 0) {
      throw new Error(
        `Broken same-origin link(s):\n${broken.map((b) => `  ${b.url} -> ${b.status} ${b.statusText}`).join('\n')}`,
      );
    }
  }

  /**
   * error_user: remove can fail client-side while cart still shows one item.
   * @param {string} productName
   * @param {number} expectedBadgeCount
   */
  async expectProductStillInCartOnInventory(productName, expectedBadgeCount) {
    const row = this.inventoryItems.filter({ hasText: productName });
    await expect(row.getByRole('button', { name: 'Remove' })).toBeVisible();
    await expect(this.cartBadge).toHaveText(String(expectedBadgeCount));
  }

  async expectCartBadgeCount(count) {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async expectCartBadgeNotVisible() {
    await expect(this.cartBadge).toHaveCount(0);
  }

  /**
   * On inventory-item.html: assert detail disagrees with the captured list row (problem_user glitch).
   * @param {{ listPrice: string, listImgSrc: string }} listing
   */
  async expectItemDetailMismatchVersusListing(listing) {
    const detailPrice = (await this.detailItemPrice.textContent())?.trim() ?? '';
    const detailImgSrc = (await this.detailItemImage.getAttribute('src')) ?? '';

    expect(
      detailPrice,
      `detail price should differ from list price (${listing.listPrice}) for problem_user`,
    ).not.toBe(listing.listPrice);

    expect(
      detailImgSrc,
      'detail image src should differ from list row image for problem_user',
    ).not.toBe(listing.listImgSrc);
  }
}

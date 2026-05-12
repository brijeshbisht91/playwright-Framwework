import { expect } from '@playwright/test';

/** Cart + checkout flow (single module to keep interview scope small). */
export class SauceCartCheckoutPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartLineItems = page.locator('.cart_item');
    /** Use under each `.cart_item` row (cart + checkout overview). */
    this.cartLineItemPrice = '.inventory_item_price';
    this.checkoutButton = page.locator('#checkout');
    this.firstNameInput = page.locator('#first-name');
    this.lastNameInput = page.locator('#last-name');
    this.postalCodeInput = page.locator('#postal-code');
    this.continueButton = page.locator('#continue');
    this.finishButton = page.locator('#finish');
    this.errorBanner = page.locator('[data-test="error"]');
    this.completeHeader = page.locator('.complete-header');
    this.itemTotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
  }

  // --- Actions ---

  async openCart() {
    await this.cartLink.click();
  }

  async startCheckout() {
    await this.checkoutButton.click();
  }

  async fillShipping(firstName, lastName, postalCode) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  /**
   * @param {string} productName e.g. "Sauce Labs Backpack" → data-test remove-sauce-labs-backpack
   */
  removeButtonForProduct(productName) {
    const slug = productName.toLowerCase().replaceAll(/\s+/g, '-');
    return this.page.locator(`[data-test="remove-${slug}"]`);
  }

  async removeProductFromCartByName(productName) {
    await this.removeButtonForProduct(productName).click();
  }

  async cartLineItemCount() {
    return this.cartLineItems.count();
  }

  async finishOrder() {
    await this.finishButton.click();
  }

  // --- Assertions ---

  async expectOnCartPage() {
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  async expectOnCheckoutStepTwo() {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
  }

  async expectOverviewTotalsCorrect() {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);

    const count = await this.cartLineItems.count();
    if (count === 0) {
      throw new Error('No items found on checkout overview.');
    }

    const prices = [];
    for (let i = 0; i < count; i++) {
      const priceText = await this.cartLineItems
        .nth(i)
        .locator(this.cartLineItemPrice)
        .textContent();

      prices.push(Number.parseFloat(priceText.replace('$', '')));
    }

    const expectedItemTotal = prices.reduce((a, b) => a + b, 0);

    const itemTotalText = await this.itemTotalLabel.textContent();
    const taxText = await this.taxLabel.textContent();
    const totalText = await this.totalLabel.textContent();

    const itemTotal = Number.parseFloat(itemTotalText.replace(/[^\d.]/g, ''));
    const tax = Number.parseFloat(taxText.replace(/[^\d.]/g, ''));
    const total = Number.parseFloat(totalText.replace(/[^\d.]/g, ''));

    expect(itemTotal).toBeCloseTo(expectedItemTotal, 2);
    expect(total).toBeCloseTo(itemTotal + tax, 2);
  }

  async expectErrorContains(text) {
    await expect(this.errorBanner).toContainText(text);
  }

  async expectOrderComplete() {
    await expect(this.completeHeader).toContainText('Thank you for your order!');
  }
}

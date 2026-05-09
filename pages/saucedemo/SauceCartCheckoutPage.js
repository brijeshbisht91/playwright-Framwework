import { expect } from '@playwright/test';

/** Cart + checkout flow (single module to keep interview scope small). */
export class SauceCartCheckoutPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.cartLink = page.locator('.shopping_cart_link');
    this.checkoutButton = page.locator('#checkout');
    this.firstNameInput = page.locator('#first-name');
    this.lastNameInput = page.locator('#last-name');
    this.postalCodeInput = page.locator('#postal-code');
    this.continueButton = page.locator('#continue');
    this.finishButton = page.locator('#finish');
    this.completeHeader = page.locator('.complete-header');
  }

  async openCart() {
    await this.cartLink.click();
  }

  async expectOnCartPage() {
    await expect(this.page).toHaveURL(/cart\.html/);
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

  async finishOrder() {
    await this.finishButton.click();
  }

  async expectOrderComplete() {
    await expect(this.completeHeader).toContainText('Thank you for your order!');
  }
}

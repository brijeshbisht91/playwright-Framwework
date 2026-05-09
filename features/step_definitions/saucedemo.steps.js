import { Given, When, Then } from '@cucumber/cucumber';
import { SauceLoginPage } from '../../pages/saucedemo/SauceLoginPage.js';
import { SauceInventoryPage } from '../../pages/saucedemo/SauceInventoryPage.js';
import { SauceCartCheckoutPage } from '../../pages/saucedemo/SauceCartCheckoutPage.js';

Given('I open the Sauce Demo login page', async function () {
  const login = new SauceLoginPage(this.page);
  await login.open();
});

When(
  'I log in with username {string} and password {string}',
  async function (username, password) {
    const login = new SauceLoginPage(this.page);
    await login.login(username, password);
  },
);

Then('I should see the inventory page', async function () {
  const inventory = new SauceInventoryPage(this.page);
  await inventory.expectLoaded();
});

Then('I should see a login error containing {string}', async function (fragment) {
  const login = new SauceLoginPage(this.page);
  await login.expectErrorContains(fragment);
});

When('I add the product {string} to the cart', async function (productName) {
  const inventory = new SauceInventoryPage(this.page);
  await inventory.addToCartByProductName(productName);
});

Then('the cart should show badge count {int}', async function (count) {
  const inventory = new SauceInventoryPage(this.page);
  await inventory.expectCartBadgeCount(count);
});

When('I open the shopping cart', async function () {
  const cart = new SauceCartCheckoutPage(this.page);
  await cart.openCart();
  await cart.expectOnCartPage();
});

When('I start checkout', async function () {
  const cart = new SauceCartCheckoutPage(this.page);
  await cart.startCheckout();
});

When(
  'I enter shipping {string} {string} {string}',
  async function (firstName, lastName, postalCode) {
    const cart = new SauceCartCheckoutPage(this.page);
    await cart.fillShipping(firstName, lastName, postalCode);
  },
);

When('I finish the order', async function () {
  const cart = new SauceCartCheckoutPage(this.page);
  await cart.finishOrder();
});

Then('I should see the order confirmation', async function () {
  const cart = new SauceCartCheckoutPage(this.page);
  await cart.expectOrderComplete();
});

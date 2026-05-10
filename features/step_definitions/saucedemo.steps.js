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

Then(
  'the login error banner background color should be {string}',
  async function (expectedRgb) {
    const login = new SauceLoginPage(this.page);
    await login.expectErrorBannerBackgroundColor(expectedRgb);
  },
);

When('I add the product {string} to the cart', async function (productName) {
  const inventory = new SauceInventoryPage(this.page);
  await inventory.addToCartByProductName(productName);
});

When('I add these products to the cart:', async function (dataTable) {
  const inventory = new SauceInventoryPage(this.page);
  const products = dataTable
    .hashes()
    .map((row) => row.product)
    .filter(Boolean);
  await inventory.addToCartByProducts(products);
});

Then('the cart should show badge count {int}', async function (count) {
  const inventory = new SauceInventoryPage(this.page);
  await inventory.expectCartBadgeCount(count);
});

Then('the cart badge should not be visible', async function () {
  const inventory = new SauceInventoryPage(this.page);
  await inventory.expectCartBadgeNotVisible();
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

Then('the checkout overview totals should be correct', async function () {
  const cart = new SauceCartCheckoutPage(this.page);
  await cart.expectOverviewTotalsCorrect();
});

Then('I filter the products by {string}', async function (filter) {
  const inventory = new SauceInventoryPage(this.page);

  await inventory.filter(filter);
  
  await inventory.verifyDataAccordingToFilter(filter);
});

When('I logout from the application', async function () {
  const inventory = new SauceInventoryPage(this.page);
  await inventory.logout();
});

When('I reset the app state', async function () {
  const inventory = new SauceInventoryPage(this.page);
  await inventory.resetAppState();
});

Then('I should be on the login page', async function () {
  const login = new SauceLoginPage(this.page);
  await login.expectOnLoginPage();
});

Then('all links on the inventory page should be reachable', async function () {
  const inventoryUrl = this.page.url();

  const hrefs = await this.page.locator('a[href]').evaluateAll((anchors) =>
    anchors.map((a) => a.getAttribute('href')).filter(Boolean),
  );

  const urls = hrefs
    .filter((href) => !href.startsWith('#'))
    .filter((href) => !href.startsWith('mailto:'))
    .filter((href) => !href.startsWith('javascript:'))
    .map((href) => new URL(href, inventoryUrl))
    // Keep to same-origin to avoid external network flakiness
    .filter((u) => u.origin === new URL(inventoryUrl).origin);

  const unique = Array.from(new Set(urls.map((u) => u.toString())));
  if (unique.length === 0) return;

  for (const url of unique) {
    const res = await this.page.request.get(url);
    if (!res.ok()) {
      throw new Error(`Broken link: ${url} -> ${res.status()} ${res.statusText()}`);
    }
  }
});
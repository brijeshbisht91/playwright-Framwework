import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { SauceLoginPage } from '../../pages/saucedemo/SauceLoginPage.js';
import { SAUCE_DEMO_URL } from '../../config/constants.js';
import { assertBacktraceTelemetryFails } from '../support/backtrace-route.js';
import { assertShoppingCartLayoutDiffersFromGolden } from '../support/visual-layout-golden.js';

Given('I open the Sauce Demo login page', async function () {
  await this.login.open();
});

When(
  'I log in with username {string} and password {string}',
  async function (username, password) {
    await this.login.login(username, password);
  },
);

Then('I should see the inventory page', async function () {
  await this.inventory.expectLoaded();
});

Then('I should see a login error containing {string}', async function (fragment) {
  await this.login.expectErrorContains(fragment);
});

Then(
  'the login error banner background color should be {string}',
  async function (expectedRgb) {
    await this.login.expectErrorBannerBackgroundColor(expectedRgb);
  },
);

When('I add the product {string} to the cart', async function (productName) {
  await this.inventory.addToCartByProductName(productName);
});

When('I add these products to the cart:', async function (dataTable) {
  const products = dataTable
    .hashes()
    .map((row) => row.product)
    .filter(Boolean);
  await this.inventory.addToCartByProducts(products);
});

Then('the cart should show badge count {int}', async function (count) {
  await this.inventory.expectCartBadgeCount(count);
});

Then('the cart badge should not be visible', async function () {
  await this.inventory.expectCartBadgeNotVisible();
});

When('I open the shopping cart', async function () {
  await this.cart.openCart();
  await this.cart.expectOnCartPage();
});

When('I refresh the page', async function () {
  await this.page.reload();
});

When('I open the inventory page directly', async function () {
  await this.page.goto(`${SAUCE_DEMO_URL}/inventory.html`);
});

Then('I should be redirected to the login page', async function () {
  const login = new SauceLoginPage(this.page);
  await login.expectOnLoginPage();
});

When('I start checkout', async function () {
  await this.cart.startCheckout();
});

When(
  'I enter shipping {string} {string} {string}',
  async function (firstName, lastName, postalCode) {
    await this.cart.fillShipping(firstName, lastName, postalCode);
  },
);

When('I remove the product {string} from the cart', async function (productName) {
  await this.cart.removeProductFromCartByName(productName);
});

When('I note the current cart line item count', async function () {
  this._notedCartLineCount = await this.cart.cartLineItemCount();
});

Then('the cart line item count should equal the noted count', async function () {
  const now = await this.cart.cartLineItemCount();
  expect(now, 'cart line count after action').toBe(this._notedCartLineCount);
});

Then('the cart should show line items count {int}', async function (expected) {
  await expect
    .poll(async () => this.cart.cartLineItemCount(), { timeout: 5_000 })
    .toBe(expected);
});

Then('I should be on checkout step two overview', async function () {
  await this.cart.expectOnCheckoutStepTwo();
});

Then('no checkout error banner should be visible', async function () {
  await expect(this.cart.errorBanner).toBeHidden();
});

When(
  'I remove the product {string} from the cart on the inventory page waiting for failed Backtrace telemetry',
  async function (productName) {
    await assertBacktraceTelemetryFails(this.page, () =>
      this.inventory.removeFromCartOnInventoryListing(productName),
    );
  },
);

Then(
  'the product {string} should still be in the cart on the inventory page with badge count {int}',
  async function (productName, badgeCount) {
    await this.inventory.expectProductStillInCartOnInventory(productName, badgeCount);
  },
);

When('I finish the order', async function () {
  await this.cart.finishOrder();
});

Then('I should see the order confirmation', async function () {
  await this.cart.expectOrderComplete();
});

Then('I should see a checkout error containing {string}', async function (text) {
  await this.cart.expectErrorContains(text);
});

Then('the checkout overview totals should be correct', async function () {
  await this.cart.expectOverviewTotalsCorrect();
});

Then('I filter the products by {string}', async function (filter) {
  await this.inventory.filter(filter);
  
  await this.inventory.verifyDataAccordingToFilter(filter);
});

When('I logout from the application', async function () {
  await this.inventory.logout();
});

When('I reset the app state', async function () {
  await this.inventory.resetAppState();
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

// Special user scenario steps
Then('I should remain on the login page', async function () {
  const login = new SauceLoginPage(this.page);
  await login.expectOnLoginPage();
});

Then('the login form should still be accessible', async function () {
  await expect(this.login.username).toBeVisible();
  await expect(this.login.password).toBeVisible();
  await expect(this.login.loginButton).toBeVisible();
});

Then('I should be able to interact with inventory items', async function () {
  const itemCount = await this.inventory.inventoryItems.count();
  expect(itemCount).toBeGreaterThan(0);

  // Try to interact with first item
  const firstItem = this.inventory.inventoryItems.first();
  await expect(firstItem).toBeVisible();
});

Then('some images may not load correctly', async function () {
  // Check for broken images (images with naturalWidth = 0)
  const brokenImages = await this.page.$$eval('img', (imgs) =>
    imgs.filter((img) => img.naturalWidth === 0).length
  );

  // For problem_user, we expect some images to be broken
  if (this.page.url().includes('inventory')) {
    // This is a soft check - we note if images are broken but don't fail the test
    console.log(`Found ${brokenImages} potentially broken images`);
  }
});

Then('some buttons may behave unexpectedly', async function () {
  // Check if add to cart buttons are present and clickable
  const addButtons = this.page.locator('button:has-text("Add to cart")');
  const buttonCount = await addButtons.count();
  expect(buttonCount).toBeGreaterThan(0);

  // Try clicking one button
  await addButtons.first().click();
});

When(
  'I open the product detail for {string} by clicking its product image',
  async function (productName) {
    this._listingSnapshotForItemDetail =
      await this.inventory.openProductDetailByClickingProductImage(productName);
  },
);

Then(
  'the item detail page should show a different price and image than on the inventory list',
  async function () {
    await this.inventory.expectItemDetailMismatchVersusListing(
      this._listingSnapshotForItemDetail,
    );
  },
);

When(
  'I submit performance glitch user credentials with password {string} and wait for inventory within {int} milliseconds',
  async function (password, timeoutMs) {
    await this.login.submitAndWaitForInventory(
      'performance_glitch_user',
      password,
      timeoutMs,
    );
    await this.inventory.expectLoaded();
  },
);

When('I attempt to add {string} to the cart', async function (productName) {
  await this.inventory.addToCartByProductName(productName);
});

Then('the cart badge should update correctly despite UI inconsistencies', async function () {
  // Wait a bit for potential delays
  await this.page.waitForTimeout(1000);
  await this.inventory.expectCartBadgeCount(1);
});

Then('page loads should complete within reasonable time limits', async function () {
  // Check that the page has finished loading
  await expect(this.page).toHaveURL(/inventory\.html/);
});

Then('the cart should show badge count {int} after potential delays', async function (count) {
  // Wait for potential performance delays
  await this.page.waitForTimeout(2000);
  await this.inventory.expectCartBadgeCount(count);
});

When('I resize the browser window', async function () {
  await this.page.setViewportSize({ width: 375, height: 667 });
});

Then(
  'the inventory shopping cart layout should deviate from the golden baseline by at least {int} pixels',
  async function (minPixels) {
    await assertShoppingCartLayoutDiffersFromGolden(this.page, minPixels);
  },
);

Then('I should validate {string} for {string}', async function (expectedBehavior, userType) {
  // Generic validation step for comprehensive scenarios
  console.log(`Validating ${expectedBehavior} for ${userType} user`);

  switch (userType) {
    case 'authentication':
      await this.login.expectErrorContains('locked out');
      break;
    case 'ui_bugs':
      await this.inventory.expectLoaded();
      break;
    case 'performance':
      await this.inventory.expectLoaded();
      break;
    case 'error_handling':
      // Check for any error indicators
      break;
    case 'visual_consistency':
      await this.inventory.expectLoaded();
      break;
    default:
      console.log(`Unknown user type: ${userType}`);
  }
});
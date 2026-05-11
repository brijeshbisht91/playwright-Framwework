import '../../config/load-env.js';
import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { chromium, firefox, webkit } from '@playwright/test';
import { SauceLoginPage } from '../../pages/saucedemo/SauceLoginPage.js';
import { SauceInventoryPage } from '../../pages/saucedemo/SauceInventoryPage.js';
import { SauceCartCheckoutPage } from '../../pages/saucedemo/SauceCartCheckoutPage.js';

setDefaultTimeout(60_000);

Before(async function ({ pickle }) {
  console.log(`▶ Starting scenario: ${pickle.name}`);
});

After(async function ({ pickle, result }) {
  const status = result?.status ?? 'UNKNOWN';
  console.log(`◀ Finished scenario: ${pickle.name} - ${status}`);

  if (result?.status === 'FAILED') {
    console.error(`\n❌ Scenario failed: ${pickle.name}`);

    // Print message if available
    if (result?.message) {
      console.error('\n===== ERROR MESSAGE =====');
      console.error(result.message);
    }

    // Print stack trace if available
    if (result?.exception?.stack) {
      console.error('\n===== STACK TRACE =====');
      console.error(result.exception.stack);
    }
  }
});

/** @type {import('@playwright/test').Browser | null} */
let browser = null;

BeforeAll(async function () {
  const headed =
    process.env.HEADED === '1' ||
    process.env.HEADED === 'true';

  const browserType = process.env.BROWSER || 'chromium';

  switch (browserType) {
    case 'firefox':
      browser = await firefox.launch({
        headless: !headed
      });
      break;
    case 'webkit':
      browser = await webkit.launch({
        headless: !headed
      });
      break;
    default:
      browser = await chromium.launch({
        headless: !headed
      });
  }
});

AfterAll(async function () {
  await browser?.close();
  browser = null;
});

Before(async function () {
  console.log(`Running on process: ${process.pid}`);

  if (!browser) {
    throw new Error('Browser not started — BeforeAll failed?');
  }

  const viewportWidth = Number(process.env.VIEWPORT_WIDTH ?? 0);
  const viewportHeight = Number(process.env.VIEWPORT_HEIGHT ?? 0);
  const contextOptions = {};

  if (viewportWidth > 0 || viewportHeight > 0) {
    contextOptions.viewport = {
      width: viewportWidth > 0 ? viewportWidth : 1280,
      height: viewportHeight > 0 ? viewportHeight : 720,
    };
    console.log(
      `Using viewport: ${contextOptions.viewport.width}x${contextOptions.viewport.height}`
    );
  }

  this.context = await browser.newContext(contextOptions);
  this.page = await this.context.newPage();

  // Initialize page objects
  this.login = new SauceLoginPage(this.page);
  this.inventory = new SauceInventoryPage(this.page);
  this.cart = new SauceCartCheckoutPage(this.page);
});

After(async function (scenario) {
  console.log('Scenario Status:', scenario.result?.status);

  if (scenario.result?.status === 'FAILED') {
    const screenshot = await this.page.screenshot({
      type: 'png',
      fullPage: true,
    });

    await this.attach(screenshot, 'image/png');
  }

  await this.page?.close();
  await this.context?.close();
});
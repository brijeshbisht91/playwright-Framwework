import '../../config/load-env.js';
import {
  After,
  AfterAll,
  AfterStep,
  Before,
  BeforeAll,
  BeforeStep,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { chromium, firefox, webkit } from '@playwright/test';

setDefaultTimeout(60_000);

/** Set `STEP_LOG=0` to disable per-step console output */
function stepLogsEnabled() {
  return process.env.STEP_LOG !== '0';
}

BeforeStep(function ({ pickleStep, pickle }) {
  if (!stepLogsEnabled()) return;
  const scenario = pickle?.name ? `[${pickle.name}] ` : '';
  console.log(`${scenario}▶ ${pickleStep.text}`);
});

AfterStep(function ({ pickleStep, pickle, result }) {
  if (!stepLogsEnabled()) return;
  const scenario = pickle?.name ? `[${pickle.name}] ` : '';
  const status = result?.status ?? 'UNKNOWN';
  console.log(`${scenario}← ${status}  ${pickleStep.text}`);
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
  if (!browser) {
    throw new Error('Browser not started — BeforeAll failed?');
  }
  this.context = await browser.newContext();
  this.page = await this.context.newPage();
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
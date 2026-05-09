import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { chromium } from '@playwright/test';

setDefaultTimeout(60_000);

/** @type {import('@playwright/test').Browser | null} */
let browser = null;

BeforeAll(async function () {
  const headed = process.env.HEADED === '1' || process.env.HEADED === 'true';
  browser = await chromium.launch({ headless: !headed });
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

After(async function () {
  await this.page?.close().catch(() => {});
  await this.context?.close().catch(() => {});
});

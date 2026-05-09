/**
 * Shared config for Cucumber + Playwright step definitions.
 */
export const DEFAULT_TIMEOUT = Number(process.env.DEFAULT_TIMEOUT ?? 15_000);

/** Application under test — https://www.saucedemo.com/ */
export const SAUCE_DEMO_URL = process.env.SAUCE_DEMO_URL ?? 'https://www.saucedemo.com';
export const SAUCE_STANDARD_PASSWORD =
  process.env.SAUCE_STANDARD_PASSWORD ?? 'secret_sauce';

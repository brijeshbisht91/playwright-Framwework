// @ts-check
import './config/load-env.js';
import { defineConfig, devices } from '@playwright/test';
import { BASE_URL } from './config/constants.js';

const isCI = Boolean(process.env.CI);

/**
 * @see https://playwright.dev/docs/test-configuration
 *
 * Interview map:
 * - Parallel: `fullyParallel`, `workers`, optional `--shard=i/n` in CI
 * - Retry: `retries` + `trace: 'on-first-retry'`
 * - Hooks: `globalSetup` / `globalTeardown`, fixtures with `auto: true`
 * - Reporting: list + html + allure-playwright
 */
export default defineConfig({
  testDir: './tests',
  globalSetup: './support/global-setup.js',
  globalTeardown: './support/global-teardown.js',

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  /** CI: use multiple workers when not sharding; tune per runner size */
  workers: isCI ? Number(process.env.PW_WORKERS ?? 2) : undefined,

  timeout: 60_000,
  expect: { timeout: 15_000 },

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['allure-playwright'],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

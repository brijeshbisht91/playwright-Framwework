/**
 * Central place for URLs and timeouts — interview talking point:
 * single source of truth, easy env overrides.
 */
export const BASE_URL = process.env.BASE_URL ?? 'https://playwright.dev';
export const DEFAULT_TIMEOUT = Number(process.env.DEFAULT_TIMEOUT ?? 15_000);

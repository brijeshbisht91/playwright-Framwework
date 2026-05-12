import { expect } from '@playwright/test';

/** @param {import('@playwright/test').Response} res */
function isBacktraceSubmitPost(res) {
  const req = res.request();
  return (
    req.method() === 'POST' &&
    /backtrace\.io/i.test(res.url()) &&
    /\/submit/i.test(res.url())
  );
}

/**
 * Runs `action()` in parallel with waiting for the first Backtrace `…/submit…` POST,
 * then asserts status is in `[min, 599]` (`min` = `MIN_BACKTRACE_TELEMETRY_FAILURE_STATUS` or 400; use 500 for strict 5xx only).
 *
 * @param {import('@playwright/test').Page} page
 * @param {() => Promise<void>} action
 */
export async function assertBacktraceTelemetryFails(page, action) {
  const min = Number(process.env.MIN_BACKTRACE_TELEMETRY_FAILURE_STATUS ?? 400);
  const [res] = await Promise.all([
    page.waitForResponse(isBacktraceSubmitPost, { timeout: 45_000 }),
    action(),
  ]);
  expect(res.status(), res.url()).toBeGreaterThanOrEqual(min);
  expect(res.status()).toBeLessThanOrEqual(599);
}

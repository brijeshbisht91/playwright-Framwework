/**
 * Runs once after all tests (per worker batch in distributed setups).
 * Use for: cleanup temp files, closing shared connections, summary logs.
 */
export default async function globalTeardown() {
  console.log('[global-teardown] completed');
}

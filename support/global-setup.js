import '../config/load-env.js';
import { BASE_URL } from '../config/constants.js';

/**
 * Runs once per worker process start (before tests).
 * Use for: DB seeds, auth token prefetch, warming caches, validating env.
 */
export default async function globalSetup() {
  // Example: fail fast if misconfigured in CI
  if (process.env.CI && !BASE_URL.startsWith('http')) {
    throw new Error(`Invalid BASE_URL for CI: ${BASE_URL}`);
  }
  console.log(`[global-setup] BASE_URL=${BASE_URL} CI=${Boolean(process.env.CI)}`);
}

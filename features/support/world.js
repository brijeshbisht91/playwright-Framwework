import { setWorldConstructor, World } from '@cucumber/cucumber';

/**
 * Per-scenario world: Playwright page + shared POM helpers for step defs.
 */
export class SauceDemoWorld extends World {
  constructor(options) {
    super(options);
    /** @type {import('@playwright/test').BrowserContext | undefined} */
    this.context = undefined;
    /** @type {import('@playwright/test').Page | undefined} */
    this.page = undefined;
  }
}

setWorldConstructor(SauceDemoWorld);

# Interview Q&A — Quality Automation / Playwright + Cucumber

Short answers you can use or expand in a technical interview. Adapt wording to your experience.

---

## Parallel execution

**Q: How do you run tests in parallel?**

- **Cucumber-js**: Use `--parallel N` (workers). Example: `npx cucumber-js --config cucumber.json --parallel 4`. Each worker runs scenarios concurrently; ensure scenarios are **independent** (no shared mutable state on disk, no shared logged-in session unless intentional).
- **Playwright Test runner** (not Cucumber): `workers` in config + `fullyParallel`, or CLI `--workers=4`.
- **Trade-offs**: Faster feedback vs **ordering nondeterminism**, harder debugging, possible **rate limits** on AUT.

**Q: What breaks when you turn parallel on?**

- Shared **static** accounts / same cart state.
- Tests assuming **execution order**.
- **Race conditions** on shared resources (files, DB rows, one browser instance mutated globally).

---

## Commands (typical for this repo)

**Q: How do you run one scenario or a subset?**

- **Tags**: `npm run test:ci -- --tags "@cart"` or combine: `--tags "@login or @cart"`.
- **Single feature path**: `npx cucumber-js --config cucumber.json features/saucedemo-advanced.feature`.

**Q: Headed vs headless?**

- Headless: default for CI; faster; no UI.
- Headed: `npm run test:headed` (your script sets `HEADED=1`) — useful for local debugging and demos.

**Q: How do you install browsers?**

- `npm run pw:install` or `npx playwright install` — pins browsers under the project when using `PLAYWRIGHT_BROWSERS_PATH=0`.

---

## Debugging strategy

**Q: How do you debug a failing e2e test?**

1. **Reproduce locally** — same tag/env as CI.
2. **Artifact first**: screenshot on failure (already in hooks), video/trace optional.
3. **Playwright Inspector**: `PWDEBUG=1 npm run test:headed -- --tags "@cart"` — step through, pick locators.
4. **Trace viewer**: enable trace on retry (`trace: 'on-first-retry'`) if using `@playwright/test` config; with Cucumber you can call `context.tracing.start/stop` in hooks for heavy cases.
5. **Narrow scope**: run **one scenario**, add temporary `await page.pause()` (remove before commit) or **slowMo** in launch options.
6. **Locator stability**: prefer `getByRole`, `getByTestId`, avoid CSS that changes with layout.

**Q: Flaky test — what do you do?**

- Remove **fixed sleeps**; use Playwright **auto-wait** and explicit conditions (`expect().toBeVisible()`).
- Stabilize **data** (known users, reset state).
- **Quarantine** + ticket; don’t “fix” with longer timeouts only.

---

## Login / isolated sessions

**Q: How do you isolate sessions so tests don’t interfere?**

- **New browser context per scenario** (your hooks already do `newContext()` + `newPage()` per scenario): cookies/storage are **not shared** between scenarios in the same worker.
- **Parallel workers**: each worker is a separate process — sessions are isolated **across workers** if each scenario gets its own context.
- **Same user, parallel runs**: risky if the app stores server-side state; use **different users**, **API seed**, or **serial** execution for those tests.

**Q: Multi-session in one test (two users at once)?**

- Two **BrowserContexts** from the same `browser` instance: `context1 = await browser.newContext()`, `context2 = await browser.newContext()`, each gets its own `page`.

---

## Fixtures (concept vs your framework)

**Q: What are Playwright “fixtures”?**

- In `@playwright/test`, fixtures are **dependency-injected** setup/teardown (`page`, `context`, custom `loggedInPage`). Defined in `playwright.config` / test extend.

**Q: Cucumber doesn’t use Playwright fixtures — what’s the equivalent?**

- **`World`** (`features/support/world.js`): holds `page` / `context` per scenario.
- **`Before` / `After` hooks**: create/destroy browser resources — same role as **beforeEach/afterEach**.
- **Rule of thumb**: hooks + world ≈ fixture scope “per scenario.”

---

## Multiple browsers / cross-browser

**Q: How do you run Chrome, Firefox, and WebKit?**

- Your hooks switch on `process.env.BROWSER` (`chromium` | `firefox` | `webkit`). Run three jobs with different env:
  - `BROWSER=firefox npm test`
  - Or matrix in CI: three parallel jobs, each sets `BROWSER`.

**Q: “Run multiple browsers together” on one machine?**

- **Sequential**: one npm command after another (simple).
- **Parallel**: **three terminal processes** or CI matrix each launching its own browser — **not** one process driving three browsers at once unless you script three Cucumber runs with different `BROWSER` (that’s three processes — fine).

---

## Broken links

**Q: How do you test for broken links?**

- Collect `a[href]`, resolve URLs, **HTTP GET** with Playwright **`request`** API (or fetch). Assert status `< 400` (or allow redirects).
- **Scope**: often restrict to **same origin** to avoid hitting external CDNs/auth walls.
- **Nuance**: **mailto:** / **tel:** / **#anchors** — exclude or handle separately.

---

## Tags, smoke vs regression

**Q: How do you organize suites?**

- **Tags**: `@smoke`, `@regression`, `@cart` — run subsets in CI (smoke on PR, full nightly).
- **Feature files** by area: login, checkout, catalog.

---

## Assertions — where they live

**Q: Assertions in step defs vs page objects?**

- **Page objects**: encapsulate **locators + actions + domain assertions** (`expect` on elements).
- **Steps**: orchestrate **Gherkin language** and call page methods — keeps scenarios readable.
- Avoid duplicate assertions in both layers without reason.

---

## CI / headless / stability

**Q: What do you run in CI?**

- Headless, deterministic **install** of browsers, `npm ci`, tagged smoke or full suite, publish **JUnit/HTML/Allure** artifacts.

**Q: Environment variables?**

- Base URL, credentials from **secrets**, never committed — `.env` gitignored; CI injects vars.

---

## Data-driven tests

**Q: How do you data-drive in BDD?**

- **Scenario Outline + Examples** in Gherkin — same steps, multiple rows (users, filters, locales).

---

## Reporting

**Q: What reports do you use?**

- Cucumber HTML formatter, **Allure** (this project: `allure-cucumberjs`), CI artifacts for screenshots on failure.

---

## API vs UI

**Q: When add API tests?**

- **Fast feedback** for business logic; **UI** for critical flows and regressions. Hybrid: API setup (create user) + UI login.

---

## Security / test accounts

**Q: Handling passwords in repo?**

- Never commit real secrets; use `.env`, CI secrets, test-only users.

---

## Quick “one-liners” to remember

| Topic | One sentence |
|--------|----------------|
| Parallel | Cucumber `--parallel N`; tests must be independent. |
| Isolation | New **browser context** per scenario = clean cookies/storage. |
| Debug | `PWDEBUG=1`, trace, screenshots, reproduce with one tag. |
| Cross-browser | Env var + matrix jobs (`BROWSER=firefox`). |
| Fixtures | Cucumber **World + hooks** ≈ Playwright fixtures for this stack. |
| Broken links | Gather hrefs → `request.get` → assert status; scope same-origin. |

---

## Questions you can ask them

- What’s the **tech stack** for automation day-to-day (JS/Java, CI tool)?
- How do you balance **e2e vs API** coverage?
- **Flake** policy — retries, quarantine, ownership?

---

*Tailor examples to this repo: `cucumber.json`, `features/support/hooks.js`, `pages/saucedemo/*`, tags in `.feature` files.*

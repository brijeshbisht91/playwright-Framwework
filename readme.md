# Playwright + Cucumber BDD — Sauce Demo

End-to-end UI automation for **[Sauce Demo](https://www.saucedemo.com/)** using **Playwright**, **Cucumber (Gherkin)**, and **JavaScript (ES modules)**. Page Object Model, shared hooks, tagging, and optional **Allure** reporting (no Java required).

---

## Interview submission (prepared scenario)

Use this as your **primary demo**: end-to-end checkout with **two products** and **totals validation** on the checkout overview step.

- **Feature**: `features/saucedemo-advanced.feature`
- **Scenario**: `Add two items and verify totals on checkout overview`
- **Tag**: `@cart`

Run only that scenario:

```bash
npm run test:ci -- --tags "@cart"
```

**Technical interview prep (Q&A):** see [docs/INTERVIEW_QA.md](docs/INTERVIEW_QA.md) — parallel runs, commands, debugging, isolated sessions, fixtures, cross-browser, broken links, and more.

---

## Prerequisites

- **Node.js** >= 18  
- **npm**  
- Screen-sharing-capable machine for the interview  

Optional: copy `.env.example` to `.env` if you override URLs, timeouts, or viewport settings.

You can also use `TEST_ENV` to load a specific env file such as `.env.dev` or `.env.qa`.

---

## Setup

```bash
git clone <your-repo-url>
cd playwright-Framwework
npm install
npm run pw:install
```

`npm run pw:install` downloads Playwright browsers into the project (works with `PLAYWRIGHT_BROWSERS_PATH=0` used by the test scripts).

---

## Run tests

| Command | Description |
|--------|-------------|
| `npm test` | Default run (headless, uses `cucumber.json`) |
| `npm run test:headed` | Headed browser |
| `npm run test:ci` | CI-style env flag + same runner |
| `npm run test:dev` | Run using `.env` + `.env.dev` if present |
| `npm run test:qa` | Run using `.env` + `.env.qa` if present |

**Override viewport/window size:**

```bash
VIEWPORT_WIDTH=1920 VIEWPORT_HEIGHT=1080 npm test
```

**Run against a dev or QA URL:**

- copy `.env.example` to `.env`
- set `SAUCE_DEMO_URL` to your dev or QA app endpoint
- optionally create `.env.dev` or `.env.qa`

Example command:

```bash
TEST_ENV=qa VIEWPORT_WIDTH=1366 VIEWPORT_HEIGHT=768 npm run test:qa
```

**Filter by tag** (Cucumber):

```bash
npm run test:ci -- --tags "@priceValidation"
npm run test:ci -- --tags "@login or @cart"
```

**Step-by-step terminal logs:** each Gherkin step is printed from `features/support/hooks.js` (`BeforeStep` / `AfterStep`). To turn that off (quieter CI output), run with `STEP_LOG=0 npm test`.

---

## Reports

- **Cucumber HTML**: `reports/cucumber-report.html` (after a run)  
- **Allure** (no Java): after tests, `allure-results/` is produced. Then:

```bash
npm run allure:generate
npm run allure:open
```

Generated folders are **gitignored**; do not commit `allure-results/` or `allure-report/`.

---

## Project structure (high level)

```
config/              # env loader, constants (base URL)
features/
  *.feature          # Gherkin scenarios
  step_definitions/  # Cucumber steps → page objects
  support/           # world, hooks (browser lifecycle)
pages/saucedemo/     # Page Object Model
cucumber.json        # Cucumber CLI config (formats, imports)
package.json
```

---

## Tech choices (for reviewers)

- **BDD**: Cucumber-js — scenarios live in `.feature` files; automation maps via step definitions.  
- **Driver**: Playwright — resilient auto-waiting, tracing/screenshots can be extended in hooks.  
- **Language**: JavaScript aligns with “Playwright BDD” in the interview brief (alternative to Java Cucumber).

---

## Docker (optional)

```bash
npm run docker:build
npm run test:docker
```

---

## Author

Brijesh Bisht

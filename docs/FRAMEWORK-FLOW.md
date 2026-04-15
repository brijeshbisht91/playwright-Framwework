# Playwright framework — execution flow

This document describes how this repo’s test run is orchestrated, **what each folder is for**, and how pieces connect. Diagrams use [Mermaid](https://mermaid.js.org/); they render on GitHub, in many IDEs, and in Markdown preview tools.

---

## How the pieces connect (short narrative)

1. **`playwright.config.js`** (repo root) is the entry point: it loads **`config/load-env.js`**, reads **`config/constants.js`** for defaults like `BASE_URL`, registers **`support/global-setup.js`** / **`support/global-teardown.js`**, and points **`testDir`** at **`tests/`**.
2. Specs under **`tests/`** import **`fixtures/index.js`**, which extends Playwright’s `test` with **`fixtures/base.fixture.js`** (custom fixtures, POM wiring).
3. UI logic and selectors live in **`pages/`** (Page Object Model); raw scenario rows can live in **`data/`** and be read from specs.
4. After a run, Playwright and Allure write **generated** folders (`test-results/`, `playwright-report/`, `allure-results/`); Allure’s HTML output is typically `allure-report/` when you generate it locally.
5. **CI** runs from **`.github/workflows/`** (Node job vs Docker job); **Docker** uses **`Dockerfile`** + **`docker-compose.yml`** so the same image runs locally or in `playwright-docker.yml`.

---

## Repository layout (folders and use)

| Location | Purpose |
|----------|---------|
| **`config/`** | Loads `.env` before other modules read variables (`load-env.js`); shared constants such as `BASE_URL` and timeouts (`constants.js`). Keeps environment concerns out of specs. |
| **`data/`** | Static test inputs (e.g. JSON for data-driven tests). Treat as read-only fixtures; no secrets here—use CI secrets or `.env` for credentials. |
| **`docs/`** | Human-written documentation for the framework (this file, diagrams, onboarding). Not executed by Playwright. |
| **`fixtures/`** | Custom **`test`** built with `test.extend({ … })`: shared setup (e.g. POM instances, `auto: true` headers), re-exported via `fixtures/index.js` so specs import one place. |
| **`pages/`** | Page Object Model: one class per page/area, encapsulating URLs, locators, and user flows. Specs stay short; UI changes touch fewer files. |
| **`support/`** | **Global** lifecycle: `global-setup.js` / `global-teardown.js` run once per test run (configured in `playwright.config.js`). Use for env checks, DB seeds, auth files—not per-test logic (that belongs in fixtures). |
| **`tests/`** | All `*.spec.js` files Playwright discovers (see `testDir`). **`tests/e2e/`** holds main examples; root-level specs are fine for small smokes. |
| **`.github/workflows/`** | CI pipelines: **`playwright-ci.yml`** runs Node + `npm ci` + browser install on the runner; **`playwright-docker.yml`** builds and runs the same suite in Docker. |
| **Root** (`Dockerfile`, `docker-compose.yml`, `package.json`, `playwright.config.js`) | Container definition, local compose overrides/volumes, dependencies/scripts, and main Playwright config. |

### Generated / third-party (usually not committed)

| Location | Purpose |
|----------|---------|
| **`node_modules/`** | npm dependencies; created by `npm ci` / `npm install`. |
| **`test-results/`** | Playwright run output: traces, screenshots on failure, metadata. |
| **`playwright-report/`** | Built-in HTML reporter output. |
| **`allure-results/`** | Raw Allure result files from `allure-playwright`. |
| **`allure-report/`** | Generated after `allure generate` (or `npm run report:allure`); not the same as `allure-results`. |

---

## Folder dependency flow (what imports what)

```mermaid
flowchart TB
  subgraph Root["Repository root"]
    PC[playwright.config.js]
    PKG[package.json]
    DC[docker-compose.yml]
    DF[Dockerfile]
  end

  subgraph Config["config/"]
    LE[load-env.js]
    CT[constants.js]
  end

  subgraph Support["support/"]
    GS[global-setup.js]
    GT[global-teardown.js]
  end

  subgraph Fixtures["fixtures/"]
    BF[base.fixture.js]
    FI[index.js]
  end

  subgraph Pages["pages/"]
    POM[BasePage / *Page.js]
  end

  subgraph Data["data/"]
    JSON[*.json scenarios]
  end

  subgraph Tests["tests/"]
    SPEC["*.spec.js"]
  end

  PC --> LE
  PC --> CT
  PC --> GS
  PC --> GT
  FI --> BF
  BF --> LE
  BF --> CT
  BF --> POM
  SPEC --> FI
  SPEC --> JSON
  DF --> PKG
  DC --> DF
```

---

## 1. End-to-end run (CLI → reports)

```mermaid
flowchart TB
  subgraph CLI["Local / CI command"]
    A[npm test / npm run test:ci] --> B[npx playwright test]
  end

  subgraph Config["Configuration"]
    B --> C[playwright.config.js]
    C --> L[config/load-env.js → .env]
    C --> D[BASE_URL, workers, retries, reporters]
  end

  subgraph Global["Global hooks (once per run)"]
    C --> E[global-setup.js]
    E --> F{Valid for CI?}
    F -->|yes| G[Workers start]
    F -->|throws| H[Run aborted]
  end

  subgraph Workers["Parallel workers"]
    G --> W1[Worker 1]
    G --> W2[Worker 2]
    G --> WN[Worker N…]
  end

  subgraph PerTest["Each test (per worker)"]
    W1 & W2 & WN --> T[Load spec + fixtures]
    T --> AF[Auto fixture: baselineApp]
    T --> PF[Fixture: docPage → POM]
    T --> RUN[Test body]
    RUN -->|fail + retries left| RET[Retry same test]
    RET --> RUN
    RUN --> REP[Reporters: list, html, allure]
  end

  subgraph Teardown["End of run"]
    REP --> GS[global-teardown.js]
    GS --> OUT[playwright-report / allure-results]
  end
```

---

## 2. Single test lifecycle (fixtures + POM)

```mermaid
sequenceDiagram
  participant PW as Playwright Test
  participant AF as baselineApp fixture
  participant PG as page / context
  participant DF as docPage fixture
  participant POM as PlaywrightDocPage
  participant T as test()

  PW->>AF: setup (auto: true)
  AF->>PG: setExtraHTTPHeaders
  AF-->>PW: use(undefined)

  PW->>DF: setup
  DF->>POM: new PlaywrightDocPage(page)
  DF-->>PW: use(docPage)

  PW->>T: run test({ page, docPage, … })

  T->>POM: openHome / goto / assertions
  T-->>PW: pass or fail

  PW->>DF: teardown after use()
  PW->>AF: teardown after use()
```

---

## 3. Page Object (POM) call path

```mermaid
flowchart LR
  subgraph Spec["tests/e2e/*.spec.js"]
    S[test from fixtures/index.js]
  end

  subgraph Fixtures["fixtures/base.fixture.js"]
    F[docPage fixture]
  end

  subgraph Pages["pages/"]
    P[PlaywrightDocPage]
    B[BasePage.goto]
  end

  subgraph Browser["Playwright"]
    PG[Page + baseURL]
  end

  S --> F
  F --> P
  P --> B
  B --> PG
```

---

## 4. Data-driven parallel block

```mermaid
flowchart TB
  subgraph Data["data/docs-routes.json"]
    J[JSON rows: path, expectedHeading]
  end

  subgraph Spec["docs.data-driven.parallel.spec.js"]
    D[test.describe.configure mode parallel]
    D --> L[for each scenario]
    L --> T1[Test: intro]
    L --> T2[Test: writing-tests]
    L --> T3[Test: running-tests]
  end

  J --> L
  T1 & T2 & T3 --> W[Run concurrently within file]
```

---

## 5. CI pipelines (GitHub Actions — two workflows)

**`playwright-ci.yml`** — tests on the GitHub runner with Node (no Docker image for the app under test).

```mermaid
flowchart LR
  subgraph Trigger["Trigger"]
    P[push / pull_request]
  end

  subgraph Native["playwright-ci.yml → job: test"]
    P --> CO[checkout]
    CO --> ND[setup-node + npm ci]
    ND --> BR[npx playwright install --with-deps chromium]
    BR --> TE[npm run test:ci]
    TE --> A1[artifact: playwright-report]
    TE --> A2[artifact: allure-results]
  end
```

**`playwright-docker.yml`** — same suite, separate workflow: build image, run `docker compose run`, upload artifacts (names suffixed with `-docker`).

```mermaid
flowchart LR
  subgraph DockerWF["playwright-docker.yml → job: test-docker"]
    Q[push / pull_request] --> CH[checkout]
    CH --> BX[docker buildx setup]
    BX --> DB[docker compose build e2e]
    DB --> DR[docker compose run --rm e2e]
    DR --> D1[artifact: playwright-report-docker]
    DR --> D2[artifact: allure-results-docker]
  end
```

---

## 6. Docker flow (local or CI)

```mermaid
flowchart TB
  subgraph Image["Dockerfile"]
    I[mcr.microsoft.com/playwright image] --> W[WORKDIR /workspace]
    W --> CP[npm ci + COPY project]
    CP --> CMD[npm run test:ci]
  end

  subgraph Compose["docker-compose.yml"]
    V[volumes: test-results, playwright-report, allure-results]
    CMD --> V
  end
```

Local: `npm run docker:build` then `npm run test:docker` (writes reports into the mounted folders at repo root).

---

## Quick file map (key files, not folders)

| Stage | File |
|--------|------|
| Env before config | `config/load-env.js` |
| URLs / timeouts | `config/constants.js` |
| Main config | `playwright.config.js` |
| Global hooks | `support/global-setup.js`, `support/global-teardown.js` |
| Custom test + fixtures | `fixtures/base.fixture.js`, `fixtures/index.js` |
| POM | `pages/BasePage.js`, `pages/PlaywrightDocPage.js` |
| CI (Node on runner) | `.github/workflows/playwright-ci.yml` |
| CI (Docker) | `.github/workflows/playwright-docker.yml` |
| Container | `Dockerfile`, `docker-compose.yml` |
| Env template | `.env.example` |
| Ignore Docker build context | `.dockerignore` |

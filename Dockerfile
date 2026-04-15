# Keep this tag aligned with your @playwright/test version:
# https://playwright.dev/docs/docker
FROM mcr.microsoft.com/playwright:v1.59.0-noble

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV CI=true
ENV BASE_URL=https://playwright.dev

# Browsers are preinstalled in the Playwright image.
CMD ["npm", "run", "test:ci"]

# Aligned with @playwright/test — https://playwright.dev/docs/docker
FROM mcr.microsoft.com/playwright:v1.59.0-noble

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV CI=true
ENV SAUCE_DEMO_URL=https://www.saucedemo.com

CMD ["npm", "run", "test:ci"]

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Golden layout from `standard_user` — see each key's `source` field in the JSON. */
const GOLDEN = JSON.parse(
  readFileSync(join(__dirname, '../../config/visual-inventory-layout-golden.json'), 'utf8'),
);

/**
 * @param {import('@playwright/test').Page} page
 * @param {number} minOffsetPx minimum Euclidean offset of cart top-left vs golden (visual_user shifts the cart)
 */
export async function assertShoppingCartLayoutDiffersFromGolden(page, minOffsetPx) {
  const vp = page.viewportSize();
  if (!vp) {
    throw new Error('viewportSize is not set; ensure hooks or resize set viewport before this step');
  }

  const key = `${vp.width}x${vp.height}`;
  const entry = GOLDEN[key];
  if (!entry) {
    throw new Error(
      `No golden baseline for viewport "${key}". Add it to config/visual-inventory-layout-golden.json (capture standard_user at this size).`,
    );
  }

  const g = entry.shopping_cart_link;
  const cart = await page.locator('.shopping_cart_link').boundingBox();
  expect(cart, 'shopping cart link should have a bounding box').toBeTruthy();

  const dist = Math.hypot(Math.abs(cart.x - g.x), Math.abs(cart.y - g.y));
  expect(
    dist,
    `Cart top-left offset from golden (${key}): expected ≥ ${minOffsetPx}px, got ${dist.toFixed(1)}px (golden x=${g.x}, y=${g.y}; actual x=${cart.x}, y=${cart.y})`,
  ).toBeGreaterThanOrEqual(minOffsetPx);
}

import { test, expect } from '@playwright/test';
import { clearCart } from './helpers/clearCart';

test.beforeEach(async ({ page }) => {
  await clearCart(page);
});

test('пользователь может добавить товар в корзину', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000);
  
  const beforeCount = await page.locator('a[href="/cart"]').textContent();
  console.log('До добавления:', beforeCount);
  
  await page.evaluate(() => {
    const card = document.querySelector('.bg-white.border.rounded-lg.p-4');
    const buttons = card?.querySelectorAll('button');
    const cartButton = Array.from(buttons || []).find(btn => btn.textContent?.includes('В корзину'));
    if (cartButton) cartButton.click();
  });
  
  await expect(page.locator('text=добавлен')).toBeVisible({ timeout: 5000 });
  
  await page.waitForTimeout(2000);
  
  const afterCount = await page.locator('a[href="/cart"]').textContent();
  console.log('После добавления:', afterCount);
  
  expect(afterCount).not.toBe(beforeCount);
});

test('в корзине есть добавленный товар', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000);
  
  await page.evaluate(() => {
    const card = document.querySelector('.bg-white.border.rounded-lg.p-4');
    const buttons = card?.querySelectorAll('button');
    const cartButton = Array.from(buttons || []).find(btn => btn.textContent?.includes('В корзину'));
    if (cartButton) cartButton.click();
  });
  
  await expect(page.locator('text=добавлен')).toBeVisible({ timeout: 5000 });
  await page.locator('a[href="/cart"]').first().click();
  
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.flex.flex-col.gap-4.bg-white.p-4.rounded-lg.shadow-sm.border', { timeout: 10000 });
  
  const productTitle = page.locator('h3:has-text("Торт")').first();
  await expect(productTitle).toBeVisible({ timeout: 5000 });
});

test('изменение количества пересчитывает сумму', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000);
  
  await page.evaluate(() => {
    const card = document.querySelector('.bg-white.border.rounded-lg.p-4');
    const buttons = card?.querySelectorAll('button');
    const cartButton = Array.from(buttons || []).find(btn => btn.textContent?.includes('В корзину'));
    if (cartButton) cartButton.click();
  });
  
  await page.locator('a[href="/cart"]').first().click();
  await page.waitForTimeout(2000);
  
  const totalBlock = page.locator('.border-t.pt-2.mt-2');
  const priceBefore = await totalBlock.locator('span').last().textContent();
  const quantityBefore = await page.locator('span.w-8.text-center.font-medium').first().textContent();
  
  await page.locator('button', { hasText: '+' }).first().click();
  await page.waitForTimeout(500);
  
  const quantityAfter = await page.locator('span.w-8.text-center.font-medium').first().textContent();
  expect(quantityAfter).not.toBe(quantityBefore);
  
  const priceAfter = await totalBlock.locator('span').last().textContent();
  expect(priceAfter).not.toBe(priceBefore);
});

test('удаление товара очищает корзину', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000);
  
  await page.evaluate(() => {
    const card = document.querySelector('.bg-white.border.rounded-lg.p-4');
    const buttons = card?.querySelectorAll('button');
    const cartButton = Array.from(buttons || []).find(btn => btn.textContent?.includes('В корзину'));
    if (cartButton) cartButton.click();
  });
  
  await page.locator('a[href="/cart"]').first().click();
  await page.waitForTimeout(2000);
  
  await page.locator('button', { hasText: '🗑️' }).first().click();
  await page.locator('button', { hasText: 'Удалить' }).last().click();
  await page.waitForTimeout(1000);
  
  await expect(page.locator('text=Корзина пуста')).toBeVisible();
});
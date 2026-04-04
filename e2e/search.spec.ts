import { test, expect } from '@playwright/test';

test('поиск по названию показывает результаты', async ({ page }) => {
  // Переходим на страницу каталога (поиск работает только там)
  await page.goto('/products');
  await page.waitForTimeout(3000);
  
  // Заполняем поиск
  await page.fill('input[placeholder="Поиск товаров..."]', 'Некрон');
  
  // Ждем появления результата
  await page.waitForSelector('button:has-text("Некрон")', { timeout: 10000 });
  
  const result = page.locator('button:has-text("Некрон")').first();
  await expect(result).toBeVisible();
  
  await result.click();
  await expect(page).toHaveURL(/\/products\/[a-zA-Z0-9]+/);
});
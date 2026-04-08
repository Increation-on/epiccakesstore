import { test, expect } from '@playwright/test';

test('оформление заказа с оплатой наличными', async ({ page }) => {
  test.slow();
  
  await page.goto('/');
  await page.waitForTimeout(3000);
  
  await page.evaluate(() => {
    const card = document.querySelector('.bg-white.border.rounded-lg.p-4');
    const buttons = card?.querySelectorAll('button');
    const cartButton = Array.from(buttons || []).find(btn => btn.textContent?.includes('В корзину'));
    if (cartButton) (cartButton as HTMLElement).click();
  });
  
  await expect(page.locator('text=добавлен')).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(3000);
  
  await page.goto('/cart');
  await page.waitForTimeout(2000);
  await page.click('button:has-text("Оформить заказ")');
  
  await expect(page).toHaveURL(/\/checkout/, { timeout: 10000 });
  
  await page.fill('input[name="fullName"]', 'Тестовый Пользователь');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="phone"]', '+375291234567');
  await page.fill('textarea[name="address"]', 'ул. Тестовая, д.1');
  await page.check('input[value="cash"]');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/\/checkout\/confirm/, { timeout: 10000 });
  
  const confirmButton = page.locator('button:has-text("Подтвердить заказ")');
  await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
  
  // Кликаем и просто ждём 3 секунды
  await confirmButton.click();
  
  // Ждём, пока URL не станет содержать /order/ или /cart
  await page.waitForFunction(
    () => window.location.href.includes('/order/') || window.location.href.includes('/cart'),
    { timeout: 30000 }
  );
  
  const currentUrl = page.url();
  
  if (currentUrl.includes('/order/')) {
    await expect(page.locator('text=Заказ оформлен').or(page.locator('text=Оплачено'))).toBeVisible();
  }
  
  await page.goto('/cart');
  await page.waitForTimeout(2000);
  await expect(page.locator('text=Корзина пуста')).toBeVisible();
});
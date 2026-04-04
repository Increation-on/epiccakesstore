import { test, expect } from '@playwright/test';

test('оплата заказа картой', async ({ page }) => {
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
  await page.check('input[value="card"]');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/\/checkout\/confirm/, { timeout: 10000 });
  
  // Нажимаем "Перейти к оплате"
  await page.click('button:has-text("Перейти к оплате")');
  
  // Ждем появления формы Stripe (любой iframe)
  await page.waitForSelector('iframe', { timeout: 15000 });
  
  // Берем первый iframe (скорее всего это Stripe)
  const stripeFrame = page.frameLocator('iframe').first();
  
  // Заполняем данные карты (селекторы могут отличаться)
  await stripeFrame.locator('input[type="text"]').first().fill('4242 4242 4242 4242');
  await stripeFrame.locator('input[type="text"]').nth(1).fill('12/34');
  await stripeFrame.locator('input[type="text"]').nth(2).fill('123');
  
  // Чекбокс подтверждения
  await page.locator('input[type="checkbox"]').check();
  
  // Нажимаем "Оплатить"
  await page.click('button:has-text("Оплатить")');
  
  await expect(page).toHaveURL(/\/order\/.+\/success/, { timeout: 30000 });
  await expect(page.locator('text=Оплачено')).toBeVisible();
  
  await page.goto('/cart');
  await expect(page.locator('text=Корзина пуста')).toBeVisible();
});
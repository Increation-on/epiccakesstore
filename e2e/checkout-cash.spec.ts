import { test, expect } from '@playwright/test';

test('оформление заказа с оплатой наличными', async ({ page }) => {
  test.slow();
  
  await page.goto('/');
  await page.waitForTimeout(3000);
  
  // Добавляем товар
  await page.evaluate(() => {
    const card = document.querySelector('.bg-white.border.rounded-lg.p-4');
    const buttons = card?.querySelectorAll('button');
    const cartButton = Array.from(buttons || []).find(btn => btn.textContent?.includes('В корзину'));
    if (cartButton) (cartButton as HTMLElement).click();
  });
  
  await expect(page.locator('text=добавлен')).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(3000);
  
  // Идем в корзину
  await page.goto('/cart');
  await page.waitForTimeout(2000);
  
  // Оформляем заказ
  await page.click('button:has-text("Оформить заказ")');
  await page.waitForTimeout(2000);
  
  // Ждем /checkout
  await expect(page).toHaveURL(/\/checkout/, { timeout: 10000 });
  
  // Заполняем форму
  await page.fill('input[name="fullName"]', 'Тестовый Пользователь');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="phone"]', '+375291234567');
  await page.fill('textarea[name="address"]', 'ул. Тестовая, д.1');
  await page.check('input[value="cash"]');
  await page.click('button[type="submit"]');
  
  // Ждем /checkout/confirm
  await expect(page).toHaveURL(/\/checkout\/confirm/, { timeout: 10000 });
  
  // Ждем, когда кнопка "Подтвердить заказ" станет активной
  const confirmButton = page.locator('button:has-text("Подтвердить заказ")');
  await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
  await confirmButton.click();
  
  // Ждем редиректа на страницу успеха (или корзину — логируем)
  await page.waitForTimeout(3000);
  console.log('URL после подтверждения:', page.url());
  
  // Если редирект на корзину — ждем, что корзина пуста
  if (page.url().includes('/cart')) {
    await expect(page.locator('text=Корзина пуста')).toBeVisible({ timeout: 5000 });
  } else {
    // Иначе проверяем страницу успеха
    await expect(page).toHaveURL(/\/order\/.+\/success/, { timeout: 15000 });
    await expect(page.locator('text=Заказ оформлен').or(page.locator('text=Оплачено'))).toBeVisible();
    
    // Проверяем корзину
    await page.goto('/cart');
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Корзина пуста')).toBeVisible();
  }
});
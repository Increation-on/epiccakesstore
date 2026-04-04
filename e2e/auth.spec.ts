// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('регистрация нового пользователя', async ({ page }) => {
  const uniqueEmail = `test_${Date.now()}@example.com`;
  
  await page.goto('/register');
  await page.fill('input[name="name"]', 'Новый Пользователь');
  await page.fill('input[name="email"]', uniqueEmail);
  await page.fill('input[name="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/\/login\?registered=true/);
});

test('логин существующего пользователя', async ({ page }) => {
  const uniqueEmail = `test_${Date.now()}@example.com`;
  
  // Сначала регистрируем пользователя
  await page.goto('/register');
  await page.fill('input[name="name"]', 'Новый Пользователь');
  await page.fill('input[name="email"]', uniqueEmail);
  await page.fill('input[name="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/login\?registered=true/);
  
  // Логинимся
  await page.fill('input[type="email"]', uniqueEmail);
  await page.fill('input[type="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/');
  await expect(page.locator('text=Новый Пользователь')).toBeVisible();
});

test('неверный пароль показывает ошибку', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('input[type="email"]', 'nonexistent@example.com');
  await page.fill('input[type="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('text=Неверный email или пароль')).toBeVisible();
});

test('корзина гостя сохраняется после логина', async ({ page }) => {
  // 1. Гость добавляет товар
  await page.goto('/');
  await page.waitForTimeout(3000);
  
  await page.evaluate(() => {
    const card = document.querySelector('.bg-white.border.rounded-lg.p-4');
    const buttons = card?.querySelectorAll('button');
    const cartButton = Array.from(buttons || []).find(btn => btn.textContent?.includes('В корзину'));
    if (cartButton) (cartButton as HTMLElement).click();
  });
  
  await expect(page.locator('text=добавлен')).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(2000);
  
  // 2. Проверяем, что товар добавился
  await page.goto('/cart');
  await expect(page.locator('h3:has-text("Торт")')).toBeVisible();
  
  // 3. Регистрация
  const uniqueEmail = `test_${Date.now()}@example.com`;
  await page.goto('/register');
  await page.fill('input[name="name"]', 'Новый Пользователь');
  await page.fill('input[name="email"]', uniqueEmail);
  await page.fill('input[name="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/login\?registered=true/);
  
  // 4. Логин
  await page.fill('input[type="email"]', uniqueEmail);
  await page.fill('input[type="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
  
  // 5. Ждем синхронизации корзины (useCartSync грузит с сервера)
  await page.waitForTimeout(3000);
  
  // 6. Проверяем, что корзина не пуста (перенеслась)
  await page.goto('/cart');
  await expect(page.locator('h3:has-text("Торт")')).toBeVisible();
});

test('выход очищает корзину', async ({ page }) => {
  // 1. Регистрация
  const uniqueEmail = `test_${Date.now()}@example.com`;
  
  await page.goto('/register');
  await page.fill('input[name="name"]', 'Новый Пользователь');
  await page.fill('input[name="email"]', uniqueEmail);
  await page.fill('input[name="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/login\?registered=true/);
  
  // 2. Логин
  await page.fill('input[type="email"]', uniqueEmail);
  await page.fill('input[type="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
  
  // 3. Добавляем товар
  await page.evaluate(() => {
    const card = document.querySelector('.bg-white.border.rounded-lg.p-4');
    const buttons = card?.querySelectorAll('button');
    const cartButton = Array.from(buttons || []).find(btn => btn.textContent?.includes('В корзину'));
    if (cartButton) (cartButton as HTMLElement).click();
  });
  await expect(page.locator('text=добавлен')).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(2000);
  
  // 4. Выход
  await page.click('button:has-text("Выйти")');
  await page.waitForTimeout(2000);
  
  // 5. Проверяем, что корзина пуста
  await page.goto('/cart');
  await expect(page.locator('text=Корзина пуста')).toBeVisible();
});

test('корзина восстанавливается с сервера после повторного входа', async ({ page }) => {
  // 1. Регистрация
  const uniqueEmail = `test_${Date.now()}@example.com`;
  
  await page.goto('/register');
  await page.fill('input[name="name"]', 'Новый Пользователь');
  await page.fill('input[name="email"]', uniqueEmail);
  await page.fill('input[name="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/login\?registered=true/);
  
  // 2. Логин
  await page.fill('input[type="email"]', uniqueEmail);
  await page.fill('input[type="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
  
  // 3. Добавляем товар
  await page.evaluate(() => {
    const card = document.querySelector('.bg-white.border.rounded-lg.p-4');
    const buttons = card?.querySelectorAll('button');
    const cartButton = Array.from(buttons || []).find(btn => btn.textContent?.includes('В корзину'));
    if (cartButton) (cartButton as HTMLElement).click();
  });
  await expect(page.locator('text=добавлен')).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(2000);
  
  // 4. Выход
  await page.click('button:has-text("Выйти")');
  await page.waitForTimeout(2000);
  
  // 5. Проверяем, что корзина пуста на клиенте
  await page.goto('/cart');
  await expect(page.locator('text=Корзина пуста')).toBeVisible();
  
  // 6. Снова логинимся
  await page.goto('/login');
  await page.fill('input[type="email"]', uniqueEmail);
  await page.fill('input[type="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
  
  // 7. Проверяем, что корзина восстановилась с сервера
  await page.goto('/cart');
  await expect(page.locator('h3:has-text("Торт")')).toBeVisible();
});
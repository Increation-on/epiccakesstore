import { test, expect } from '@playwright/test';

test('регистрация нового пользователя', async ({ page }) => {
  const uniqueEmail = `test_${Date.now()}@example.com`;
  
  await page.goto('/register');
  await page.fill('input[name="name"]', 'Новый Пользователь');
  await page.fill('input[name="email"]', uniqueEmail);
  await page.fill('input[name="password"]', 'Test123456');
  
  const responsePromise = page.waitForResponse('/api/register');
  await page.click('button[type="submit"]');
  await responsePromise;
  
  await page.waitForURL(/\/login\?registered=true/, { timeout: 10000 });
  await expect(page).toHaveURL(/\/login\?registered=true/);
});

test('логин существующего пользователя', async ({ page }) => {
  const uniqueEmail = `test_${Date.now()}@example.com`;
  
  // Регистрация
  await page.goto('/register');
  await page.fill('input[name="name"]', 'Новый Пользователь');
  await page.fill('input[name="email"]', uniqueEmail);
  await page.fill('input[name="password"]', 'Test123456');
  
  let responsePromise = page.waitForResponse('/api/register');
  await page.click('button[type="submit"]');
  await responsePromise;
  await page.waitForURL(/\/login\?registered=true/);
  
  // Логин
  await page.fill('input[type="email"]', uniqueEmail);
  await page.fill('input[type="password"]', 'Test123456');
  
  responsePromise = page.waitForResponse('/api/auth/callback/credentials');
  await page.click('button[type="submit"]');
  await responsePromise;
  
  await page.waitForURL('/', { timeout: 10000 });
  await expect(page).toHaveURL('/');
  
  // Проверяем, что пользователь залогинен — кнопка "Выйти" должна быть видна
  const logoutButton = page.locator('button:has-text("Выйти")');
  await expect(logoutButton).toBeVisible({ timeout: 10000 });
});

test('неверный пароль показывает ошибку', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('input[type="email"]', 'nonexistent@example.com');
  await page.fill('input[type="password"]', 'wrongpassword');
  
  const responsePromise = page.waitForResponse('/api/auth/callback/credentials');
  await page.click('button[type="submit"]');
  await responsePromise;
  
  await expect(page.locator('text=Неверный email или пароль')).toBeVisible();
});

test('кнопка входа через Google присутствует', async ({ page }) => {
  await page.goto('/login');
  
  const googleButton = page.locator('button:has-text("Войти через Google")');
  await expect(googleButton).toBeVisible();
});

test('кнопка регистрации через Google присутствует', async ({ page }) => {
  await page.goto('/register');
  
  const googleButton = page.locator('button:has-text("Зарегистрироваться через Google")');
  await expect(googleButton).toBeVisible();
});
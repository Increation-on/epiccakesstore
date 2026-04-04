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
  
  // Регистрация
  await page.goto('/register');
  await page.fill('input[name="name"]', 'Новый Пользователь');
  await page.fill('input[name="email"]', uniqueEmail);
  await page.fill('input[name="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/login\?registered=true/);
  
  // Логин
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
import { test, expect } from '@playwright/test';

test('главная страница открывается', async ({ page }) => {
  // 1. Открываем главную страницу
  await page.goto('/');
  
  // 2. Проверяем, что заголовок страницы содержит название магазина
  await expect(page).toHaveTitle(/EpicCakesStore/);
});
import { expect, Page } from '@playwright/test';

export async function clearCart(page: Page) {
  // Переходим в корзину
  await page.goto('/cart');
  
  // Ждем загрузки страницы
  await page.waitForTimeout(1000);
  
  // Пробуем очистить через кнопку "Очистить корзину"
  const clearButton = page.locator('button', { hasText: 'Очистить корзину' });
  if (await clearButton.isVisible()) {
    await clearButton.click();
    await page.locator('button', { hasText: 'Удалить' }).last().click();
    await page.waitForTimeout(1000);
  }
  
  // Удаляем все товары по одному, если остались
  let deleteButtons = page.locator('button', { hasText: '🗑️' });
  let count = await deleteButtons.count();
  
  while (count > 0) {
    await deleteButtons.first().click();
    await page.locator('button', { hasText: 'Удалить' }).last().click();
    await page.waitForTimeout(500);
    deleteButtons = page.locator('button', { hasText: '🗑️' });
    count = await deleteButtons.count();
  }
  
  // Проверяем, что корзина пуста
  await expect(page.locator('text=Корзина пуста')).toBeVisible();
  
  // Возвращаемся на главную
  await page.goto('/');
}
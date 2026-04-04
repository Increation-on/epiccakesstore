// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';

async function globalSetup(config: FullConfig) {
  // Проверяем, есть ли уже сохраненная сессия
  if (fs.existsSync('playwright/.auth/user.json')) {
    console.log('✅ Сессия уже есть, пропускаем логин');
    return;
  }
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔧 Global Setup: логин тестового пользователя...');
  
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  await page.fill('input[type="email"]', 'test@epiccakes.com');
  await page.fill('input[type="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  
  // Ждем редиректа на главную
  await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
  
  // Сохраняем сессию
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
  
  console.log('✅ Global Setup: сессия сохранена');
  
  await browser.close();
}

export default globalSetup;
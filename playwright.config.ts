import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',           // 👈 папка, где будут лежать тесты
  fullyParallel: true,        // 👈 тесты будут запускаться параллельно (быстрее)
  reporter: 'html',           // 👈 после тестов создаст красивый HTML отчет
  use: {
    baseURL: 'http://localhost:3000',  // 👈 базовый URL сайта
    trace: 'on-first-retry',           // 👈 сохранит трейс при ошибке
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },  // 👈 тестируем в Chrome
    },
  ],
  webServer: {
    command: 'npm run dev',     // 👈 автоматически запустит проект перед тестами
    url: 'http://localhost:3000',
    reuseExistingServer: true,  // 👈 если сервер уже запущен, новый не стартует
  },
});
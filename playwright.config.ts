import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  reporter: 'html',
  
  // 👇 Добавляем globalSetup
  globalSetup: require.resolve('./global-setup'),
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  
  projects: [
    // 👇 Проект для тестов авторизации (без сессии)
    {
      name: 'auth',
      testMatch: '**/auth.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: undefined, // 👈 не используем сохраненную сессию
      },
    },
    
    // 👇 Проект для всех остальных тестов (с сессией)
    {
      name: 'authenticated',
      testMatch: '**/*.spec.ts',
      testIgnore: '**/auth.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json', // 👈 используем сессию
      },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
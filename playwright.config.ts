import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  reporter: 'html',
  
  // 👇 Заменяем require.resolve на import
  globalSetup: resolve(__dirname, './global-setup.ts'),
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  
  projects: [
    {
      name: 'auth',
      testMatch: '**/auth.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: undefined,
      },
    },
    
    {
      name: 'authenticated',
      testMatch: '**/*.spec.ts',
      testIgnore: '**/auth.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
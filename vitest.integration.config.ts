import { defineConfig } from 'vitest/config'
import path from 'path'
import 'dotenv/config'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/integration/**/*.test.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
    setupFiles: ['./__tests__/integration/setup/global.ts'],
    testTimeout: 15000,
    env: {
      TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
    },
  },
})
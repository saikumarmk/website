import { defineConfig, devices } from '@playwright/test'

const dev = process.env.E2E_DEV === '1'
const baseURL = dev ? 'http://127.0.0.1:5173' : 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: dev
    ? {
        command: 'pnpm urara:build && pnpm exec vite dev --host 127.0.0.1 --port 5173 --strictPort',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000
      }
    : {
        command: 'pnpm run build && pnpm exec vite preview --host 127.0.0.1 --port 4173',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 600_000
      }
})

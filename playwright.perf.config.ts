import { defineConfig, devices } from '@playwright/test'

const usePreview = process.env.E2E_PERF_PREVIEW === '1'
const baseURL = usePreview ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:5173'

export default defineConfig({
  testDir: './e2e/perf',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['json', { outputFile: 'test-results/perf/report.json' }]],
  timeout: 120_000,
  use: {
    baseURL,
    viewport: { width: 1280, height: 720 },
    trace: 'off',
    video: 'off'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } }
  ],
  webServer: usePreview
    ? {
        command: 'pnpm exec vite preview --host 127.0.0.1 --port 4173',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 60_000
      }
    : {
        command:
          'pnpm urara:build && pnpm exec vite dev --host 127.0.0.1 --port 5173 --strictPort',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000
      }
})

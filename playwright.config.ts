import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['line'], ['html', { open: 'never' }]],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    // CI siempre conserva video de fallos. En local se puede activar con
    // PLAYWRIGHT_VIDEO=1 cuando Playwright tenga ffmpeg instalado.
    video: process.env.CI || process.env.PLAYWRIGHT_VIDEO === '1' ? 'retain-on-failure' : 'off',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run build && npm run start -- --hostname 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: 'chromium',
      // En CI se usa el Chromium descargado por Playwright. En Windows local,
      // Chrome permite ejecutar la misma suite cuando la descarga no está disponible.
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.CI ? undefined : 'chrome'
      }
    }
  ]
});

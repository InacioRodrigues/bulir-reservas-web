import { defineConfig, devices } from '@playwright/test'

/**
 * E2E contra a API REAL (local ou produção). Pré-requisito: API a correr com o seed
 * (ver README). As asserções de saldo são relativas, por isso podem repetir-se.
 * Atenção ao rate limit do login (5/min por IP).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true },
})

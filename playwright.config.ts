import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: join('tests', 'e2e'),
  fullyParallel: false,
  workers: 1,
  // Two-user flows sign in twice through the Auth emulator popup against a dev server.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:5179',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5179 --strictPort',
    url: 'http://127.0.0.1:5179',
    env: { VITE_FIREBASE_EMULATORS: 'true' },
    reuseExistingServer: false,
  },
});

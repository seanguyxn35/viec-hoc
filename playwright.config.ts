import { defineConfig, devices } from '@playwright/test';
import { loadEnvConfig } from '@next/env';

// Nạp .env.local giống Next.js (URL/key Supabase và tài khoản thử TEST_*).
loadEnvConfig(process.cwd());

// Đặt PLAYWRIGHT_BASE_URL=https://<app>.vercel.app để chạy lại test trên bản online.
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseURL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  // Các test dùng chung hai tài khoản thử nên chạy tuần tự cho dễ đọc kết quả.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // Mỗi thao tác gọi API -> Supabase (xác minh token + truy vấn); mạng chậm cần thời gian chờ dài hơn mặc định.
  timeout: 120_000,
  expect: { timeout: 30_000 },
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});

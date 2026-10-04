// Runs the tests against Chrome on the USB-connected Android phone
// (see tests/phone.js). One device, so tests run one at a time.
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  workers: 1,
  fullyParallel: false,
  timeout: 30_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: {
    command: 'node site/server.js',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});

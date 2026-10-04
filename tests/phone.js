// Playwright fixture that drives Chrome on the USB-connected Android phone.
// It talks to Chrome's DevTools socket over adb, so it needs neither desktop
// browsers nor Xiaomi's "USB debugging (Security settings)" permission.
const { test: base, expect, chromium } = require('@playwright/test');
const { execSync } = require('node:child_process');

const CDP_PORT = 9222;
const SITE_PORT = Number(process.env.PORT || 5173);

const adb = (args) =>
  execSync(`adb ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

function chromeIsRunning() {
  return adb('shell cat /proc/net/unix').includes('chrome_devtools_remote');
}

// Start Chrome if needed and always bring it to the foreground: Android stops
// rendering apps in the background, which stalls Playwright's actions.
async function ensureChrome() {
  adb('shell am start -n com.android.chrome/com.google.android.apps.chrome.Main');
  for (let i = 0; i < 20 && !chromeIsRunning(); i++) await new Promise((r) => setTimeout(r, 500));
  if (!chromeIsRunning()) throw new Error('Chrome DevTools socket not found on the phone');
}

exports.expect = expect;
exports.SITE = `http://localhost:${SITE_PORT}`;

exports.test = base.extend({
  // Worker-scoped: one connection to the phone for the whole run.
  phoneBrowser: [async ({}, use) => {
    if (!/\tdevice$/m.test(adb('devices'))) throw new Error('No authorized Android device (adb devices)');
    await ensureChrome();
    adb(`forward tcp:${CDP_PORT} localabstract:chrome_devtools_remote`);
    adb(`reverse tcp:${SITE_PORT} tcp:${SITE_PORT}`);   // phone's localhost -> this laptop
    const browser = await chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`);
    await use(browser);
    await browser.close();                              // disconnects; Chrome keeps running
    adb(`forward --remove tcp:${CDP_PORT}`);
    adb(`reverse --remove tcp:${SITE_PORT}`);
  }, { scope: 'worker' }],

  // Each test gets a fresh tab in the phone's Chrome, closed afterwards.
  page: async ({ phoneBrowser }, use) => {
    const page = await phoneBrowser.contexts()[0].newPage();
    // Android Chrome pauses rendering in background tabs, which would stall
    // Playwright's actionability checks: show the tab on screen.
    await page.bringToFront();
    await use(page);
    await page.close();
  },
});

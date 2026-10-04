# mobile-web-tests

Playwright tests that drive **Chrome on a USB-connected Android phone**.

- No desktop browsers are downloaded: the tests connect to the phone's Chrome
  DevTools socket through `adb` (`tests/phone.js`).
- The phone reaches the laptop's dev server at `http://localhost:5173` through
  `adb reverse`, so no Wi-Fi or IP addresses are involved.
- Each test opens a fresh tab and closes it afterwards; your other tabs are untouched.

## Requirements

- `adb` (Fedora: `sudo dnf install android-tools`) and Node.js
- Phone: Developer options → **USB debugging** on, computer authorized
  (`adb devices` shows `device`)
- Chrome installed on the phone

## Usage

```sh
npm install            # PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 is not needed after the first install
npm test               # run the tests on the phone
npm run report         # open the HTML report
npm run phone          # mirror the phone screen with scrcpy and watch the tests
```

Screenshots taken by the tests go to `screenshots/`.

## Testing your own site

Point `webServer.command` / `url` in `playwright.config.js` at your dev server
(and `PORT` if it is not 5173), then write tests with the `test` and `SITE`
exports from `tests/phone.js`:

```js
const { test, expect, SITE } = require('./phone');

test('home page loads', async ({ page }) => {
  await page.goto(SITE);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

## Notes

- The fixture always brings Chrome to the foreground: Android stops rendering
  apps in the background, which would stall Playwright's actions.
- Use `click()` rather than `tap()`: the tab comes from Chrome's existing
  context, which Playwright does not know is touch-enabled.

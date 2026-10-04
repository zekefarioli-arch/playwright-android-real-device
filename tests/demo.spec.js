const { test, expect, SITE } = require('./phone');

test('greets the user after submitting the form', async ({ page }) => {
  await page.goto(SITE);
  await expect(page).toHaveTitle('Mobile demo');

  await page.getByLabel('Your name').fill('Zeke');
  await page.getByRole('button', { name: 'Say hi' }).click();

  await expect(page.getByRole('status')).toHaveText('Hi, Zeke! 👋');
  await page.screenshot({ path: 'screenshots/greeting.png' });
});

test('shows the mobile menu on a phone-sized screen', async ({ page }) => {
  await page.goto(SITE);

  const width = await page.evaluate(() => window.innerWidth);
  expect(width).toBeLessThan(768);
  await expect(page.getByTestId('menu-mobile')).toBeVisible();
  await expect(page.getByTestId('menu-desktop')).toBeHidden();
});

test('reports the real device user agent', async ({ page }) => {
  await page.goto(SITE);
  const ua = await page.evaluate(() => navigator.userAgent);
  expect(ua).toContain('Android');
  expect(ua).toContain('Mobile');
});

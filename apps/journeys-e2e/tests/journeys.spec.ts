import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // 3 Minutes timeout for test as playing video takes time
  test.setTimeout(180000);
  await page.goto('https://your.nextstep.is/');

  await page.click('a[href="/fact-or-fiction"]');
  await page.getByRole('button', { name: 'Explore Now' }).click();
  await page.getByText('Yes, it’s a true story', {exact: false}).click();
  await page.getByRole('button', { name: 'One question remains' }).click();
  await page.getByText('The Son of God').click();
});
import { test, expect } from '@playwright/test';

test('journeys e2e test', async ({ page }) => {
  // 10 timeout for this test as it got videos (later we can use 10 seconds videos)
  test.setTimeout(600000);
  await page.goto('https://your.nextstep.is/');

  await page.click('a[href="/fact-or-fiction"]');
  await page.getByRole('button', { name: 'Explore Now' }).click();
  await page.getByText('Yes, it’s a true story', {exact: false}).click();
  await page.getByText('One question remains', {exact: false}).click();
  // await page.getByRole('button', { name: 'One question remains' }).click();
  await page.getByText('The Son of God').click();
});
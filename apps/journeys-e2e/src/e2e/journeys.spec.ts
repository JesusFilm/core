import { expect, test } from '@playwright/test'

// Set a longer timeout for this test
test.setTimeout(120000);

/* 
Test a journey by following the journey's selection buttons
*/
test('Journey: Can I Know Him: Check video button and timeline', async ({ page }) => {
  // Navigate to the page
  await page.goto('https://your.nextstep.is/');
  
  // Click on the third link in the navigation bar (Can I Know Him?)
  await page.getByRole('link').filter({ hasText: /^$/ }).nth(3).click();
  await page.getByRole('button', { name: 'Explore Now' }).click();
  await expect(page.getByRole('button', { name: 'bar-play-button' })).toBeVisible();
  await expect(page.getByTestId('desktop-controls').getByText(':00 / 2:41')).toBeVisible();
})

import { shortest } from '@antiwork/shortest'

shortest(
  'Open the Watch Modern Studio landing page and verify the hero call to action links are ready for visitors.',
)
  .before(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })
  .expect('Hero heading and CTA links are visible', async ({ page }) => {
    await page
      .getByRole('heading', { name: /Turn any spark of faith into something the world can see\./i })
      .waitFor({ state: 'visible' })
    await page.getByRole('link', { name: /Try It Now/i }).waitFor({ state: 'visible' })
    await page
      .getByRole('link', { name: /See Conversation Guidance/i })
      .waitFor({ state: 'visible' })
  })

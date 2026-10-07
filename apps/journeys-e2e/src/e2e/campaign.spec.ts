import { expect, test } from '@playwright/test'

import { CampaignPage } from '../pages/campaign-page'

/**
 * Public campaign page: landing page renders the hero and region switcher,
 * the region page's Copy link equals the URL the QR canvas encodes (the
 * Share Link). The campaign is created and published by
 * apps/journeys-admin-e2e/src/e2e/campaign-builder/campaign-builder.spec.ts,
 * which attaches the generated slug to its report as the `campaign-slug`
 * annotation.
 *
 * Setup:
 * - Set CAMPAIGN_E2E_SLUG to that slug; without it the scenario is skipped.
 * - The admin e2e user's team needs the `campaignBuilder` flag on in the
 *   preview environment for the campaign to have been created at all.
 */
const CAMPAIGN_SLUG = process.env.CAMPAIGN_E2E_SLUG
// Kept in sync with the admin campaign-builder spec
const HERO_TITLE = 'Playwright hero title'

test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

test('campaign landing page renders and the region page Copy link equals the QR target', async ({
  page
}) => {
  test.skip(
    CAMPAIGN_SLUG == null || CAMPAIGN_SLUG === '',
    'CAMPAIGN_E2E_SLUG is not set: run the admin campaign-builder spec first and pass its campaign-slug'
  )

  const campaignSlug = CAMPAIGN_SLUG as string
  const campaign = new CampaignPage(page)

  await campaign.openLandingPage(campaignSlug, HERO_TITLE)
  await campaign.verifyRegionSwitcherCard()

  await campaign.openRegionPage(campaignSlug)
  const copiedLink = await campaign.readCopiedLink()
  const qrCodeTarget = await campaign.readQrCodeTarget()
  expect(copiedLink).toBe(qrCodeTarget)
})

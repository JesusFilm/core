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
 * Human-run, on demand: it is tagged @manual, so the `e2e` target (deploy
 * checks and nightly) skips it. Run the admin half, then this half:
 * 1. pnpm exec nx run journeys-admin-e2e:e2e-campaign -- campaign-builder.spec
 *    with CAMPAIGN_E2E_KEEP=true, so the campaign is still there afterwards.
 * 2. pnpm exec nx run journeys-e2e:e2e-campaign -- campaign.spec
 *    with CAMPAIGN_E2E_SLUG set to the `campaign-slug` annotation of the
 *    admin report, and DEPLOYMENT_URL (or JOURNEYS_DAILY_E2E) set to the
 *    journeys app the campaign was published on.
 * 3. Delete the campaign in the admin editor (Settings > Delete campaign).
 *
 * Setup:
 * - CAMPAIGN_E2E_SLUG is required; the scenario fails without it.
 * - The admin e2e user's team needs the `campaignBuilder` flag on in the
 *   preview environment for the campaign to have been created at all.
 */
const CAMPAIGN_SLUG = process.env.CAMPAIGN_E2E_SLUG
// Kept in sync with the admin campaign-builder spec
const HERO_TITLE = 'Playwright hero title'

test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

test(
  'campaign landing page renders and the region page Copy link equals the QR target',
  { tag: '@manual' },
  async ({ page }) => {
    if (CAMPAIGN_SLUG == null || CAMPAIGN_SLUG === '')
      throw new Error(
        'CAMPAIGN_E2E_SLUG is not set: run the admin campaign-builder spec first and pass its campaign-slug'
      )

    const campaign = new CampaignPage(page)

    await campaign.openLandingPage(CAMPAIGN_SLUG, HERO_TITLE)
    await campaign.verifyRegionSwitcherCard()

    await campaign.openRegionPage(CAMPAIGN_SLUG)
    const copiedLink = await campaign.readCopiedLink()
    const qrCodeTarget = await campaign.readQrCodeTarget()
    expect(copiedLink).toBe(qrCodeTarget)
  }
)

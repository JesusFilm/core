import { test } from '@playwright/test'

import { CampaignPage } from '../pages/campaign-page'

/**
 * Public campaign page after the editor v2 pass: the landing page renders the
 * hero with the background the editor set and the Rich text section added
 * below it. The campaign is created, edited and published by
 * apps/journeys-admin-e2e/src/e2e/campaign-builder/campaign-editor-v2.spec.ts,
 * which attaches the generated slug to its report as the `campaign-v2-slug`
 * annotation.
 *
 * Human-run, on demand: it is tagged @manual, so the `e2e` target (deploy
 * checks and nightly) skips it. Run the admin half, then this half:
 * 1. pnpm exec nx run journeys-admin-e2e:e2e-campaign -- campaign-editor-v2.spec
 *    with CAMPAIGN_E2E_KEEP=true, so the campaign is still there afterwards.
 * 2. pnpm exec nx run journeys-e2e:e2e-campaign -- campaign-editor-v2.spec
 *    with CAMPAIGN_E2E_V2_SLUG set to the `campaign-v2-slug` annotation of
 *    the admin report, and DEPLOYMENT_URL (or JOURNEYS_DAILY_E2E) set to the
 *    journeys app the campaign was published on.
 * 3. Delete the campaign in the admin editor (Settings > Delete campaign).
 *
 * Setup:
 * - CAMPAIGN_E2E_V2_SLUG is required; the scenario fails without it.
 * - The admin e2e user's team needs the `campaignBuilder` flag on in the
 *   preview environment for the campaign to have been created at all.
 */
const CAMPAIGN_SLUG = process.env.CAMPAIGN_E2E_V2_SLUG
// The campaign's hero title is the unedited default
const HERO_TITLE = 'Share the story of Christmas'
// The Primary background kind paints the theme's primary colour; a new
// campaign's theme is seeded from the Light preset (#C52D3A)
const HERO_BACKGROUND_COLOR = 'rgb(197, 45, 58)'
// Kept in sync with the admin editor-v2 spec
const RICH_TEXT_TITLE = 'Playwright rich text title'

test(
  'campaign landing page renders the restyled hero and the added Rich text section',
  { tag: '@manual' },
  async ({ page }) => {
    if (CAMPAIGN_SLUG == null || CAMPAIGN_SLUG === '')
      throw new Error(
        'CAMPAIGN_E2E_V2_SLUG is not set: run the admin campaign-editor-v2 spec first and pass its campaign-v2-slug'
      )

    const campaign = new CampaignPage(page)

    await campaign.openLandingPageShowingSection(CAMPAIGN_SLUG, RICH_TEXT_TITLE)
    await campaign.verifySectionBackground(HERO_TITLE, HERO_BACKGROUND_COLOR)
    await campaign.verifySectionBelowHero(HERO_TITLE, RICH_TEXT_TITLE)
  }
)

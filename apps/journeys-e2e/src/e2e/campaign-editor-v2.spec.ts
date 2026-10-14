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
 * Setup:
 * - Set CAMPAIGN_E2E_V2_SLUG to that slug; without it the scenario is skipped.
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

test('campaign landing page renders the restyled hero and the added Rich text section', async ({
  page
}) => {
  test.skip(
    CAMPAIGN_SLUG == null || CAMPAIGN_SLUG === '',
    'CAMPAIGN_E2E_V2_SLUG is not set: run the admin campaign-editor-v2 spec first and pass its campaign-v2-slug'
  )

  const campaignSlug = CAMPAIGN_SLUG as string
  const campaign = new CampaignPage(page)

  await campaign.openLandingPageShowingSection(campaignSlug, RICH_TEXT_TITLE)
  await campaign.verifySectionBackground(HERO_TITLE, HERO_BACKGROUND_COLOR)
  await campaign.verifySectionBelowHero(HERO_TITLE, RICH_TEXT_TITLE)
})

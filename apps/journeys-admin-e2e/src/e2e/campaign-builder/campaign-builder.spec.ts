import { expect, test } from '../../fixtures/authenticated'
import {
  CampaignBuilderPage,
  DEFAULT_HERO_TITLE
} from '../../pages/campaign-builder-page'

/**
 * Campaign builder: create -> edit hero -> add region -> link journey ->
 * publish. The public half (landing page, region page, Copy link equals the
 * QR target) is apps/journeys-e2e/src/e2e/campaign.spec.ts.
 *
 * Setup:
 * - The e2e user's team needs the `campaignBuilder` LaunchDarkly flag on in
 *   the preview environment, or /campaigns sends the user home.
 * - A published journey must be reachable at CAMPAIGN_E2E_JOURNEY_URL
 *   (default: the public Fact or Fiction journey the journeys-e2e suite
 *   already depends on).
 * - The campaign slug is generated, so it is attached to the report as the
 *   `campaign-slug` annotation: pass it to the journeys-e2e suite as
 *   CAMPAIGN_E2E_SLUG.
 */
const JOURNEY_URL =
  process.env.CAMPAIGN_E2E_JOURNEY_URL ??
  'https://your.nextstep.is/fact-or-fiction'
const CAMPAIGN_TITLE = `Playwright campaign ${Date.now()}`
const DEFAULT_LANGUAGE = 'English'
// Kept in sync with apps/journeys-e2e/src/e2e/campaign.spec.ts
const HERO_TITLE = 'Playwright hero title'

test('create a campaign, add a region, link a journey and publish', async ({
  authedPage
}) => {
  const campaignBuilder = new CampaignBuilderPage(authedPage)

  await campaignBuilder.goToCampaigns()
  await campaignBuilder.createCampaign(CAMPAIGN_TITLE, DEFAULT_LANGUAGE)
  await campaignBuilder.verifyEditorOpenedOnLandingPage(CAMPAIGN_TITLE)

  await campaignBuilder.editHeroTitle(HERO_TITLE)
  await campaignBuilder.undo()
  await expect(campaignBuilder.heroTitleInput).toHaveValue(DEFAULT_HERO_TITLE)
  await campaignBuilder.redo()
  await expect(campaignBuilder.heroTitleInput).toHaveValue(HERO_TITLE)

  await campaignBuilder.addRegionFromSwitcher()
  await campaignBuilder.openRegionPage()
  const shareLink =
    await campaignBuilder.linkJourneyToDefaultShareLanguage(JOURNEY_URL)

  const slug = await campaignBuilder.getCampaignSlug()

  test
    .info()
    .annotations.push(
      { type: 'campaign-slug', description: slug },
      { type: 'share-link', description: shareLink }
    )

  await campaignBuilder.publish()
})

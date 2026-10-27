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
 * Human-run, on demand: it is tagged @manual, so `e2e-full` (nightly) skips
 * it. Run it with
 *   pnpm exec nx run journeys-admin-e2e:e2e-campaign
 *
 * Setup:
 * - The e2e user's team needs the `campaignBuilder` LaunchDarkly flag on in
 *   the preview environment, or the dashboard has no Team Campaigns tab.
 * - A published journey must be reachable at CAMPAIGN_E2E_JOURNEY_URL
 *   (default: the public Fact or Fiction journey the journeys-e2e suite
 *   already depends on).
 * - The campaign is deleted at the end of the run. To run the public half
 *   against it, keep it with CAMPAIGN_E2E_KEEP=true, read the generated slug
 *   from the `campaign-slug` annotation in the report, run the public half
 *   with it as CAMPAIGN_E2E_SLUG (see the journeys-e2e spec), then delete the
 *   campaign by hand (Settings > Delete campaign).
 */
const JOURNEY_URL =
  process.env.CAMPAIGN_E2E_JOURNEY_URL ??
  'https://your.nextstep.is/fact-or-fiction'
const KEEP_CAMPAIGN = process.env.CAMPAIGN_E2E_KEEP === 'true'
const CAMPAIGN_TITLE = `Playwright campaign ${Date.now()}`
const DEFAULT_LANGUAGE = 'English'
// Kept in sync with apps/journeys-e2e/src/e2e/campaign.spec.ts
const HERO_TITLE = 'Playwright hero title'

// The cleanup counts against the test's own timeout, which a slow cold run can
// use up; it gets its own budget so the campaign is not left behind
const CLEANUP_TIMEOUT_MS = 60 * 1000

test.afterEach(async ({ authedPage }) => {
  if (KEEP_CAMPAIGN) return

  test.setTimeout(test.info().timeout + CLEANUP_TIMEOUT_MS)

  const deleted = await new CampaignBuilderPage(authedPage).deleteCampaign()
  if (!deleted) {
    test.info().annotations.push({
      type: 'cleanup',
      description: 'No campaign editor was open, so nothing was deleted'
    })
  }
})

test(
  'create a campaign, add a region, link a journey and publish',
  { tag: '@manual' },
  async ({ authedPage }) => {
    const campaignBuilder = new CampaignBuilderPage(authedPage)

    await campaignBuilder.goToCampaigns()
    await campaignBuilder.createCampaign(CAMPAIGN_TITLE, DEFAULT_LANGUAGE)
    await campaignBuilder.verifyEditorOpenedOnLandingPage(CAMPAIGN_TITLE)
    // Read while nothing is selected, so Settings shows the campaign.
    const slug = await campaignBuilder.getCampaignSlug()

    await campaignBuilder.editHeroTitle(HERO_TITLE)
    await campaignBuilder.undo()
    await expect(campaignBuilder.heroTitleInput).toHaveValue(DEFAULT_HERO_TITLE)
    await campaignBuilder.redo()
    await expect(campaignBuilder.heroTitleInput).toHaveValue(HERO_TITLE)

    await campaignBuilder.addRegionFromSwitcher()
    await campaignBuilder.openRegionPage()
    const shareLink =
      await campaignBuilder.linkJourneyToDefaultShareLanguage(JOURNEY_URL)

    test
      .info()
      .annotations.push(
        { type: 'campaign-slug', description: slug },
        { type: 'share-link', description: shareLink }
      )

    await campaignBuilder.publish()
  }
)

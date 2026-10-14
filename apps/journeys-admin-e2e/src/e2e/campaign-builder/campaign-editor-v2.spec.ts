import { test } from '../../fixtures/authenticated'
import { CampaignBuilderPage } from '../../pages/campaign-builder-page'

/**
 * Campaign editor v2: open a campaign -> select the hero in the Navigator ->
 * change its background kind in the Inspector's Style tab -> add a Rich text
 * section below it from the Add Panel and type its title -> publish from the
 * rail's Publish button. The public half (the hero background and the new
 * section render on the landing page) is
 * apps/journeys-e2e/src/e2e/campaign-editor-v2.spec.ts. It is human-run:
 * Siyang reviews its report before the editor v2 integration PR merges.
 *
 * Setup:
 * - The e2e user's team needs the `campaignBuilder` LaunchDarkly flag on in
 *   the preview environment, or /campaigns sends the user home.
 * - The e2e user must be a manager of that team: Publish is disabled for
 *   anyone else.
 * - The campaign slug is generated, so it is attached to the report as the
 *   `campaign-v2-slug` annotation: pass it to the journeys-e2e suite as
 *   CAMPAIGN_E2E_V2_SLUG.
 */
const CAMPAIGN_TITLE = `Playwright editor v2 campaign ${Date.now()}`
const DEFAULT_LANGUAGE = 'English'
// Kept in sync with apps/journeys-e2e/src/e2e/campaign-editor-v2.spec.ts
const HERO_BACKGROUND_KIND = 'Primary'
const RICH_TEXT_TITLE = 'Playwright rich text title'

test('select the hero in the Navigator, restyle it, add a Rich text section and publish', async ({
  authedPage
}) => {
  const campaignBuilder = new CampaignBuilderPage(authedPage)

  await campaignBuilder.goToCampaigns()
  await campaignBuilder.createCampaign(CAMPAIGN_TITLE, DEFAULT_LANGUAGE)
  await campaignBuilder.verifyEditorOpenedOnLandingPage(CAMPAIGN_TITLE)

  await campaignBuilder.selectHeroInNavigator()
  await campaignBuilder.setBackgroundKind(HERO_BACKGROUND_KIND)
  await campaignBuilder.addRichTextSectionBelowSelection(RICH_TEXT_TITLE)

  const slug = await campaignBuilder.getCampaignSlug()

  test.info().annotations.push({ type: 'campaign-v2-slug', description: slug })

  await campaignBuilder.publish()
})

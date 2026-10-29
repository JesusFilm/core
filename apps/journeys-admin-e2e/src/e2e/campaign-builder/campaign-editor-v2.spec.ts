import { test } from '../../fixtures/authenticated'
import { DEFAULT_HERO_TITLE } from '../../pages/campaign-builder-page'
import { CampaignPage } from '../../pages/campaign-page'

/**
 * Campaign editor v2: open a campaign -> select the hero in the Navigator ->
 * change its background kind in the Inspector's Style tab -> add a Rich text
 * section below it from the Add Panel and type its title -> publish from the
 * rail's Publish button, then the public page at the address the editor
 * shows: the landing page renders the hero with the background the editor set
 * and the Rich text section below it.
 *
 * Runs in the Daily E2E (`journeys-admin-e2e:e2e-full`).
 *
 * Setup:
 * - Needs `campaignBuilder` on for the Playwright User (evaluated per user);
 *   it is on for everyone on stage, where the Daily E2E runs.
 * - The Playwright User must be a manager of its active team: the
 *   `campaignBuilder` fixture deletes the campaign at the end of the run, and
 *   Delete campaign is offered to managers only. (Publish is open to any
 *   member or manager.)
 * - The public checks run on the viewer the admin links to
 *   (`NEXT_PUBLIC_JOURNEYS_URL`), which must read the same API.
 */
// The e2eCleanup sweep finds a leftover campaign by this exact prefix
// followed by Date.now() (`PLAYWRIGHT_CAMPAIGN_TITLE_PREFIXES`)
const CAMPAIGN_TITLE = `Playwright editor v2 campaign ${Date.now()}`
const HERO_BACKGROUND_KIND = 'Primary'
// The Primary background kind paints the theme's primary colour; a new
// campaign's theme is seeded from the Light preset (#C52D3A)
const HERO_BACKGROUND_COLOR = 'rgb(197, 45, 58)'
const RICH_TEXT_TITLE = 'Playwright rich text title'

test('select the hero in the Navigator, restyle it, add a Rich text section and publish', async ({
  campaignBuilder,
  context
}) => {
  // Create, edits, publish and the public page's ISR wait each allow up to
  // 90s, which can exceed the 3 minute test timeout on a cold run
  test.slow()

  await campaignBuilder.goToCampaigns()
  await campaignBuilder.createCampaign(CAMPAIGN_TITLE)
  await campaignBuilder.verifyEditorOpenedOnLandingPage(CAMPAIGN_TITLE)
  // Read while nothing is selected, so Settings shows the campaign.
  await campaignBuilder.verifyCanDeleteCampaign()
  const publicAddress = await campaignBuilder.getPublicAddress()

  await campaignBuilder.selectHeroInNavigator()
  await campaignBuilder.setBackgroundKind(HERO_BACKGROUND_KIND)
  await campaignBuilder.addRichTextSectionBelowSelection(RICH_TEXT_TITLE)

  test
    .info()
    .annotations.push({ type: 'campaign-address', description: publicAddress })

  await campaignBuilder.publish()

  // A page of its own, so the editor stays open for the fixture's cleanup
  const campaign = new CampaignPage(await context.newPage())
  await campaign.openLandingPageShowingSection(publicAddress, RICH_TEXT_TITLE)
  // The hero title is the unedited seed
  await campaign.verifySectionBackground(
    DEFAULT_HERO_TITLE,
    HERO_BACKGROUND_COLOR
  )
  await campaign.verifySectionBelowHero(DEFAULT_HERO_TITLE, RICH_TEXT_TITLE)
})

import { expect, test } from '../../fixtures/authenticated'
import {
  CAMPAIGN_EDITOR_VIEWPORT,
  DEFAULT_HERO_TITLE
} from '../../pages/campaign-builder-page'
import { CampaignPage } from '../../pages/campaign-page'
import { JourneyPage } from '../../pages/journey-page'

test.use({ viewport: CAMPAIGN_EDITOR_VIEWPORT })

/**
 * Campaign builder: create -> edit the hero title (with undo and redo) ->
 * select the hero in the Navigator and change its background kind in the
 * Inspector's Style tab -> add a Rich text section below it from the Add
 * Panel -> add a region -> link a journey -> publish, then the public page at
 * the address the editor shows: the landing page renders the hero with the
 * background the editor set, the Rich text section below it and the region
 * switcher, and the region page's Share Link (the target of its Open link)
 * equals the URL the QR canvas encodes and the Share Link the editor linked.
 *
 * Runs in the Daily E2E (`journeys-admin-e2e:e2e-full`).
 *
 * Setup:
 * - Needs `campaignBuilder` on for the Playwright User (evaluated per user);
 *   it is on for everyone on stage, where the Daily E2E runs.
 * - The Playwright User must be a manager of its one team titled
 *   PLAYWRIGHT_TEAM_NAME, which `goToCampaigns` selects: the
 *   `campaignBuilder` fixture deletes the campaign at the end of the run,
 *   and Delete campaign is offered to managers only.
 * - The journey linked is one the run creates first: a new journey is
 *   published at once, and its owner can link it. The e2eCleanup sweep
 *   deletes it later with the Playwright User's other journeys.
 * - The public checks run on the viewer the admin links to
 *   (`NEXT_PUBLIC_JOURNEYS_URL`), which must read the same API.
 */
// The e2eCleanup sweep finds a leftover campaign by this exact prefix
// followed by Date.now() (`PLAYWRIGHT_CAMPAIGN_TITLE_PREFIXES`)
const CAMPAIGN_TITLE = `Playwright campaign ${Date.now()}`
const HERO_TITLE = 'Playwright hero title'
const HERO_BACKGROUND_KIND = 'Primary'
// The Primary background kind paints the theme's primary colour; a new
// campaign's theme is seeded from the Light preset (#C52D3A)
const HERO_BACKGROUND_COLOR = 'rgb(197, 45, 58)'
const RICH_TEXT_TITLE = 'Playwright rich text title'

test('create a campaign, edit the landing page, add a region, link a journey and publish', async ({
  authedPage,
  campaignBuilder,
  context
}) => {
  // Create, edits, linking a journey on a cold API, publish and the public
  // page's ISR wait each allow up to 90s, which can exceed the 3 minute test
  // timeout on a cold run
  test.slow()

  // Selects the team first, so the journey is created in it too
  await campaignBuilder.goToCampaigns()
  await authedPage.goto('/')
  const journeyPage = new JourneyPage(authedPage)
  await journeyPage.clickCreateCustomJourney()
  const journeyUrl = await journeyPage.getPublicUrlFromShareDialog()

  await campaignBuilder.goToCampaigns()
  await campaignBuilder.createCampaign(CAMPAIGN_TITLE)
  await campaignBuilder.verifyEditorOpenedOnLandingPage(CAMPAIGN_TITLE)
  // Read while nothing is selected, so Settings shows the campaign.
  await campaignBuilder.verifyCanDeleteCampaign()
  const publicAddress = await campaignBuilder.getPublicAddress()

  await campaignBuilder.editHeroTitle(HERO_TITLE)
  await campaignBuilder.undo()
  await expect(campaignBuilder.heroTitleInput).toHaveValue(DEFAULT_HERO_TITLE)
  await campaignBuilder.redo()
  await expect(campaignBuilder.heroTitleInput).toHaveValue(HERO_TITLE)

  await campaignBuilder.selectHeroInNavigator()
  await campaignBuilder.setBackgroundKind(HERO_BACKGROUND_KIND)
  await campaignBuilder.addRichTextSectionBelowSelection(RICH_TEXT_TITLE)

  await campaignBuilder.addRegionFromSwitcher()
  await campaignBuilder.openRegionPage()
  const shareLink =
    await campaignBuilder.linkJourneyToDefaultShareLanguage(journeyUrl)

  test
    .info()
    .annotations.push(
      { type: 'campaign-address', description: publicAddress },
      { type: 'share-link', description: shareLink }
    )

  await campaignBuilder.publish()

  // A page of its own, so the editor stays open for the fixture's cleanup
  const campaign = new CampaignPage(await context.newPage())
  await campaign.openLandingPageShowingSection(publicAddress, RICH_TEXT_TITLE)
  await campaign.verifySectionBackground(HERO_TITLE, HERO_BACKGROUND_COLOR)
  await campaign.verifySectionBelowHero(HERO_TITLE, RICH_TEXT_TITLE)
  await campaign.verifyRegionSwitcherCard()

  await campaign.openRegionPage(publicAddress)
  const publicShareLink = await campaign.readShareLink()
  const qrCodeTarget = await campaign.readQrCodeTarget()
  expect(publicShareLink).toBe(qrCodeTarget)
  // Both sides above render the same value, so tie the public page to the
  // Share Link the editor linked
  expect(publicShareLink.replace(/^https?:\/\//, '')).toBe(shareLink)
})

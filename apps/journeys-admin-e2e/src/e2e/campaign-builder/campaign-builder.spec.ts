import { expect, test } from '../../fixtures/authenticated'
import { DEFAULT_HERO_TITLE } from '../../pages/campaign-builder-page'
import { CampaignPage } from '../../pages/campaign-page'

/**
 * Campaign builder: create -> edit hero -> add region -> link journey ->
 * publish, then the public page at the address the editor shows: the landing
 * page renders the hero and region switcher, and the region page's Share Link
 * (the target of its Open link) equals the URL the QR canvas encodes.
 *
 * Runs in the Daily E2E (`journeys-admin-e2e:e2e-full`).
 *
 * Setup:
 * - Needs `campaignBuilder` on for the Playwright User (evaluated per user);
 *   it is on for everyone on stage, where the Daily E2E runs.
 * - The Playwright User must be a manager of its active team: the
 *   `campaignBuilder` fixture deletes the campaign at the end of the run, and
 *   Delete campaign is offered to managers only.
 * - The journey linked is the one whose slug ends CAMPAIGN_E2E_JOURNEY_URL
 *   (default: the public Fact or Fiction journey the journeys-e2e suite
 *   already depends on). Only the path counts: the API ignores the host and
 *   looks the slug up in its own database, where it must be published.
 * - The public checks run on the viewer the admin links to
 *   (`NEXT_PUBLIC_JOURNEYS_URL`), which must read the same API.
 */
const JOURNEY_URL =
  process.env.CAMPAIGN_E2E_JOURNEY_URL ??
  'https://your.nextstep.is/fact-or-fiction'
// The e2eCleanup sweep finds a leftover campaign by this exact prefix
// followed by Date.now() (`PLAYWRIGHT_CAMPAIGN_TITLE_PREFIXES`)
const CAMPAIGN_TITLE = `Playwright campaign ${Date.now()}`
const HERO_TITLE = 'Playwright hero title'

test('create a campaign, add a region, link a journey and publish', async ({
  campaignBuilder,
  context
}) => {
  // Create, edits, linking a journey on a cold API, publish and the public
  // page's ISR wait each allow up to 90s, which can exceed the 3 minute test
  // timeout on a cold run
  test.slow()

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

  await campaignBuilder.addRegionFromSwitcher()
  await campaignBuilder.openRegionPage()
  const shareLink =
    await campaignBuilder.linkJourneyToDefaultShareLanguage(JOURNEY_URL)

  test
    .info()
    .annotations.push(
      { type: 'campaign-address', description: publicAddress },
      { type: 'share-link', description: shareLink }
    )

  await campaignBuilder.publish()

  // A page of its own, so the editor stays open for the fixture's cleanup
  const campaign = new CampaignPage(await context.newPage())
  await campaign.openLandingPage(publicAddress, HERO_TITLE)
  await campaign.verifyRegionSwitcherCard()

  await campaign.openRegionPage(publicAddress)
  const publicShareLink = await campaign.readShareLink()
  const qrCodeTarget = await campaign.readQrCodeTarget()
  expect(publicShareLink).toBe(qrCodeTarget)
})

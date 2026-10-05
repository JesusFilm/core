import { Prisma } from '@core/prisma/journeys/client'

/**
 * The seed tables of PRD §14: every value passes every validation rule. Ids,
 * scoping and ordering are added by `seedCampaign`.
 */
export type SectionSeed = Omit<
  Prisma.CampaignBlockUncheckedCreateInput,
  'id' | 'campaignId' | 'pageId' | 'regionId' | 'parentBlockId' | 'parentOrder'
> & { typename: string }

export const LANDING_HERO = 0
export const LANDING_REGION_SWITCHER = 1
export const LANDING_VIDEO_CAROUSEL = 2

export const LANDING_SECTION_SEED: readonly SectionSeed[] = [
  {
    typename: 'CampaignHeroBlock',
    eyebrow: 'Christmas 2026',
    title: 'Share the story of Christmas',
    lede: 'Pick your region to find a journey in your language, ready to share.',
    align: 'center',
    backgroundKind: 'none'
  },
  {
    typename: 'CampaignRegionSwitcherBlock',
    title: 'Choose your region',
    switcherVariant: 'cards',
    backgroundKind: 'none'
  },
  {
    typename: 'CampaignVideoCarouselBlock',
    eyebrow: 'Watch',
    title: 'Films for the season',
    backgroundKind: 'surface'
  },
  {
    typename: 'CampaignJourneyListBlock',
    eyebrow: 'Journeys',
    title: 'Ready-made journeys',
    lede: 'Interactive stories your friends can walk through on their phone.',
    display: 'grid',
    backgroundKind: 'none'
  },
  {
    typename: 'CampaignAnalyticsBlock',
    eyebrow: 'Around the world',
    title: 'Where the story is spreading',
    showMap: true,
    backgroundKind: 'contrast'
  }
]

/** The hero's one button Extra, scrolling to the landing Region Switcher. */
export const LANDING_HERO_BUTTON_SEED: SectionSeed = {
  typename: 'CampaignButtonBlock',
  label: 'Choose your region',
  placement: 'below'
}

export const REGION_SECTION_SEED: readonly SectionSeed[] = [
  {
    typename: 'CampaignRegionHeaderBlock',
    intro: 'A Christmas journey chosen and contextualised by your regional team.',
    backgroundKind: 'none'
  },
  {
    typename: 'CampaignRegionShareBlock',
    title: 'Share this journey',
    intro: 'Pick a language, preview it, and share the link or QR code.',
    backgroundKind: 'surface'
  },
  {
    typename: 'CampaignJourneyListBlock',
    eyebrow: 'More journeys',
    title: 'Other journeys for this region',
    display: 'grid',
    backgroundKind: 'none'
  },
  {
    typename: 'CampaignAnalyticsBlock',
    eyebrow: 'In this region',
    title: 'Where the story is spreading',
    showMap: true,
    backgroundKind: 'contrast'
  },
  {
    typename: 'CampaignRegionSwitcherBlock',
    title: 'Other regions',
    switcherVariant: 'cards',
    backgroundKind: 'none'
  }
]

export const HEADER_SEED: SectionSeed = {
  typename: 'CampaignHeaderBlock',
  backgroundKind: 'none'
}

/** Header nav buttons, each a ScrollToBlockAction to a landing section index. */
export const HEADER_NAV_SEED: ReadonlyArray<
  SectionSeed & { scrollToLandingSection: number }
> = [
  {
    typename: 'CampaignButtonBlock',
    label: 'Home',
    placement: 'below',
    scrollToLandingSection: LANDING_HERO
  },
  {
    typename: 'CampaignButtonBlock',
    label: 'Resources',
    placement: 'below',
    scrollToLandingSection: LANDING_VIDEO_CAROUSEL
  }
]

export const FOOTER_SEED: SectionSeed = {
  typename: 'CampaignFooterBlock',
  backgroundKind: 'surface'
}

export function footerCopyrightSeed(year: number): SectionSeed {
  return {
    typename: 'CampaignTypographyBlock',
    content: `© ${year} Jesus Film Project`,
    typographyVariant: 'caption',
    placement: 'below'
  }
}

/** Footer links, each a LinkAction. */
export const FOOTER_LINK_SEED: ReadonlyArray<SectionSeed & { url: string }> = [
  {
    typename: 'CampaignButtonBlock',
    label: 'Terms of Use',
    buttonVariant: 'text',
    buttonSize: 'small',
    placement: 'below',
    url: 'https://www.cru.org/us/en/about/terms-of-use.html'
  },
  {
    typename: 'CampaignButtonBlock',
    label: 'Your Privacy',
    buttonVariant: 'text',
    buttonSize: 'small',
    placement: 'below',
    url: 'https://www.cru.org/us/en/about/privacy.html'
  }
]

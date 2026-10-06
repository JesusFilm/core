import {
  ButtonSize,
  ButtonVariant,
  CampaignBackgroundKind,
  CampaignButtonRadius,
  CampaignChildPlacement,
  CampaignJourneyListDisplay,
  CampaignMediaSide,
  CampaignPageKind,
  CampaignRadius,
  CampaignStringKey,
  CampaignSwitcherVariant,
  JourneyStatus,
  ThemeMode,
  TypographyAlign,
  TypographyVariant,
  VideoBlockSource,
  VideoLabel
} from '../../../__generated__/globalTypes'

import type { CampaignPublicBlockFields } from './__generated__/CampaignPublicBlockFields'
import type {
  CampaignPublicFields,
  CampaignPublicFields_regions,
  CampaignPublicFields_strings,
  CampaignPublicFields_theme
} from './__generated__/CampaignPublicFields'

/**
 * One published `CampaignPublic` payload as `campaignPublic` returns it, after
 * the VideoLibrary `data.ts` precedent: the Light theme; both pages with the
 * seed sections, which between them cover every section typename, plus
 * Typography and Button Extras; the chrome; the seventeen strings; two
 * regions with one linked journey each and resolved URLs. Every seam-2 spec
 * renders this. Later tickets extend it, never fork it.
 */

export const CAMPAIGN_ID = 'campaignId'
export const LANDING_PAGE_ID = 'landingPageId'
export const REGION_PAGE_ID = 'regionPageId'

type SectionTypename = Exclude<
  CampaignPublicBlockFields['__typename'],
  'CampaignTypographyBlock' | 'CampaignButtonBlock'
>

const SECTION_DEFAULTS = {
  campaignId: CAMPAIGN_ID,
  pageId: null as string | null,
  regionId: null as string | null,
  parentBlockId: null as string | null,
  parentOrder: null as number | null,
  backgroundKind: CampaignBackgroundKind.none,
  backgroundColor: null as string | null,
  coverBlockId: null as string | null,
  backgroundOverlay: null,
  headingColor: null as string | null,
  textColor: null as string | null,
  buttonColor: null as string | null,
  buttonTextColor: null as string | null,
  accentColor: null as string | null
}

function section<T extends SectionTypename>(
  typename: T,
  row: Omit<
    Extract<CampaignPublicBlockFields, { __typename: T }>,
    '__typename' | keyof typeof SECTION_DEFAULTS
  > &
    Partial<typeof SECTION_DEFAULTS> & { id: string }
): Extract<CampaignPublicBlockFields, { __typename: T }> {
  return {
    __typename: typename,
    ...SECTION_DEFAULTS,
    ...row
  } as unknown as Extract<CampaignPublicBlockFields, { __typename: T }>
}

type TypographyBlock = Extract<
  CampaignPublicBlockFields,
  { __typename: 'CampaignTypographyBlock' }
>
type ButtonBlock = Extract<
  CampaignPublicBlockFields,
  { __typename: 'CampaignButtonBlock' }
>

function typography(
  row: Pick<TypographyBlock, 'id' | 'content'> & Partial<TypographyBlock>
): TypographyBlock {
  return {
    __typename: 'CampaignTypographyBlock',
    campaignId: CAMPAIGN_ID,
    pageId: null,
    regionId: null,
    parentBlockId: null,
    parentOrder: 0,
    typographyVariant: null,
    align: null,
    color: null,
    placement: CampaignChildPlacement.below,
    ...row
  }
}

function button(
  row: Pick<ButtonBlock, 'id' | 'label' | 'action'> & Partial<ButtonBlock>
): ButtonBlock {
  return {
    __typename: 'CampaignButtonBlock',
    campaignId: CAMPAIGN_ID,
    pageId: null,
    regionId: null,
    parentBlockId: null,
    parentOrder: 0,
    buttonVariant: null,
    size: null,
    align: null,
    color: null,
    labelColor: null,
    placement: CampaignChildPlacement.below,
    ...row
  }
}

export const lightTheme: CampaignPublicFields_theme = {
  __typename: 'CampaignTheme',
  id: 'campaignThemeId',
  themeMode: ThemeMode.light,
  headerFont: null,
  bodyFont: null,
  labelFont: null,
  primaryColor: '#C52D3A',
  accentColor: '#F2B544',
  backgroundColor: '#FBF7F1',
  surfaceColor: '#FFFFFF',
  textColor: '#26262E',
  mutedColor: '#6D6F81',
  contrastBackgroundColor: '#26262E',
  contrastTextColor: '#FFFFFF',
  radius: CampaignRadius.rounded,
  buttonRadius: CampaignButtonRadius.pill
}

const STRING_SEED: Array<[CampaignStringKey, string]> = [
  [CampaignStringKey.allRegions, 'All regions'],
  [CampaignStringKey.step1, 'Pick a language your friend understands.'],
  [CampaignStringKey.step2, 'Preview what they will see.'],
  [CampaignStringKey.step2help, 'Tap through the preview like they would.'],
  [CampaignStringKey.step3, 'Share this link with them.'],
  [CampaignStringKey.step4, 'Or download a QR code for print.'],
  [CampaignStringKey.copy, 'Copy link'],
  [CampaignStringKey.copied, 'Link copied'],
  [CampaignStringKey.downloadQr, 'Download QR code'],
  [CampaignStringKey.open, 'Open'],
  [CampaignStringKey.watch, 'Watch'],
  [CampaignStringKey.openTemplate, 'Open journey'],
  [CampaignStringKey.youtube, 'Watch on YouTube'],
  [CampaignStringKey.totalVisitors, 'Total visitors'],
  [CampaignStringKey.topCountry, 'Top country'],
  [CampaignStringKey.seeAllOnWatch, 'See all on Watch'],
  [CampaignStringKey.videos, 'videos']
]

export const campaignStrings: CampaignPublicFields_strings[] = STRING_SEED.map(
  ([key, value]) => ({
    __typename: 'CampaignString',
    id: `string-${key}`,
    key,
    value
  })
)

const english = {
  __typename: 'Language' as const,
  id: '529',
  bcp47: 'en',
  name: [
    { __typename: 'LanguageName' as const, value: 'English', primary: true }
  ]
}
const french = {
  __typename: 'Language' as const,
  id: '496',
  bcp47: 'fr',
  name: [
    { __typename: 'LanguageName' as const, value: 'Français', primary: true }
  ]
}

export const eurRegion: CampaignPublicFields_regions = {
  __typename: 'CampaignRegionPublic',
  id: 'eurRegionId',
  slug: 'eur',
  name: 'Europe',
  listed: true,
  order: 0,
  countries: [
    {
      __typename: 'CampaignRegionCountry',
      id: 'eurCountry-FR',
      countryId: 'FR',
      order: 0
    }
  ],
  languages: [
    {
      __typename: 'CampaignRegionLanguagePublic',
      id: 'eurRegionId-529',
      languageId: '529',
      order: 0,
      journeyStatus: JourneyStatus.published,
      journeyUrl: 'https://your.nextstep.is/christmas-europe',
      embedUrl: 'https://your.nextstep.is/embed/christmas-europe',
      language: english
    }
  ],
  lines: [
    typography({
      id: 'eurLineId',
      regionId: 'eurRegionId',
      content: 'EUR',
      typographyVariant: TypographyVariant.overline,
      placement: null
    })
  ]
}

export const afrRegion: CampaignPublicFields_regions = {
  __typename: 'CampaignRegionPublic',
  id: 'afrRegionId',
  slug: 'afr',
  name: 'Africa',
  listed: true,
  order: 1,
  countries: [],
  languages: [
    {
      __typename: 'CampaignRegionLanguagePublic',
      id: 'afrRegionId-496',
      languageId: '496',
      order: 0,
      journeyStatus: JourneyStatus.published,
      journeyUrl: 'https://journeys.example.org/noel-afrique',
      embedUrl: 'https://your.nextstep.is/embed/noel-afrique',
      language: french
    }
  ],
  lines: []
}

export const landingBlocks: CampaignPublicBlockFields[] = [
  section('CampaignHeroBlock', {
    id: 'heroId',
    pageId: LANDING_PAGE_ID,
    parentOrder: 0,
    eyebrow: 'Christmas 2026',
    title: 'Share the story of Christmas',
    lede: 'Pick your region to find a journey in your language, ready to share.',
    align: TypographyAlign.center,
    mediaBlockId: null
  }),
  button({
    id: 'heroButtonId',
    pageId: LANDING_PAGE_ID,
    parentBlockId: 'heroId',
    parentOrder: 0,
    label: 'Choose your region',
    action: {
      __typename: 'CampaignScrollToBlockAction',
      parentBlockId: 'heroButtonId',
      blockId: 'landingSwitcherId'
    }
  }),
  section('CampaignRegionSwitcherBlock', {
    id: 'landingSwitcherId',
    pageId: LANDING_PAGE_ID,
    parentOrder: 1,
    title: 'Choose your region',
    switcherVariant: CampaignSwitcherVariant.cards
  }),
  button({
    id: 'switcherEuropeButtonId',
    pageId: LANDING_PAGE_ID,
    parentBlockId: 'landingSwitcherId',
    parentOrder: 0,
    label: 'Start with Europe',
    buttonVariant: ButtonVariant.outlined,
    action: {
      __typename: 'CampaignNavigateToRegionAction',
      parentBlockId: 'switcherEuropeButtonId',
      regionId: 'eurRegionId'
    }
  }),
  section('CampaignVideoCarouselBlock', {
    id: 'carouselId',
    pageId: LANDING_PAGE_ID,
    parentOrder: 2,
    eyebrow: 'Watch',
    title: 'Films for the season',
    videoId: null,
    videoVariantLanguageId: null,
    video: null,
    backgroundKind: CampaignBackgroundKind.surface
  }),
  section('CampaignJourneyListBlock', {
    id: 'landingJourneyListId',
    pageId: LANDING_PAGE_ID,
    parentOrder: 3,
    eyebrow: 'Journeys',
    title: 'Ready-made journeys',
    lede: 'Interactive stories your friends can walk through on their phone.',
    display: CampaignJourneyListDisplay.grid
  }),
  typography({
    id: 'journeyListNoteId',
    pageId: LANDING_PAGE_ID,
    parentBlockId: 'landingJourneyListId',
    parentOrder: 0,
    content: 'New this season',
    typographyVariant: TypographyVariant.overline,
    placement: CampaignChildPlacement.above
  }),
  section('CampaignAnalyticsBlock', {
    id: 'landingAnalyticsId',
    pageId: LANDING_PAGE_ID,
    parentOrder: 4,
    eyebrow: 'Around the world',
    title: 'Where the story is spreading',
    showMap: true,
    backgroundKind: CampaignBackgroundKind.contrast
  })
]

export const regionPageBlocks: CampaignPublicBlockFields[] = [
  section('CampaignRegionHeaderBlock', {
    id: 'regionHeaderId',
    pageId: REGION_PAGE_ID,
    parentOrder: 0,
    intro:
      'A Christmas journey chosen and contextualised by your regional team.'
  }),
  section('CampaignRegionShareBlock', {
    id: 'regionShareId',
    pageId: REGION_PAGE_ID,
    parentOrder: 1,
    title: 'Share this journey',
    intro: 'Pick a language, preview it, and share the link or QR code.',
    backgroundKind: CampaignBackgroundKind.surface
  }),
  section('CampaignJourneyListBlock', {
    id: 'regionJourneyListId',
    pageId: REGION_PAGE_ID,
    parentOrder: 2,
    eyebrow: 'More journeys',
    title: 'Other journeys for this region',
    lede: null,
    display: CampaignJourneyListDisplay.grid
  }),
  section('CampaignAnalyticsBlock', {
    id: 'regionAnalyticsId',
    pageId: REGION_PAGE_ID,
    parentOrder: 3,
    eyebrow: 'In this region',
    title: 'Where the story is spreading',
    showMap: true,
    backgroundKind: CampaignBackgroundKind.contrast
  }),
  section('CampaignRegionSwitcherBlock', {
    id: 'regionSwitcherId',
    pageId: REGION_PAGE_ID,
    parentOrder: 4,
    title: 'Other regions',
    switcherVariant: CampaignSwitcherVariant.cards
  })
]

/** An Image section as the images ticket stores it: a Cloudflare address with its measured size. */
export const imageSectionBlock = section('CampaignImageBlock', {
  id: 'imageSectionId',
  pageId: LANDING_PAGE_ID,
  parentOrder: 5,
  src: 'https://imagedelivery.net/accountHash/imageSection/public',
  alt: 'A family reading together',
  width: 1600,
  height: 900
})

type VideoBlock = Extract<
  CampaignPublicBlockFields,
  { __typename: 'CampaignVideoBlock' }
>

function video(
  row: Pick<VideoBlock, 'id' | 'source' | 'videoId' | 'mediaVideo'> &
    Partial<VideoBlock>
): VideoBlock {
  return {
    __typename: 'CampaignVideoBlock',
    campaignId: CAMPAIGN_ID,
    pageId: LANDING_PAGE_ID,
    regionId: null,
    parentBlockId: null,
    parentOrder: null,
    videoVariantLanguageId: null,
    title: '',
    description: '',
    image: null,
    duration: null,
    ...row
  }
}

function watchVideo(
  id: string,
  slug: string,
  childrenCount: number
): Extract<VideoBlock['mediaVideo'], { __typename: 'Video' }> {
  return {
    __typename: 'Video',
    id,
    label: childrenCount > 0 ? VideoLabel.featureFilm : VideoLabel.shortFilm,
    slug,
    childrenCount,
    title: [
      {
        __typename: 'VideoTitle',
        value: 'The Nativity',
        primary: true,
        language: { __typename: 'Language', id: '529' }
      },
      {
        __typename: 'VideoTitle',
        value: 'La Nativité',
        primary: false,
        language: { __typename: 'Language', id: '496' }
      }
    ],
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh: `https://imagedelivery.net/accountHash/${id}/mobileCinematicHigh`
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: `${id}-529`,
      hls: `https://arc.gt/hls/${id}/529`,
      duration: 180,
      slug: `${slug}/english`
    }
  }
}

/**
 * The hero’s owned Media Slot video: a Watch video with no children (it plays
 * inline), its text read live through `mediaVideo` (the row’s overrides
 * resolve to `""`). Pair with `mediaBlockId: heroVideoBlock.id` on the hero.
 */
export const heroVideoBlock = video({
  id: 'heroVideoId',
  parentBlockId: 'heroId',
  source: VideoBlockSource.internal,
  videoId: 'nativityVideoId',
  videoVariantLanguageId: '529',
  mediaVideo: watchVideo('nativityVideoId', 'the-nativity', 0)
})

/** A Watch video with children, shown as a poster card linking to Watch. */
export const watchParentVideoBlock = video({
  id: 'watchParentVideoId',
  parentBlockId: 'heroId',
  source: VideoBlockSource.internal,
  videoId: 'jesusVideoId',
  videoVariantLanguageId: '529',
  mediaVideo: watchVideo('jesusVideoId', 'jesus', 61)
})

/** A YouTube video with its title, description, poster and duration captured at pick. */
export const youTubeVideoBlock = video({
  id: 'youTubeVideoId',
  parentBlockId: 'heroId',
  source: VideoBlockSource.youTube,
  videoId: 'jQaeIJOA6J0',
  title: 'Christmas around the world',
  description: 'How the story is told in twelve countries.',
  image: 'https://i.ytimg.com/vi/jQaeIJOA6J0/hqdefault.jpg',
  duration: 245,
  mediaVideo: { __typename: 'YouTube', id: 'jQaeIJOA6J0' }
})

/** An uploaded Mux video with its text captured at pick. */
export const muxVideoBlock = video({
  id: 'muxVideoId',
  parentBlockId: 'heroId',
  source: VideoBlockSource.mux,
  videoId: 'muxAssetVideoId',
  title: 'Our Christmas outreach',
  description: null,
  image: 'https://image.mux.com/muxPlaybackId/thumbnail.png',
  duration: 95,
  mediaVideo: {
    __typename: 'MuxVideo',
    id: 'muxAssetVideoId',
    playbackId: 'muxPlaybackId'
  }
})

/**
 * A Featured Media section (not in `landingBlocks`): text and bullets with
 * an owned image in its Media Slot, the media on the left.
 */
export const featuredMediaSectionBlock = section('CampaignFeaturedMediaBlock', {
  id: 'featuredMediaId',
  pageId: LANDING_PAGE_ID,
  parentOrder: 6,
  eyebrow: 'Why it matters',
  title: 'A story for every home',
  lede: 'Short films in the languages your neighbours speak.',
  bullets: 'Free to share\n\nIn over 1,800 languages\nReady for any phone',
  mediaSide: CampaignMediaSide.left,
  mediaBlockId: 'featuredMediaImageId'
})

/** The Featured Media section’s owned image (`parentOrder: null`, named by `mediaBlockId`). */
export const featuredMediaImageBlock = section('CampaignImageBlock', {
  id: 'featuredMediaImageId',
  pageId: LANDING_PAGE_ID,
  parentBlockId: 'featuredMediaId',
  parentOrder: null,
  src: 'https://imagedelivery.net/accountHash/featuredMedia/public',
  alt: 'Children watching a film',
  width: 1200,
  height: 800
})

/** The hero’s owned background cover (`parentOrder: null`, named by `coverBlockId`). */
export const heroCoverBlock = section('CampaignImageBlock', {
  id: 'heroCoverId',
  pageId: LANDING_PAGE_ID,
  parentBlockId: 'heroId',
  parentOrder: null,
  src: 'https://imagedelivery.net/accountHash/heroCover/public',
  alt: null,
  width: 1600,
  height: 400
})

/** The header’s owned logo (`parentOrder: null`, named by `logoBlockId`). */
export const headerLogoBlock = section('CampaignImageBlock', {
  id: 'headerLogoId',
  parentBlockId: 'headerId',
  parentOrder: null,
  src: 'https://imagedelivery.net/accountHash/headerLogo/public',
  alt: 'Christmas logo',
  width: 320,
  height: 80
})

export const headerBlock = section('CampaignHeaderBlock', {
  id: 'headerId',
  parentOrder: 0,
  logoBlockId: null
})

export const footerBlock = section('CampaignFooterBlock', {
  id: 'footerId',
  parentOrder: 1,
  backgroundKind: CampaignBackgroundKind.surface
})

export const chromeBlocks: CampaignPublicBlockFields[] = [
  headerBlock,
  button({
    id: 'navHomeId',
    parentBlockId: 'headerId',
    parentOrder: 0,
    label: 'Home',
    action: {
      __typename: 'CampaignScrollToBlockAction',
      parentBlockId: 'navHomeId',
      blockId: 'heroId'
    }
  }),
  button({
    id: 'navResourcesId',
    parentBlockId: 'headerId',
    parentOrder: 1,
    label: 'Resources',
    action: {
      __typename: 'CampaignScrollToBlockAction',
      parentBlockId: 'navResourcesId',
      blockId: 'carouselId'
    }
  }),
  footerBlock,
  typography({
    id: 'footerCopyrightId',
    parentBlockId: 'footerId',
    parentOrder: 0,
    content: '© 2026 Jesus Film Project',
    typographyVariant: TypographyVariant.caption
  }),
  button({
    id: 'footerTermsId',
    parentBlockId: 'footerId',
    parentOrder: 1,
    label: 'Terms of Use',
    buttonVariant: ButtonVariant.text,
    size: ButtonSize.small,
    action: {
      __typename: 'CampaignLinkAction',
      parentBlockId: 'footerTermsId',
      url: 'https://www.cru.org/us/en/about/terms-of-use.html',
      target: null
    }
  }),
  button({
    id: 'footerPrivacyId',
    parentBlockId: 'footerId',
    parentOrder: 2,
    label: 'Your Privacy',
    buttonVariant: ButtonVariant.text,
    size: ButtonSize.small,
    action: {
      __typename: 'CampaignLinkAction',
      parentBlockId: 'footerPrivacyId',
      url: 'https://www.cru.org/us/en/about/privacy.html',
      target: null
    }
  })
]

export const campaignPublic: CampaignPublicFields = {
  __typename: 'CampaignPublic',
  id: CAMPAIGN_ID,
  teamId: 'teamId',
  slug: 'christmas-2026',
  title: 'Christmas 2026',
  defaultLanguageId: '529',
  languageId: '529',
  publishedAt: '2026-10-05T00:00:00.000Z',
  language: { __typename: 'Language', id: '529', bcp47: 'en' },
  languages: [
    {
      __typename: 'CampaignLanguage',
      id: 'campaignLanguage-529',
      languageId: '529',
      order: 0,
      language: english
    },
    {
      __typename: 'CampaignLanguage',
      id: 'campaignLanguage-496',
      languageId: '496',
      order: 1,
      language: french
    }
  ],
  theme: lightTheme,
  strings: campaignStrings,
  regions: [eurRegion, afrRegion],
  header: headerBlock,
  footer: footerBlock,
  chrome: chromeBlocks,
  pages: [
    {
      __typename: 'CampaignPagePublic',
      id: LANDING_PAGE_ID,
      kind: CampaignPageKind.landing,
      blocks: landingBlocks
    },
    {
      __typename: 'CampaignPagePublic',
      id: REGION_PAGE_ID,
      kind: CampaignPageKind.regionTemplate,
      blocks: regionPageBlocks
    }
  ]
}

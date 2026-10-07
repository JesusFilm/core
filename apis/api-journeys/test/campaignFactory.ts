import {
  Campaign,
  CampaignAction,
  CampaignBlock,
  CampaignLanguage,
  CampaignPage,
  CampaignRegion,
  CampaignRegionCountry,
  CampaignRegionLanguage,
  CampaignString,
  CampaignTheme,
  CustomDomain,
  Journey,
  Team,
  UserTeam
} from '@core/prisma/journeys/client'

/**
 * The seeded campaign exactly as `campaignCreate` seeds it (PRD §14), as plain
 * objects for the Prisma mock. `campaignCreate.mutation.spec.ts` asserts that
 * this fixture and the mutation agree row by row, so a change to either must
 * be mirrored in the other.
 */

export type CampaignBlockRow = CampaignBlock & { action: CampaignAction | null }

export type CampaignRegionRow = CampaignRegion & {
  languages: CampaignRegionLanguage[]
  countries: CampaignRegionCountry[]
}

export interface CampaignFixture extends Campaign {
  team: Team & { userTeams: UserTeam[] }
  languages: CampaignLanguage[]
  theme: CampaignTheme
  pages: CampaignPage[]
  blocks: CampaignBlockRow[]
  regions: CampaignRegionRow[]
  strings: CampaignString[]
  customDomains: CustomDomain[]
}

export const CAMPAIGN_FIXTURE_DATE = new Date('2026-10-05T00:00:00.000Z')

export const LIGHT_PALETTE = [
  '#C52D3A',
  '#F2B544',
  '#FBF7F1',
  '#FFFFFF',
  '#26262E',
  '#6D6F81'
]

const CAMPAIGN_STRING_SEED: Array<[CampaignString['key'], string]> = [
  ['allRegions', 'All regions'],
  ['step1', 'Pick a language your friend understands.'],
  ['step2', 'Preview what they will see.'],
  ['step2help', 'Tap through the preview like they would.'],
  ['step3', 'Share this link with them.'],
  ['step4', 'Or download a QR code for print.'],
  ['copy', 'Copy link'],
  ['copied', 'Link copied'],
  ['downloadQr', 'Download QR code'],
  ['open', 'Open'],
  ['watch', 'Watch'],
  ['openTemplate', 'Open journey'],
  ['youtube', 'Watch on YouTube'],
  ['totalVisitors', 'Total visitors'],
  ['topCountry', 'Top country'],
  ['seeAllOnWatch', 'See all on Watch'],
  ['videos', 'videos']
]

const EMPTY_BLOCK: Omit<CampaignBlock, 'id' | 'typename' | 'campaignId'> = {
  pageId: null,
  regionId: null,
  parentBlockId: null,
  parentOrder: null,
  updatedAt: CAMPAIGN_FIXTURE_DATE,
  deletedAt: null,
  backgroundKind: 'none',
  backgroundColor: null,
  coverBlockId: null,
  backgroundOverlay: null,
  headingColor: null,
  textColor: null,
  buttonColor: null,
  buttonTextColor: null,
  accentColor: null,
  eyebrow: null,
  eyebrowTranslations: null,
  title: null,
  titleTranslations: null,
  lede: null,
  ledeTranslations: null,
  bullets: null,
  bulletsTranslations: null,
  content: null,
  contentTranslations: null,
  intro: null,
  introTranslations: null,
  label: null,
  labelTranslations: null,
  alt: null,
  altTranslations: null,
  description: null,
  descriptionTranslations: null,
  align: null,
  mediaSide: null,
  mediaBlockId: null,
  logoBlockId: null,
  switcherVariant: null,
  display: null,
  showMap: null,
  ratio: null,
  typographyVariant: null,
  buttonVariant: null,
  buttonSize: null,
  color: null,
  labelColor: null,
  placement: null,
  source: null,
  videoId: null,
  videoVariantLanguageId: null,
  image: null,
  duration: null,
  src: null,
  width: null,
  height: null,
  journeyId: null
}

function block(
  campaignId: string,
  row: Partial<CampaignBlock> & { id: string; typename: string },
  action: Omit<CampaignAction, 'campaignBlockId' | 'updatedAt'> | null = null
): CampaignBlockRow {
  return {
    ...EMPTY_BLOCK,
    campaignId,
    ...row,
    action:
      action == null
        ? null
        : {
            campaignBlockId: row.id,
            updatedAt: CAMPAIGN_FIXTURE_DATE,
            ...action
          }
  }
}

export interface CampaignFactoryOptions {
  id?: string
  teamId?: string
  userId?: string
  role?: UserTeam['role']
  title?: string
  slug?: string
  defaultLanguageId?: string
  createdAt?: Date
}

/** The seed blocks in the order `campaignCreate` creates them. */
export function seededBlocks(
  campaignId: string,
  year: number
): CampaignBlockRow[] {
  return [
    block(campaignId, {
      id: 'heroId',
      typename: 'CampaignHeroBlock',
      pageId: 'landingPageId',
      parentOrder: 0,
      eyebrow: 'Christmas 2026',
      title: 'Share the story of Christmas',
      lede: 'Pick your region to find a journey in your language, ready to share.',
      align: 'center',
      backgroundKind: 'none'
    }),
    block(campaignId, {
      id: 'landingSwitcherId',
      typename: 'CampaignRegionSwitcherBlock',
      pageId: 'landingPageId',
      parentOrder: 1,
      title: 'Choose your region',
      switcherVariant: 'cards',
      backgroundKind: 'none'
    }),
    block(campaignId, {
      id: 'carouselId',
      typename: 'CampaignVideoCarouselBlock',
      pageId: 'landingPageId',
      parentOrder: 2,
      eyebrow: 'Watch',
      title: 'Films for the season',
      backgroundKind: 'surface'
    }),
    block(campaignId, {
      id: 'landingJourneyListId',
      typename: 'CampaignJourneyListBlock',
      pageId: 'landingPageId',
      parentOrder: 3,
      eyebrow: 'Journeys',
      title: 'Ready-made journeys',
      lede: 'Interactive stories your friends can walk through on their phone.',
      display: 'grid',
      backgroundKind: 'none'
    }),
    block(campaignId, {
      id: 'landingAnalyticsId',
      typename: 'CampaignAnalyticsBlock',
      pageId: 'landingPageId',
      parentOrder: 4,
      eyebrow: 'Around the world',
      title: 'Where the story is spreading',
      showMap: true,
      backgroundKind: 'contrast'
    }),
    block(
      campaignId,
      {
        id: 'heroButtonId',
        typename: 'CampaignButtonBlock',
        pageId: 'landingPageId',
        parentBlockId: 'heroId',
        parentOrder: 0,
        label: 'Choose your region',
        placement: 'below'
      },
      { blockId: 'landingSwitcherId', regionId: null, url: null, target: null }
    ),
    block(campaignId, {
      id: 'regionHeaderId',
      typename: 'CampaignRegionHeaderBlock',
      pageId: 'regionPageId',
      parentOrder: 0,
      intro:
        'A Christmas journey chosen and contextualised by your regional team.',
      backgroundKind: 'none'
    }),
    block(campaignId, {
      id: 'regionShareId',
      typename: 'CampaignRegionShareBlock',
      pageId: 'regionPageId',
      parentOrder: 1,
      title: 'Share this journey',
      intro: 'Pick a language, preview it, and share the link or QR code.',
      backgroundKind: 'surface'
    }),
    block(campaignId, {
      id: 'regionJourneyListId',
      typename: 'CampaignJourneyListBlock',
      pageId: 'regionPageId',
      parentOrder: 2,
      eyebrow: 'More journeys',
      title: 'Other journeys for this region',
      display: 'grid',
      backgroundKind: 'none'
    }),
    block(campaignId, {
      id: 'regionAnalyticsId',
      typename: 'CampaignAnalyticsBlock',
      pageId: 'regionPageId',
      parentOrder: 3,
      eyebrow: 'In this region',
      title: 'Where the story is spreading',
      showMap: true,
      backgroundKind: 'contrast'
    }),
    block(campaignId, {
      id: 'regionSwitcherId',
      typename: 'CampaignRegionSwitcherBlock',
      pageId: 'regionPageId',
      parentOrder: 4,
      title: 'Other regions',
      switcherVariant: 'cards',
      backgroundKind: 'none'
    }),
    block(campaignId, {
      id: 'headerId',
      typename: 'CampaignHeaderBlock',
      parentOrder: 0,
      backgroundKind: 'none'
    }),
    block(
      campaignId,
      {
        id: 'navHomeId',
        typename: 'CampaignButtonBlock',
        parentBlockId: 'headerId',
        parentOrder: 0,
        label: 'Home',
        placement: 'below'
      },
      { blockId: 'heroId', regionId: null, url: null, target: null }
    ),
    block(
      campaignId,
      {
        id: 'navResourcesId',
        typename: 'CampaignButtonBlock',
        parentBlockId: 'headerId',
        parentOrder: 1,
        label: 'Resources',
        placement: 'below'
      },
      { blockId: 'carouselId', regionId: null, url: null, target: null }
    ),
    block(campaignId, {
      id: 'footerId',
      typename: 'CampaignFooterBlock',
      parentOrder: 1,
      backgroundKind: 'surface'
    }),
    block(campaignId, {
      id: 'footerCopyrightId',
      typename: 'CampaignTypographyBlock',
      parentBlockId: 'footerId',
      parentOrder: 0,
      content: `© ${year} Jesus Film Project`,
      typographyVariant: 'caption',
      placement: 'below'
    }),
    block(
      campaignId,
      {
        id: 'footerTermsId',
        typename: 'CampaignButtonBlock',
        parentBlockId: 'footerId',
        parentOrder: 1,
        label: 'Terms of Use',
        buttonVariant: 'text',
        buttonSize: 'small',
        placement: 'below'
      },
      {
        blockId: null,
        regionId: null,
        url: 'https://www.cru.org/us/en/about/terms-of-use.html',
        target: null
      }
    ),
    block(
      campaignId,
      {
        id: 'footerPrivacyId',
        typename: 'CampaignButtonBlock',
        parentBlockId: 'footerId',
        parentOrder: 2,
        label: 'Your Privacy',
        buttonVariant: 'text',
        buttonSize: 'small',
        placement: 'below'
      },
      {
        blockId: null,
        regionId: null,
        url: 'https://www.cru.org/us/en/about/privacy.html',
        target: null
      }
    )
  ]
}

export interface CampaignFactory {
  /** Append a listed region named `name` with one default-language share row. */
  withRegion: (name: string) => CampaignFactory
  /** Append a Page Language. */
  withLanguage: (languageId: string) => CampaignFactory
  /** Link a journey to a region's share language (adds the language if missing). */
  withLinkedJourney: (
    regionId: string,
    languageId: string,
    journey: Pick<Journey, 'id' | 'title' | 'description'>
  ) => CampaignFactory
  /** Mark the campaign published as of the fixture date. */
  published: () => CampaignFactory
  build: () => CampaignFixture
}

function slugOf(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function fromFixture(fixture: CampaignFixture): CampaignFactory {
  return {
    withRegion: (name) => {
      const order = fixture.regions.length
      const id = `${slugOf(name)}RegionId`
      return fromFixture({
        ...fixture,
        regions: [
          ...fixture.regions,
          {
            id,
            campaignId: fixture.id,
            name,
            nameTranslations: {},
            slug: slugOf(name),
            order,
            listed: true,
            createdAt: CAMPAIGN_FIXTURE_DATE,
            updatedAt: CAMPAIGN_FIXTURE_DATE,
            languages: [
              {
                id: `${id}-${fixture.defaultLanguageId}`,
                regionId: id,
                languageId: fixture.defaultLanguageId,
                journeyId: null,
                title: null,
                description: null,
                qrCodeId: null,
                order: 0
              }
            ],
            countries: []
          }
        ]
      })
    },
    withLanguage: (languageId) =>
      fromFixture({
        ...fixture,
        languages: [
          ...fixture.languages,
          {
            id: `campaignLanguage-${languageId}`,
            campaignId: fixture.id,
            languageId,
            order: fixture.languages.length
          }
        ]
      }),
    withLinkedJourney: (regionId, languageId, journey) =>
      fromFixture({
        ...fixture,
        regions: fixture.regions.map((region) => {
          if (region.id !== regionId) return region
          const existing = region.languages.find(
            (language) => language.languageId === languageId
          )
          const linked: CampaignRegionLanguage = {
            id: existing?.id ?? `${regionId}-${languageId}`,
            regionId,
            languageId,
            journeyId: journey.id,
            title: journey.title,
            description: journey.description,
            qrCodeId: `${regionId}-${languageId}-qrCodeId`,
            order: existing?.order ?? region.languages.length
          }
          return {
            ...region,
            languages:
              existing == null
                ? [...region.languages, linked]
                : region.languages.map((language) =>
                    language.id === existing.id ? linked : language
                  )
          }
        })
      }),
    published: () =>
      fromFixture({
        ...fixture,
        status: 'published',
        publishedAt: CAMPAIGN_FIXTURE_DATE
      }),
    build: () => fixture
  }
}

export function campaignFactory(
  options: CampaignFactoryOptions = {}
): CampaignFactory {
  const id = options.id ?? 'campaignId'
  const teamId = options.teamId ?? 'teamId'
  const userId = options.userId ?? 'userId'
  const defaultLanguageId = options.defaultLanguageId ?? '529'
  const createdAt = options.createdAt ?? CAMPAIGN_FIXTURE_DATE
  const fixture: CampaignFixture = {
    id,
    teamId,
    title: options.title ?? 'Christmas 2026',
    titleTranslations: {},
    slug: options.slug ?? 'christmas-2026',
    status: 'draft',
    defaultLanguageId,
    palette: LIGHT_PALETTE,
    publishedAt: null,
    createdAt,
    updatedAt: createdAt,
    team: {
      id: teamId,
      title: 'Team',
      publicTitle: null,
      createdAt,
      updatedAt: createdAt,
      plausibleToken: null,
      userTeams: [
        {
          id: 'userTeamId',
          teamId,
          userId,
          role: options.role ?? 'member',
          createdAt,
          updatedAt: createdAt
        }
      ]
    },
    languages: [
      {
        id: 'campaignLanguageId',
        campaignId: id,
        languageId: defaultLanguageId,
        order: 0
      }
    ],
    theme: {
      id: 'campaignThemeId',
      campaignId: id,
      themeMode: 'light',
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
      radius: 'rounded',
      buttonRadius: 'pill',
      createdAt,
      updatedAt: createdAt
    },
    pages: [
      { id: 'landingPageId', campaignId: id, kind: 'landing' },
      { id: 'regionPageId', campaignId: id, kind: 'regionTemplate' }
    ],
    blocks: seededBlocks(id, createdAt.getUTCFullYear()),
    regions: [],
    customDomains: [],
    strings: CAMPAIGN_STRING_SEED.map(([key, value]) => ({
      id: `string-${key}`,
      campaignId: id,
      key,
      value,
      valueTranslations: {}
    }))
  }
  return fromFixture(fixture)
}

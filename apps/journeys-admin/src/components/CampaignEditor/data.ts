import {
  CAMPAIGN_ID,
  LANDING_PAGE_ID,
  REGION_PAGE_ID,
  chromeBlocks,
  eurRegion as eurRegionPublic,
  landingBlocks,
  lightTheme,
  regionPageBlocks
} from '@core/journeys/ui/Campaign/testData'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_regions as CampaignRegion,
  GetCampaign_campaign_regions_languages as CampaignRegionLanguage,
  GetCampaign_campaign_strings as CampaignString
} from '../../../__generated__/GetCampaign'
import {
  CampaignPageKind,
  CampaignStatus,
  CampaignStringKey,
  JourneyStatus,
  UserTeamRole
} from '../../../__generated__/globalTypes'
import { CAMPAIGN_TEXT_FIELDS } from '../../libs/useCampaignBlockTextMutation'

export const CURRENT_USER_ID = 'userId'

/** The viewer's resolved block shape plus the empty translation lists the admin read adds to every text field. */
export function withEmptyTranslations(block: {
  __typename: string
}): CampaignBlock {
  const fields: readonly string[] =
    block.__typename in CAMPAIGN_TEXT_FIELDS
      ? CAMPAIGN_TEXT_FIELDS[
          block.__typename as keyof typeof CAMPAIGN_TEXT_FIELDS
        ]
      : []
  const translations = Object.fromEntries(
    fields.map((field) => [`${field}Translations`, []])
  )
  return { ...block, ...translations } as CampaignBlock
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

/** The seventeen seeded Campaign Strings, untranslated. */
export const campaignStrings: CampaignString[] = STRING_SEED.map(
  ([key, value]) => ({
    __typename: 'CampaignString',
    id: `string-${key}`,
    key,
    value,
    valueTranslations: []
  })
)

/** The seeded campaign as `campaign(id)` returns it to a manager, drawn from the shared viewer test data. */
export const campaign: Campaign = {
  __typename: 'Campaign',
  id: CAMPAIGN_ID,
  teamId: 'teamId',
  title: 'Christmas 2026',
  titleTranslations: [],
  slug: 'christmas-2026',
  status: CampaignStatus.draft,
  defaultLanguageId: '529',
  publishedAt: null,
  palette: ['#C52D3A', '#F2B544', '#FBF7F1', '#FFFFFF', '#26262E', '#6D6F81'],
  createdAt: '2026-10-05T00:00:00.000Z',
  updatedAt: '2026-10-05T00:00:00.000Z',
  team: {
    __typename: 'Team',
    id: 'teamId',
    userTeams: [
      {
        __typename: 'UserTeam',
        id: 'userTeamId',
        role: UserTeamRole.manager,
        user: { __typename: 'AuthenticatedUser', id: CURRENT_USER_ID }
      }
    ]
  },
  languages: [
    {
      __typename: 'CampaignLanguage',
      id: 'campaignLanguageId',
      languageId: '529',
      order: 0,
      language: {
        __typename: 'Language',
        id: '529',
        bcp47: 'en',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }]
      }
    },
    {
      __typename: 'CampaignLanguage',
      id: 'campaignLanguageFrId',
      languageId: '496',
      order: 1,
      language: {
        __typename: 'Language',
        id: '496',
        bcp47: 'fr',
        name: [{ __typename: 'LanguageName', value: 'Français', primary: true }]
      }
    }
  ],
  theme: lightTheme,
  pages: [
    {
      __typename: 'CampaignPage',
      id: LANDING_PAGE_ID,
      kind: CampaignPageKind.landing
    },
    {
      __typename: 'CampaignPage',
      id: REGION_PAGE_ID,
      kind: CampaignPageKind.regionTemplate
    }
  ],
  blocks: [...landingBlocks, ...regionPageBlocks, ...chromeBlocks].map(
    withEmptyTranslations
  ),
  regions: [],
  strings: campaignStrings
}

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
    { __typename: 'LanguageName' as const, value: 'Français', primary: true },
    { __typename: 'LanguageName' as const, value: 'French', primary: false }
  ]
}

/** Europe's English Share Language, linked to a live-published journey with its Campaign QR Code. */
export const eurEnglish: CampaignRegionLanguage = {
  __typename: 'CampaignRegionLanguage',
  id: 'eurRegionId-529',
  regionId: 'eurRegionId',
  languageId: '529',
  journeyId: 'eurJourneyId',
  title: 'Christmas in Europe',
  description: 'A journey for Europe.',
  qrCodeId: 'eurQrCodeId',
  order: 0,
  language: english,
  journey: {
    __typename: 'Journey',
    id: 'eurJourneyId',
    slug: 'christmas-europe',
    status: JourneyStatus.published
  },
  qrCode: {
    __typename: 'QrCode',
    id: 'eurQrCodeId',
    shortLink: {
      __typename: 'ShortLink',
      id: 'eurShortLinkId',
      pathname: 'eur-en',
      domain: { __typename: 'ShortLinkDomain', hostname: 'short.nextstep.is' }
    }
  }
}

/** Europe's French Share Language, still unlinked. */
export const eurFrench: CampaignRegionLanguage = {
  __typename: 'CampaignRegionLanguage',
  id: 'eurRegionId-496',
  regionId: 'eurRegionId',
  languageId: '496',
  journeyId: null,
  title: null,
  description: null,
  qrCodeId: null,
  order: 1,
  language: french,
  journey: null,
  qrCode: null
}

/** A listed region with one country chip, one Region Line (`eurLine`, in `campaignWithRegions.blocks`) and two Share Languages. */
export const eurRegion: CampaignRegion = {
  __typename: 'CampaignRegion',
  id: 'eurRegionId',
  campaignId: CAMPAIGN_ID,
  name: 'Europe',
  slug: 'eur',
  order: 0,
  listed: true,
  languages: [eurEnglish, eurFrench],
  countries: [
    {
      __typename: 'CampaignRegionCountry',
      id: 'eurCountry-FR',
      regionId: 'eurRegionId',
      countryId: 'FR',
      order: 0,
      country: {
        __typename: 'Country',
        id: 'FR',
        flagPngSrc: 'https://flags.example.org/fr.png',
        name: [{ __typename: 'CountryName', value: 'France' }]
      }
    }
  ]
}

/** An unlisted region: its Region Page is an Orphan Page. */
export const afrRegion: CampaignRegion = {
  __typename: 'CampaignRegion',
  id: 'afrRegionId',
  campaignId: CAMPAIGN_ID,
  name: 'Africa',
  slug: 'afr',
  order: 1,
  listed: false,
  languages: [
    {
      ...eurEnglish,
      id: 'afrRegionId-529',
      regionId: 'afrRegionId',
      journeyId: null,
      title: null,
      description: null,
      qrCodeId: null,
      journey: null,
      qrCode: null
    }
  ],
  countries: []
}

/** The Region Line of `eurRegion`, as the flat block list carries it. */
export const eurLine: CampaignBlock = withEmptyTranslations(
  eurRegionPublic.lines[0]
)

/** The seeded campaign with two regions: Europe (listed, one line, one country) and Africa (unlisted). */
export const campaignWithRegions: Campaign = {
  ...campaign,
  blocks: [...campaign.blocks, eurLine],
  regions: [eurRegion, afrRegion]
}

export const publishedCampaign: Campaign = {
  ...campaign,
  status: CampaignStatus.published,
  publishedAt: '2026-10-05T00:00:00.000Z'
}

export const memberCampaign: Campaign = {
  ...campaign,
  team: {
    __typename: 'Team',
    id: 'teamId',
    userTeams: [
      {
        __typename: 'UserTeam',
        id: 'userTeamId',
        role: UserTeamRole.member,
        user: { __typename: 'AuthenticatedUser', id: CURRENT_USER_ID }
      }
    ]
  }
}

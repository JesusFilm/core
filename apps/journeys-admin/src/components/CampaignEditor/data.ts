import {
  CAMPAIGN_ID,
  LANDING_PAGE_ID,
  REGION_PAGE_ID,
  chromeBlocks,
  landingBlocks,
  lightTheme,
  regionPageBlocks
} from '@core/journeys/ui/Campaign/testData'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_strings as CampaignString
} from '../../../__generated__/GetCampaign'
import {
  CampaignPageKind,
  CampaignStatus,
  CampaignStringKey,
  UserTeamRole
} from '../../../__generated__/globalTypes'
import { CAMPAIGN_TEXT_FIELDS } from '../../libs/useCampaignBlockTextMutation'

export const CURRENT_USER_ID = 'userId'

/** The viewer's resolved block shape plus the empty translation lists the admin read adds to every text field. */
export function withEmptyTranslations(
  block: (typeof landingBlocks)[number]
): CampaignBlock {
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

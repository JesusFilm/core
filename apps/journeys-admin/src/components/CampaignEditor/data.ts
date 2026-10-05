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
  GetCampaign_campaign_regions as CampaignRegion
} from '../../../__generated__/GetCampaign'
import {
  CampaignPageKind,
  CampaignStatus,
  UserTeamRole
} from '../../../__generated__/globalTypes'

export const CURRENT_USER_ID = 'userId'

/** The seeded campaign as `campaign(id)` returns it to a manager, drawn from the shared viewer test data. */
export const campaign: Campaign = {
  __typename: 'Campaign',
  id: CAMPAIGN_ID,
  teamId: 'teamId',
  title: 'Christmas 2026',
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
  blocks: [...landingBlocks, ...regionPageBlocks, ...chromeBlocks],
  regions: []
}

/** A listed region with one country chip and one Region Line (`eurLine`, in `campaignWithRegions.blocks`). */
export const eurRegion: CampaignRegion = {
  __typename: 'CampaignRegion',
  id: 'eurRegionId',
  campaignId: CAMPAIGN_ID,
  name: 'Europe',
  slug: 'eur',
  order: 0,
  listed: true,
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
  countries: []
}

/** The Region Line of `eurRegion`, as the flat block list carries it. */
export const eurLine: CampaignBlock = eurRegionPublic.lines[0]

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

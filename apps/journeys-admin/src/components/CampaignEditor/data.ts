import {
  CAMPAIGN_ID,
  LANDING_PAGE_ID,
  REGION_PAGE_ID,
  chromeBlocks,
  columnSlot,
  landingBlocks,
  lightTheme,
  regionPageBlocks,
  section
} from '@core/journeys/ui/Campaign/testData'

import { GetCampaign_campaign as Campaign } from '../../../__generated__/GetCampaign'
import {
  CampaignColumnsRatio,
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

/**
 * The seeded campaign plus a Columns section last on the landing page: the left
 * slot holds a Rich text section, the right slot is empty.
 */
export const campaignWithColumns: Campaign = {
  ...campaign,
  blocks: [
    ...campaign.blocks,
    section('CampaignColumnsBlock', {
      id: 'columnsId',
      pageId: LANDING_PAGE_ID,
      parentOrder: 5,
      ratio: CampaignColumnsRatio.equal
    }),
    columnSlot({
      id: 'slotLeftId',
      parentBlockId: 'columnsId',
      parentOrder: 0
    }),
    columnSlot({
      id: 'slotRightId',
      parentBlockId: 'columnsId',
      parentOrder: 1
    }),
    section('CampaignRichTextBlock', {
      id: 'slotRichTextId',
      pageId: LANDING_PAGE_ID,
      parentBlockId: 'slotLeftId',
      parentOrder: 0,
      title: 'Our story',
      richTextContent: 'First.\n\nSecond.'
    })
  ]
}

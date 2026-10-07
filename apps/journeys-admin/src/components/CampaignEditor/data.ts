import {
  CAMPAIGN_ID,
  LANDING_PAGE_ID,
  REGION_PAGE_ID,
  chromeBlocks,
  landingBlocks,
  lightTheme,
  regionPageBlocks
} from '@core/journeys/ui/Campaign/testData'

import { GetCampaign_campaign as Campaign } from '../../../__generated__/GetCampaign'
import {
  CampaignPageKind,
  CampaignStatus,
  UserTeamRole
} from '../../../__generated__/globalTypes'

export const CURRENT_USER_ID = 'userId'

type Block = Campaign['blocks'][number]
type Translation = {
  __typename: 'TranslatedValue'
  languageId: string
  value: string
}
type TranslatedField =
  | 'eyebrow'
  | 'title'
  | 'lede'
  | 'intro'
  | 'content'
  | 'label'

function frenchValue(value: string): Translation {
  return { __typename: 'TranslatedValue', languageId: '496', value }
}

/** French copy by block id, for the fields the canvas can preview in another language. */
const frenchCopy: Record<string, Partial<Record<TranslatedField, string>>> = {
  heroId: {
    eyebrow: 'Noël 2026',
    title: 'Partagez l’histoire de Noël',
    lede: 'Choisissez votre région pour trouver un parcours dans votre langue, prêt à partager.'
  },
  heroButtonId: { label: 'Choisissez votre région' },
  landingSwitcherId: { title: 'Choisissez votre région' },
  carouselId: { eyebrow: 'Regarder', title: 'Films de la saison' }
}

const TRANSLATED_FIELDS: TranslatedField[] = [
  'eyebrow',
  'title',
  'lede',
  'intro',
  'content',
  'label'
]

/** The test blocks as `campaign(id)` returns them: each text field with its per-language values (none where the copy has no French). */
function withTranslations(block: Block): Block {
  const translations: Record<string, Translation[]> = {}
  for (const field of TRANSLATED_FIELDS) {
    if (!(field in block)) continue
    const french = frenchCopy[block.id]?.[field]
    translations[`${field}Translations`] =
      french == null ? [] : [frenchValue(french)]
  }
  return { ...block, ...translations }
}

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
  blocks: [...landingBlocks, ...regionPageBlocks, ...chromeBlocks].map(
    withTranslations
  ),
  regions: [
    {
      __typename: 'CampaignRegion',
      id: 'eurRegionId',
      name: 'Europe',
      slug: 'eur',
      order: 0,
      listed: true
    },
    {
      __typename: 'CampaignRegion',
      id: 'afrRegionId',
      name: 'Africa',
      slug: 'afr',
      order: 1,
      listed: true
    }
  ]
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

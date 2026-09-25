import { CampaignFields } from '../../../__generated__/CampaignFields'
import { GetAdminJourneys_journeys as AdminJourney } from '../../../__generated__/GetAdminJourneys'
import { GetCampaignCountryStats_campaign_countryStats as CountryStats } from '../../../__generated__/GetCampaignCountryStats'
import {
  CampaignStatus,
  JourneyStatus
} from '../../../__generated__/globalTypes'

export function makeCampaignJourney(
  overrides: Partial<CampaignFields['shareJourneys'][number]> = {}
): CampaignFields['shareJourneys'][number] {
  return {
    __typename: 'CampaignJourneyItem',
    id: 'journey-1',
    title: 'Where You Belong',
    description: null,
    slug: 'where-you-belong',
    status: JourneyStatus.published,
    createdAt: '2026-01-01T00:00:00.000Z',
    customizable: false,
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      name: [{ __typename: 'LanguageName', value: 'English', primary: true }]
    },
    primaryImageBlock: null,
    ...overrides
  }
}

export function makeCampaign(
  overrides: Partial<CampaignFields> = {}
): CampaignFields {
  return {
    __typename: 'Campaign',
    id: 'campaign-1',
    title: 'World Cup 2026',
    slug: 'world-cup-2026',
    eyebrow: 'World Cup 2026 · Outreach',
    tagline: null,
    description: 'Share the Gospel during the World Cup.',
    backgroundImageSrc: null,
    backgroundImageAlt: null,
    status: CampaignStatus.draft,
    publishedAt: null,
    statsFrom: '2026-06-01T00:00:00.000Z',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
    team: { __typename: 'Team', id: 'team-1' },
    media: null,
    shareJourneys: [makeCampaignJourney()],
    templateJourneys: [],
    ...overrides
  }
}

/**
 * Minimal admin journey for picker/preview specs. Cast because the generated
 * list type carries many editor-only fields the campaign UI never reads.
 */
export function makeAdminJourney(
  overrides: Partial<AdminJourney> = {}
): AdminJourney {
  return {
    __typename: 'Journey',
    id: 'journey-1',
    title: 'Where You Belong',
    description: 'A journey',
    slug: 'where-you-belong',
    status: JourneyStatus.published,
    template: false,
    customizable: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    language: {
      __typename: 'Language',
      id: '529',
      name: [{ __typename: 'LanguageName', value: 'English', primary: true }]
    },
    primaryImageBlock: null,
    ...overrides
  } as unknown as AdminJourney
}

export const mockCountryStats: CountryStats = {
  __typename: 'CampaignCountryStats',
  from: '2026-06-01T00:00:00.000Z',
  to: '2026-09-24T00:00:00.000Z',
  totalVisitors: 120,
  totalPageviews: 340,
  countries: [
    {
      __typename: 'CampaignCountryStat',
      countryCode: 'NG',
      countryName: 'Nigeria',
      visitors: 80,
      pageviews: 200
    },
    {
      __typename: 'CampaignCountryStat',
      countryCode: 'KE',
      countryName: 'Kenya',
      visitors: 40,
      pageviews: 140
    }
  ]
}

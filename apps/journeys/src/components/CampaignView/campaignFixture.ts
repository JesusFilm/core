import {
  GetCampaign_campaignBySlug as Campaign,
  GetCampaign_campaignCountryStats as CampaignCountryStats,
  GetCampaign_campaignBySlug_media as CampaignMedia,
  GetCampaign_campaignBySlug_shareJourneys as ShareJourney,
  GetCampaign_campaignBySlug_templateJourneys as TemplateJourney
} from '../../../__generated__/GetCampaign'
import { TemplateGalleryPageMediaType } from '../../../__generated__/globalTypes'

export function makeCampaignLinkMedia(embedUrl: string): CampaignMedia {
  return {
    __typename: 'CampaignMediaPublic',
    id: 'media-1',
    type: TemplateGalleryPageMediaType.link,
    embedUrl,
    muxPlaybackId: null
  }
}

export const mockShareJourney: ShareJourney = {
  __typename: 'CampaignJourneyItem',
  id: 'share-1',
  title: 'Where You Belong',
  slug: 'you-belong-english',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    name: [{ __typename: 'LanguageName', value: 'English', primary: true }]
  }
}

export const mockTemplateJourney: TemplateJourney = {
  __typename: 'CampaignJourneyItem',
  id: 'template-1',
  title: 'Sample Template',
  description: 'A sample template for testing',
  slug: 'sample-template',
  createdAt: '2026-01-01T00:00:00.000Z',
  template: true,
  customizable: false,
  website: false,
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    name: [{ __typename: 'LanguageName', value: 'English', primary: true }]
  },
  primaryImageBlock: {
    __typename: 'ImageBlock',
    id: 'image-1',
    src: 'https://example.com/image.jpg',
    alt: 'Sample image',
    width: 800,
    height: 600,
    blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH'
  }
}

export const mockCountryStats: CampaignCountryStats = {
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

export function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    __typename: 'CampaignPublic',
    id: 'campaign-1',
    slug: 'world-cup-2026',
    title: 'Share the Gospel during the World Cup',
    eyebrow: 'World Cup 2026 · Outreach',
    tagline: 'Every match, every nation, every soul.',
    description: 'A campaign description.',
    backgroundImageSrc: null,
    backgroundImageAlt: null,
    publishedAt: '2026-06-01T00:00:00.000Z',
    media: null,
    shareJourneys: [mockShareJourney],
    templateJourneys: [mockTemplateJourney],
    ...overrides
  }
}

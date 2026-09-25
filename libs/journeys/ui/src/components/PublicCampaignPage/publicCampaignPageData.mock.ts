import type { PublicGalleryPageItem } from '../PublicGalleryPage/galleryTokens'

import {
  PublicCampaignCountryStats,
  PublicCampaignPageData,
  PublicCampaignShareJourney
} from './campaignTokens'

export const mockItem: PublicGalleryPageItem = {
  id: 'template-1',
  title: 'Sample Template',
  description: 'A sample template for testing',
  slug: 'sample-template',
  createdAt: '2026-01-01T00:00:00.000Z',
  languageName: [{ value: 'English', primary: true }],
  image: { src: 'https://example.com/image.jpg', alt: 'Sample image' }
}

export const mockShareJourney: PublicCampaignShareJourney = {
  id: 'share-en',
  slug: 'you-belong-english',
  title: 'Where You Belong',
  language: {
    id: '529',
    bcp47: 'en',
    name: [{ value: 'English', primary: true }]
  }
}

export const mockShareJourneySpanish: PublicCampaignShareJourney = {
  id: 'share-es',
  slug: 'you-belong-spanish',
  title: 'Donde perteneces',
  language: {
    id: '21028',
    bcp47: 'es',
    name: [
      { value: 'Español', primary: true },
      { value: 'Spanish', primary: false }
    ]
  }
}

export const mockCountryStats: PublicCampaignCountryStats = {
  totalVisitors: 47415,
  countries: [
    { countryCode: 'KM', countryName: 'Comoros', visitors: 8588 },
    { countryCode: 'NG', countryName: 'Nigeria', visitors: 4965 },
    { countryCode: 'KE', countryName: 'Kenya', visitors: 4572 }
  ]
}

export function makeCampaignData(
  overrides: Partial<PublicCampaignPageData> = {}
): PublicCampaignPageData {
  return {
    title: 'Share the Gospel during the World Cup',
    eyebrow: 'World Cup 2026 · Outreach',
    tagline: 'Every match, every nation, every soul.',
    description:
      "The World Cup brings billions of people together — it's the perfect moment to share what matters most.",
    backgroundImageSrc: null,
    backgroundImageAlt: null,
    media: null,
    shareJourneys: [mockShareJourney, mockShareJourneySpanish],
    templates: [mockItem],
    countryStats: mockCountryStats,
    publicOrigin: 'https://your.nextstep.is',
    ...overrides
  }
}

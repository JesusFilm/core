import { InMemoryCache } from '@apollo/client'

import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'

import { journeyUpdatedAtCacheUpdate } from './journeyUpdatedAtCacheUpdate'

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  featuredAt: null,
  strategySlug: null,
  title: 'my journey',
  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  template: null,
  userJourneys: [],
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null,
  tags: [],
  website: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null
}

describe('journeyUpdatedAtCacheUpdate', () => {
  it('should update journey updatedAt in cache', () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        updatedAt: '2021-11-19T12:34:56.647Z',
        id: journey.id,
        __typename: 'Journey'
      }
    })
    const initialCache = cache.extract()
    expect(initialCache['Journey:journeyId']?.updatedAt).toBe(
      '2021-11-19T12:34:56.647Z'
    )
    journeyUpdatedAtCacheUpdate(cache, journey.id)
    const extractedCache = cache.extract()
    expect(extractedCache['Journey:journeyId']?.updatedAt).not.toBe(
      '2021-11-19T12:34:56.647Z'
    )
  })
})

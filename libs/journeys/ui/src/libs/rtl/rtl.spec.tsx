import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import {
  JourneyFields as Journey,
  JourneyFields_language as Language
} from '../JourneyProvider/__generated__/JourneyFields'

import { getJourneyRTL } from '.'

const language: Language = {
  __typename: 'Language',
  id: '529',
  bcp47: 'ar',
  iso3: 'arb',
  name: [
    {
      __typename: 'LanguageName',
      value: 'Arabic, Modern Standard',
      primary: false
    }
  ]
}

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  strategySlug: null,
  featuredAt: null,
  slug: 'my-journey',
  language,
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  template: null,
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
  menuStepBlock: null,
  journeyTheme: null
}

describe('getJourneyRTL', () => {
  it('should return true for journey with rtl bcp47 and iso3', () => {
    expect(getJourneyRTL(journey)).toStrictEqual({ rtl: true, locale: 'ar' })
  })

  it('should return false for journey with rtl iso3 only', () => {
    expect(
      getJourneyRTL({ ...journey, language: { ...language, bcp47: null } })
    ).toStrictEqual({ rtl: false, locale: '' })
  })

  it('should return false for journey with no locale codes', () => {
    expect(
      getJourneyRTL({
        ...journey,
        language: { ...language, bcp47: null, iso3: null }
      })
    ).toStrictEqual({ rtl: false, locale: '' })
  })

  it('should return false for undefined journey', () => {
    expect(getJourneyRTL(undefined)).toStrictEqual({ rtl: false, locale: '' })
  })
})

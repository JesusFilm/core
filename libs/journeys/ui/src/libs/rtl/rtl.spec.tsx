import {
  JourneyFields as Journey,
  JourneyFields_language as Language
} from '../JourneyProvider/__generated__/JourneyFields'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { getJourneyRtl } from '.'

const language: Language = {
  __typename: 'Language',
  id: '529',
  bcp47: 'ar',
  iso3: 'arb',
  name: [
    {
      __typename: 'Translation',
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
  slug: 'my-journey',
  language,
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [],
  primaryImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null
}

describe('getJourneyRtl', () => {
  it('should return true for journey with rtl bcp47 and iso3', () => {
    expect(getJourneyRtl(journey)).toBe(true)
  })

  it('should return false for journey with rtl iso3 only', () => {
    expect(
      getJourneyRtl({ ...journey, language: { ...language, bcp47: null } })
    ).toBe(false)
  })

  it('should return false for journey with no locale codes', () => {
    expect(
      getJourneyRtl({
        ...journey,
        language: { ...language, bcp47: null, iso3: null }
      })
    ).toBe(false)
  })
})

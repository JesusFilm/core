import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { GetJourneys_journeys as Journey } from '../useJourneysQuery/__generated__/GetJourneys'

import { isTemplateCustomizable } from './isTemplateCustomizable'

describe('isTemplateCustomizable', () => {
  const baseJourney: Journey = {
    __typename: 'Journey',
    id: '1',
    title: 'Test Journey',
    createdAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    featuredAt: null,
    trashedAt: null,
    updatedAt: '2021-11-19T12:34:56.647Z',
    journeyCustomizationDescription: null,
    description: null,
    slug: 'test',
    themeName: ThemeName.base,
    themeMode: ThemeMode.dark,
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          __typename: 'LanguageName',
          value: 'English',
          primary: true
        }
      ]
    },
    status: JourneyStatus.published,
    seoTitle: null,
    seoDescription: null,
    template: true,
    website: false,
    journeyCustomizationFields: [],
    userJourneys: null,
    primaryImageBlock: null,
    tags: []
  }

  it('should return true when journey has customization description and fields', () => {
    const journey: Journey = {
      ...baseJourney,
      journeyCustomizationDescription: 'Customize this journey',
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: 'field1',
          journeyId: '1',
          key: 'name',
          value: null,
          defaultValue: 'John'
        }
      ]
    }

    const result = isTemplateCustomizable(journey)
    expect(result).toBe(true)
  })

  it('should return false when journeyCustomizationDescription is null', () => {
    const journey: Journey = {
      ...baseJourney,
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: 'field1',
          journeyId: '1',
          key: 'name',
          value: null,
          defaultValue: 'John'
        }
      ]
    }

    const result = isTemplateCustomizable(journey)
    expect(result).toBe(false)
  })

  it('should return false when journeyCustomizationDescription is empty string', () => {
    const journey: Journey = {
      ...baseJourney,
      journeyCustomizationDescription: '',
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: 'field1',
          journeyId: '1',
          key: 'name',
          value: null,
          defaultValue: 'John'
        }
      ]
    }

    const result = isTemplateCustomizable(journey)
    expect(result).toBe(false)
  })

  it('should return false when journeyCustomizationDescription is only whitespace', () => {
    const journey: Journey = {
      ...baseJourney,
      journeyCustomizationDescription: '   ',
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: 'field1',
          journeyId: '1',
          key: 'name',
          value: null,
          defaultValue: 'John'
        }
      ]
    }

    const result = isTemplateCustomizable(journey)
    expect(result).toBe(false)
  })

  it('should return false when journeyCustomizationFields is empty array', () => {
    const journey: Journey = {
      ...baseJourney,
      journeyCustomizationDescription: 'Customize this',
      journeyCustomizationFields: []
    }

    const result = isTemplateCustomizable(journey)
    expect(result).toBe(false)
  })

  it('should return false when journeyCustomizationFields is null', () => {
    const journey: Journey = {
      ...baseJourney,
      journeyCustomizationDescription: 'Customize this',
      journeyCustomizationFields: null as any
    }

    const result = isTemplateCustomizable(journey)
    expect(result).toBe(false)
  })

  it('should return false when journey is undefined', () => {
    const result = isTemplateCustomizable(undefined)
    expect(result).toBe(false)
  })

  it('should return true with multiple customization fields', () => {
    const journey: Journey = {
      ...baseJourney,
      journeyCustomizationDescription: 'Customize this journey',
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: 'field1',
          journeyId: '1',
          key: 'name',
          value: null,
          defaultValue: 'John'
        },
        {
          __typename: 'JourneyCustomizationField',
          id: 'field2',
          journeyId: '1',
          key: 'email',
          value: null,
          defaultValue: 'john@example.com'
        }
      ]
    }

    const result = isTemplateCustomizable(journey)
    expect(result).toBe(true)
  })
})

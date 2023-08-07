import { formatISO, startOfYear } from 'date-fns'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../../../../__generated__/globalTypes'

import { getDuplicatedJourney } from './getDuplicatedJourney'

describe('getDuplicatedJourney', () => {
  const defaultJourney = {
    __typename: 'Journey',
    id: 'journey-id',
    title: 'Default Journey Heading',
    description: null,
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    slug: 'default',
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    },
    createdAt: formatISO(startOfYear(new Date())),
    publishedAt: null,
    status: JourneyStatus.published,
    seoTitle: null,
    seoDescription: null,
    userJourneys: {
      __typename: 'UserJourney',
      id: 'user-journey-id',
      role: UserJourneyRole.owner,
      user: {
        __typename: 'User',
        id: 'user-id1',
        firstName: 'Amin',
        lastName: 'One',
        imageUrl: 'https://bit.ly/3Gth4Yf'
      }
    }
  }

  const journey1 = {
    ...defaultJourney,
    id: 'published-journey-id',
    title: 'Published Journey Heading',
    description: 'a published journey',
    publishedAt: formatISO(startOfYear(new Date()))
  }
  const journey2 = {
    id: 'published-journey2-id',
    title: 'Published Journey2 Heading',
    description: 'a published journey2',
    publishedAt: formatISO(startOfYear(new Date()))
  }
  const duplicatedJourney = {
    id: 'duplicated-journey-id',
    title: 'Duplicated Journey Heading',
    description: 'a duplicated journey',
    publishedAt: formatISO(startOfYear(new Date()))
  }

  const oldJourneys = [journey1, journey2]
  const journeys = [journey1, journey2, duplicatedJourney]

  it('should return the duplicated journeys id', () => {
    const duplicatedJourneyId = getDuplicatedJourney(oldJourneys, journeys)
    expect(duplicatedJourneyId).toBe('duplicated-journey-id')
  })

  it('should return undefined if journey length is not 1 more than old journeys', () => {
    const lowerBoundResult = getDuplicatedJourney([journey1], journeys)
    const upperBoundResult = getDuplicatedJourney(
      [...oldJourneys, journey1],
      journeys
    )
    expect(lowerBoundResult).toBeUndefined()
    expect(upperBoundResult).toBeUndefined()
  })
})

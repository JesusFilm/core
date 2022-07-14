import { formatISO, startOfYear } from 'date-fns'
import {
  ThemeName,
  ThemeMode,
  JourneyStatus,
  UserJourneyRole
} from '../../../../../../__generated__/globalTypes'
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
  const newJourneys = [journey1, journey2, duplicatedJourney]

  it('should return the duplicated journeys id', () => {
    const duplicatedJourneyId = getDuplicatedJourney(oldJourneys, newJourneys)
    expect(duplicatedJourneyId).toEqual('duplicated-journey-id')
  })

  it('should not return the duplicated journey id if journey length is the same', () => {
    const duplicatedJourneyId = getDuplicatedJourney(
      [...oldJourneys, journey1],
      newJourneys
    )
    expect(duplicatedJourneyId).not.toEqual('duplicated-journey-id')
  })
})

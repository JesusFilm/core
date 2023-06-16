import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'
import { getActions, Actions } from './getActions'

describe('getActions', () => {
  const journey: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    title: 'my journey',
    slug: 'my-journey',
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    },
    description: 'my cool journey',
    status: JourneyStatus.draft,
    createdAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    blocks: [],
    primaryImageBlock: null,
    userJourneys: [],
    template: null,
    seoTitle: null,
    seoDescription: null,
    chatButtons: []
  }

  const blockActions: Actions[] = [
    {
      url: 'https://www.example.com/',
      count: 1,
      actionType: 'block'
    }
  ]

  const chatButtonActions: Actions[] = [
    {
      url: 'https://www.example2.com/',
      count: 1,
      actionType: 'chatButton'
    }
  ]

  it('should return an empty array if journey is undefined', () => {
    const result = getActions()
    expect(result).toEqual([])
  })

  it('should return an array of actions with correct counts', () => {
    const result = getActions(journey)
    expect(result).toEqual([...blockActions, ...chatButtonActions])
  })

  // it('should correctly count actions with the same url and actionType', () => {
  //   const journeyWithDuplicateActions: Journey = {
  //     // ...journey properties with duplicate actions
  //   }

  //   const expectedResult: Actions[] = [
  //     {
  //       url: 'https://www.example.com/',
  //       count: 2,
  //       actionType: 'block' as ActionType
  //     },
  //     {
  //       url: 'https://www.example2.com/',
  //       count: 1,
  //       actionType: 'chatButton' as ActionType
  //     }
  //   ]

  //   const result = getActions(journeyWithDuplicateActions)
  //   expect(result).toEqual(expectedResult)
  // })
})

import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { formatISO, startOfYear } from 'date-fns'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../../__generated__/globalTypes'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_language as Language
} from './__generated__/GetJourney'
import { GET_JOURNEY, useJourneyQuery } from './useJourneyQuery'

describe('useJourneyQuery', () => {
  it('should get journey', async () => {
    const language: Language = {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      iso3: 'en',
      name: [
        {
          __typename: 'LanguageName',
          value: 'English',
          primary: true
        }
      ]
    }
    const journey: Journey = {
      __typename: 'Journey',
      id: 'journey.id',
      title: 'Default Journey Heading',
      description: null,
      themeName: ThemeName.base,
      themeMode: ThemeMode.light,
      slug: 'default',
      language,
      createdAt: formatISO(startOfYear(new Date())),
      updatedAt: formatISO(startOfYear(new Date())),
      publishedAt: null,
      status: JourneyStatus.draft,
      seoTitle: null,
      seoDescription: null,
      template: false,
      featuredAt: null,
      strategySlug: null,
      blocks: [],
      primaryImageBlock: null,
      creatorDescription: null,
      creatorImageBlock: null,
      chatButtons: [],
      host: null,
      team: null,
      userJourneys: [
        {
          __typename: 'UserJourney',
          id: 'user-journey-id',
          role: UserJourneyRole.owner,
          openedAt: null,
          user: {
            __typename: 'User',
            id: 'user-id1',
            firstName: 'Amin',
            lastName: 'One',
            imageUrl: 'https://bit.ly/3Gth4Yf'
          }
        }
      ],
      tags: [],
      website: null,
      showShareButton: null,
      showLikeButton: null,
      showDislikeButton: null,
      displayTitle: null,
      logoImageBlock: null,
      menuButtonIcon: null,
      menuStepBlock: null,
      socialNodeX: null,
      socialNodeY: null,
      journeyTheme: null,
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      fromTemplateId: null
    }

    const result = jest.fn(() => ({ data: { journey } }))

    renderHook(
      () =>
        useJourneyQuery({
          id: 'journey.id'
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_JOURNEY,
                  variables: {
                    id: 'journey.id'
                  }
                },
                result
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await act(
      async () => await waitFor(() => expect(result).toHaveBeenCalled())
    )
  })
})

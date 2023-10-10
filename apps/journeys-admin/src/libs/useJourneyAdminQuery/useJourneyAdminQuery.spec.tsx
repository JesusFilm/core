import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { formatISO, startOfYear } from 'date-fns'

import {
  GetJourneyAdmin_journey as Journey,
  GetJourneyAdmin_journey_language as Language
} from '../../../__generated__/GetJourneyAdmin'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../../__generated__/globalTypes'

import { GET_JOURNEY_ADMIN, useJourneyAdminQuery } from './useJourneyAdminQuery'

describe('useJourneyQuery', () => {
  it('should get journey', async () => {
    const language: Language = {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      iso3: 'en',
      name: [
        {
          __typename: 'Translation',
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
      publishedAt: null,
      status: JourneyStatus.draft,
      seoTitle: null,
      seoDescription: null,
      template: false,
      featuredAt: null,
      strategySlug: null,
      blocks: [],
      primaryImageBlock: null,
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
            email: '1@email.com',
            imageUrl: 'https://bit.ly/3Gth4Yf'
          }
        }
      ],
      tags: []
    }

    const result = jest.fn(() => ({ data: { journey } }))

    renderHook(
      () =>
        useJourneyAdminQuery({
          id: 'journey.id'
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_JOURNEY_ADMIN,
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

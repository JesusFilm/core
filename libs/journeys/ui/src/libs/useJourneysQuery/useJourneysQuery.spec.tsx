import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { formatISO, startOfYear } from 'date-fns'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../../__generated__/globalTypes'

import { GET_JOURNEYS, useJourneysQuery } from './useJourneysQuery'

describe('useJourneysQuery', () => {
  it('should get journeys', async () => {
    const result = jest.fn(() => ({
      data: {
        journeys: [
          {
            id: 'journey.id',
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
                  __typename: 'LanguageName',
                  value: 'English',
                  primary: true
                },
                {
                  __typename: 'LanguageName',
                  value: 'English',
                  primary: false
                }
              ]
            },
            createdAt: formatISO(startOfYear(new Date())),
            publishedAt: null,
            status: JourneyStatus.draft,
            seoTitle: null,
            seoDescription: null,
            tags: [],
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
            ]
          }
        ]
      }
    }))

    renderHook(
      () =>
        useJourneysQuery({
          variables: {
            where: {
              template: true
            }
          }
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_JOURNEYS,
                  variables: {
                    where: {
                      template: true
                    }
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

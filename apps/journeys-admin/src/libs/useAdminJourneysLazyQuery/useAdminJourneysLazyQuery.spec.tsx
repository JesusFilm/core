import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { formatISO, startOfYear } from 'date-fns'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../useAdminJourneysQuery/useAdminJourneysQuery'

import { useAdminJourneysLazyQuery } from './useAdminJourneysLazyQuery'

describe('useAdminJourneysLazyQuery', () => {
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
                  __typename: 'Translation',
                  value: 'English',
                  primary: true
                }
              ]
            },
            createdAt: formatISO(startOfYear(new Date())),
            publishedAt: null,
            status: JourneyStatus.draft,
            seoTitle: null,
            seoDescription: null,
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

    const { result: hookResult } = renderHook(
      () => useAdminJourneysLazyQuery(),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_ADMIN_JOURNEYS,
                  variables: {
                    status: [JourneyStatus.draft],
                    template: true
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

    await hookResult.current[0]({
      variables: {
        status: [JourneyStatus.draft],
        template: true
      }
    })

    await act(
      async () => await waitFor(() => expect(result).toHaveBeenCalled())
    )
  })
})

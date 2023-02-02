import { MockedProvider } from '@apollo/client/testing'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { GetJourney_journey_userJourneys as UserJourney } from '../../../__generated__/GetJourney'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { useUserJourneyOpen, USER_JOURNEY_OPEN } from './useUserJourneyOpen'

describe('useUserJourneyOpen', () => {
  const userJourneys: UserJourney[] = [
    {
      __typename: 'UserJourney',
      id: 'userJourney1.id',
      role: UserJourneyRole.owner,
      openedAt: null,
      user: {
        __typename: 'User',
        id: 'user.id',
        firstName: 'firstName',
        lastName: 'lastName',
        imageUrl: null
      }
    },
    {
      __typename: 'UserJourney',
      id: 'userJourney2.id',
      role: UserJourneyRole.editor,
      openedAt: null,
      user: {
        __typename: 'User',
        id: 'user2.id',
        firstName: 'firstName',
        lastName: 'lastName',
        imageUrl: null
      }
    }
  ]

  it('should update userJourney openedAt', async () => {
    const result = jest.fn(() => ({
      data: {
        userJourneyOpen: {
          id: 'UserJourney1.id'
        }
      }
    }))

    renderHook(
      () => useUserJourneyOpen('user.id', 'journey.id', userJourneys),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: USER_JOURNEY_OPEN,
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

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should not update openedAt if user is not in userJourneys', async () => {
    const result = jest.fn()

    renderHook(() => useUserJourneyOpen(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: USER_JOURNEY_OPEN,
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
    })

    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('should not update openedAt if user is not in userJourneys', async () => {
    const result = jest.fn()

    renderHook(
      () => useUserJourneyOpen('anotherUser.id', 'journey.id', userJourneys),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: USER_JOURNEY_OPEN,
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

    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })
})

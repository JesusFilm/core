import { MockedProvider } from '@apollo/client/testing'
import { waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import { GetJourney_journey_userJourneys as UserJourney } from '../../../__generated__/GetJourney'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { useUserJourneyOpen, USER_JOURNEY_OPEN } from './useUserJourneyOpen.ts'

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
      openedAt: '2021-11-19T12:34:56.647Z',
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
    await act(
      async () => await waitFor(() => expect(result).toHaveBeenCalled())
    )
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

  it('should not update openedAt if userJourney is already opened', async () => {
    const result = jest.fn()

    renderHook(
      () => useUserJourneyOpen('user2.id', 'journey.id', userJourneys),
      {
        wrapper: ({ children }) => <MockedProvider>{children}</MockedProvider>
      }
    )

    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('should not update openedAt if userId is not given', async () => {
    const result = jest.fn()

    renderHook(() => useUserJourneyOpen(null, 'journeyId', userJourneys), {
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

  it('should not update openedAt if journeyId is not given', async () => {
    const result = jest.fn()

    renderHook(() => useUserJourneyOpen('user.id', undefined, userJourneys), {
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

  it('should not update openedAt if userJourneys is not given', async () => {
    const result = jest.fn()

    renderHook(() => useUserJourneyOpen('user.id', 'journey.id', undefined), {
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

  it('should not update openedAt if userJourneys is empty', async () => {
    const result = jest.fn()

    renderHook(() => useUserJourneyOpen('user.id', 'journey.id', []), {
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
})

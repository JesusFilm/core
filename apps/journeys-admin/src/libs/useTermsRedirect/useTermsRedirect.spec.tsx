import { MockedProvider } from '@apollo/client/testing'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { useRouter } from 'next/router'
import { useTermsRedirect, GET_JOURNEY_PROFILE } from './useTermsRedirect'

jest.mock('next/router', () => ({ useRouter: jest.fn() }))

describe('useTermsRedirect', () => {
  it('should not redirect if user has accepted the terms', async () => {
    renderHook(() => useTermsRedirect(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_JOURNEY_PROFILE
              },
              result: {
                data: {
                  getJourneyProfile: {
                    id: 'profile.id',
                    userId: 'user.id',
                    acceptedTermsAt: '1970-01-01T00:00:00.000Z'
                  }
                }
              }
            }
          ]}
        >
          {children}
        </MockedProvider>
      )
    })

    const mockRouter = {
      push: jest.fn()
    }

    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    await waitFor(() => expect(mockRouter.push).not.toHaveBeenCalled())
  })

  it('should redirect if no user profile was found', async () => {
    renderHook(() => useTermsRedirect(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_JOURNEY_PROFILE
              },
              result: {
                data: {
                  getJourneyProfile: null
                }
              }
            }
          ]}
        >
          {children}
        </MockedProvider>
      )
    })

    const mockRouter = {
      push: jest.fn()
    }

    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith(
        '/users/terms-and-conditions'
      )
    )
  })

  it('should redirect if acceptedTermsAt is null', async () => {
    renderHook(() => useTermsRedirect(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_JOURNEY_PROFILE
              },
              result: {
                data: {
                  getJourneyProfile: {
                    id: 'profile.id',
                    userId: 'user.id',
                    acceptedTermsAt: null
                  }
                }
              }
            }
          ]}
        >
          {children}
        </MockedProvider>
      )
    })

    const mockRouter = {
      push: jest.fn()
    }

    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith(
        '/users/terms-and-conditions'
      )
    )
  })
})

import { MockedProvider } from '@apollo/client/testing'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks'

import { GET_CURRENT_USER, useCurrentUser } from './useCurrentUser'

describe('useCurrentUser', () => {
  it('should return current user when called', async () => {
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_CURRENT_USER
              },
              result: {
                data: {
                  me: {
                    id: 'user.id',
                    email: 'test@email.com'
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

    await act(async () => {
      await result.current.loadUser()

      await waitFor(() =>
        expect(result.current.data).toEqual({
          id: 'user.id',
          email: 'test@email.com'
        })
      )
    })
  })

  it('should return placeholder user by default', async () => {
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_CURRENT_USER
              },
              result: {
                data: {
                  me: {
                    id: 'user.id',
                    email: 'test@email.com'
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

    expect(result.current.data).toEqual({
      __typename: 'User',
      id: '',
      email: ''
    })
  })
})

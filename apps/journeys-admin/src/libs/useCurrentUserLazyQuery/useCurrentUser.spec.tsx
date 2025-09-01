import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import {
  GET_CURRENT_USER,
  useCurrentUserLazyQuery
} from './useCurrentUserLazyQuery'

describe('useCurrentUserLazyQuery', () => {
  it('should return current user when called', async () => {
    const { result } = renderHook(() => useCurrentUserLazyQuery(), {
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
    })

    await waitFor(() =>
      expect(result.current.data).toEqual({
        id: 'user.id',
        email: 'test@email.com'
      })
    )
  })

  it('should return placeholder user by default', async () => {
    const { result } = renderHook(() => useCurrentUserLazyQuery(), {
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

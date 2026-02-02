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
                    __typename: 'User',
                    id: 'user.id',
                    userId: 'firebase-uid-123',
                    email: 'test@email.com',
                    firstName: 'Test',
                    lastName: 'User',
                    emailVerified: true
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
        __typename: 'User',
        id: 'user.id',
        userId: 'firebase-uid-123',
        email: 'test@email.com',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true
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
                    __typename: 'User',
                    id: 'user.id',
                    userId: 'firebase-uid-123',
                    email: 'test@email.com',
                    firstName: 'Test',
                    lastName: 'User',
                    emailVerified: true
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
      userId: '',
      email: null,
      firstName: '',
      lastName: null,
      emailVerified: false
    })
  })
})

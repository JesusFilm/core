import { MockedProvider } from '@apollo/client/testing'
import { waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import { noop } from 'lodash'
import { GET_CURRENT_USER, useCurrentUser } from './useCurrentUser'

describe('useCurrentUser', () => {
  it('should return current user', async () => {
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

    await act(
      async () =>
        await waitFor(() =>
          expect(result.current).toEqual({
            id: 'user.id',
            email: 'test@email.com'
          })
        )
    )
  })

  it('should throw error if user not found', async () => {
    renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_CURRENT_USER
              },
              result: {
                data: {
                  me: null
                }
              }
            }
          ]}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(
      async () =>
        await waitFor(() => noop()).catch((error) => {
          expect(error.message).toEqual('Current user cannot be found')
        })
    )
  })

  it('should return placeholder user if loading', async () => {
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

    expect(result.current).toEqual({
      id: '',
      email: ''
    })
  })
})

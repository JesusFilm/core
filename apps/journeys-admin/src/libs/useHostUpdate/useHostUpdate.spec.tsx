import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks'

import { UPDATE_HOST, useHostUpdate } from './useHostUpdate'

describe('useHostUpdate', () => {
  it('returns a function which updates a host by id and teamId', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        hosts: [{ __ref: 'Host:hostId' }]
      }
    })

    const { result } = renderHook(() => useHostUpdate(), {
      wrapper: ({ children }) => (
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: UPDATE_HOST,
                variables: {
                  id: 'hostId',
                  teamId: 'teamId',
                  input: {
                    title: 'newTitle',
                    location: 'newLocation',
                    src1: 'newSrc1',
                    src2: 'newSrc2'
                  }
                }
              },
              result: {
                data: {
                  hostUpdate: {
                    id: 'hostId',
                    __typename: 'Host',
                    teamId: 'teamId',
                    title: 'newTitle',
                    location: 'newLocation',
                    src1: 'newSrc1',
                    src2: 'newSrc2'
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
      await waitFor(async () => {
        expect(
          await result.current.updateHost({
            id: 'hostId',
            teamId: 'teamId',
            input: {
              title: 'newTitle',
              location: 'newLocation',
              src1: 'newSrc1',
              src2: 'newSrc2'
            }
          })
        ).toMatchObject({
          id: 'hostId',
          __typename: 'Host',
          title: 'newTitle',
          location: 'newLocation',
          src1: 'newSrc1',
          src2: 'newSrc2'
        })
      })
      await waitFor(async () => {
        expect(cache.extract()?.ROOT_QUERY?.hosts).toEqual([
          { __ref: 'Host:hostId' }
        ])
      })
    })
  })

  it('returns a function which returns undefined if error', async () => {
    const { result } = renderHook(() => useHostUpdate(), {
      wrapper: ({ children }) => (
        <MockedProvider
          addTypename={false}
          mocks={[
            {
              request: {
                query: UPDATE_HOST,
                variables: {
                  id: 'hostId',
                  teamId: 'teamId'
                }
              },
              result: {
                data: {}
              }
            }
          ]}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await waitFor(async () => {
        expect(
          await result.current.updateHost({
            id: 'hostId',
            teamId: 'teamId',
            input: {}
          })
        ).toBeUndefined()
      })
    })
  })
})

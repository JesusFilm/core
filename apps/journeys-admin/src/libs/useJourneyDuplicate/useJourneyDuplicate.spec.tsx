import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import { useJourneyDuplicate, DUPLICATE_JOURNEY } from './useJourneyDuplicate'

describe('useJourneyDuplicate', () => {
  it('returns a function which duplicates a journey by id', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        adminJourneys: [{ __ref: 'Journey:journeyId' }]
      }
    })

    const { result } = renderHook(() => useJourneyDuplicate(), {
      wrapper: ({ children }) => (
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: DUPLICATE_JOURNEY,
                variables: {
                  id: 'journeyId'
                }
              },
              result: {
                data: {
                  journeyDuplicate: {
                    id: 'duplicatedJourneyId',
                    __typename: 'Journey'
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
          await result.current.duplicateJourney({ id: 'journeyId' })
        ).toMatchObject({
          id: 'duplicatedJourneyId',
          __typename: 'Journey'
        })
      })
      await waitFor(async () => {
        expect(cache.extract()?.ROOT_QUERY?.adminJourneys).toEqual([
          { __ref: 'Journey:journeyId' },
          { __ref: 'Journey:duplicatedJourneyId' }
        ])
      })
    })
  })

  it('returns a function which returns undefined if error', async () => {
    const { result } = renderHook(() => useJourneyDuplicate(), {
      wrapper: ({ children }) => (
        <MockedProvider
          addTypename={false}
          mocks={[
            {
              request: {
                query: DUPLICATE_JOURNEY,
                variables: {
                  id: 'journeyId'
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
        expect(await result.current.duplicateJourney({ id: 'errored' })).toBe(
          undefined
        )
      })
    })
  })
})

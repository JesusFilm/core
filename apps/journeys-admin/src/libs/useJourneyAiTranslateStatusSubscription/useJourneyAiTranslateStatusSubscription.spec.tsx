import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'

import {
  JOURNEY_AI_TRANSLATE_STATUS,
  useJourneyAiTranslateStatusSubscription
} from './useJourneyAiTranslateStatusSubscription'

const jobId = 'journeyAiTranslate/journey-123:es-419'

const mockStatusData = {
  id: jobId,
  status: 'processing',
  progress: 25
}

describe('useJourneyAiTranslateStatusSubscription', () => {
  // TODO: revisit this test
  it('subscribes to translation status updates', async () => {
    const cache = new InMemoryCache()

    const { result } = renderHook(
      () => useJourneyAiTranslateStatusSubscription(jobId),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            cache={cache}
            mocks={[
              {
                request: {
                  query: JOURNEY_AI_TRANSLATE_STATUS, // change query to subscription ?
                  variables: { jobId }
                },
                result: {
                  data: {
                    journeyAiTranslateStatus: mockStatusData
                  }
                }
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    // Initially in loading state
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeUndefined()

    // Wait for the subscription to initialize
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Note: MockedProvider doesn't actually send subscription data in tests
    // This just verifies the subscription setup process works correctly
  })

  it('handles null data from subscription', async () => {
    const { result } = renderHook(
      () => useJourneyAiTranslateStatusSubscription(jobId),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: JOURNEY_AI_TRANSLATE_STATUS,
                  variables: { jobId }
                },
                result: {
                  data: {
                    journeyAiTranslateStatus: null
                  }
                }
              }
            ]}
            addTypename={false}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    // Wait for the loading to finish
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verify data is undefined when null is returned (based on our implementation)
    expect(result.current.data).toBeUndefined()
  })

  it('handles errors in subscription', async () => {
    const { result } = renderHook(
      () => useJourneyAiTranslateStatusSubscription(jobId),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: JOURNEY_AI_TRANSLATE_STATUS,
                  variables: { jobId }
                },
                error: new Error('Subscription error')
              }
            ]}
            addTypename={false}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    // Wait for the error to be processed
    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

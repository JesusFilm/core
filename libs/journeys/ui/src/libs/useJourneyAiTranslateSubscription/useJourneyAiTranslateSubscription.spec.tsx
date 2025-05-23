import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'

import {
  JOURNEY_AI_TRANSLATE_CREATE,
  useJourneyAiTranslateSubscription
} from './useJourneyAiTranslateSubscription'

// Use the exact variable names that match what the components are using
const variables = {
  journeyId: 'journey-123',
  name: 'Translated Journey',
  journeyLanguageName: 'English',
  textLanguageId: 'es-419',
  textLanguageName: 'Spanish'
}

const translatedJourney = {
  id: 'journey-123',
  title: 'Viaje Traducido', // Spanish translation of "Translated Journey"
  description: 'Esta es una descripción traducida', // "This is a translated description"
  languageId: 'es-419',
  createdAt: '2023-04-25T12:34:56Z',
  updatedAt: '2023-04-25T12:34:56Z'
}

const data = {
  journeyAiTranslateCreate: translatedJourney
}

describe('useJourneyAiTranslateSubscription', () => {
  it('returns subscription data when translation is received', async () => {
    const cache = new InMemoryCache()

    const { result } = renderHook(
      () =>
        useJourneyAiTranslateSubscription({
          variables
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            cache={cache}
            mocks={[
              {
                request: {
                  query: JOURNEY_AI_TRANSLATE_CREATE,
                  variables
                },
                result: { data }
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await act(async () => {
      // For subscriptions, we check the data property directly
      expect(result.current.data?.journeyAiTranslateCreate).toEqual(
        translatedJourney
      )
    })
  })

  it('handles subscription errors', async () => {
    const { result } = renderHook(
      () =>
        useJourneyAiTranslateSubscription({
          variables
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            addTypename={false}
            mocks={[
              {
                request: {
                  query: JOURNEY_AI_TRANSLATE_CREATE,
                  variables
                },
                error: new Error('An error occurred')
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await act(async () => {
      expect(result.current.error).toBeDefined()
    })
  })

  it('returns a loading state', async () => {
    const { result } = renderHook(
      () =>
        useJourneyAiTranslateSubscription({
          variables
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            addTypename={false}
            mocks={[
              {
                request: {
                  query: JOURNEY_AI_TRANSLATE_CREATE,
                  variables
                },
                result: { data }
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    // Check that loading state exists for subscriptions
    expect(result.current.loading).toBeDefined()
  })
})

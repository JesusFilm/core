import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import {
  JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION,
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
  updatedAt: '2023-04-25T12:34:56Z',
  blocks: [
    {
      id: 'block-1',
      __typename: 'TypographyBlock',
      content: 'Contenido traducido',
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    },
    {
      id: 'block-2',
      __typename: 'ButtonBlock',
      label: 'Botón traducido'
    }
  ]
}

const data = {
  journeyAiTranslateCreateSubscription: {
    progress: 100,
    message: 'Translation complete',
    journey: translatedJourney,
    __typename: 'JourneyAiTranslateCreateSubscriptionPayload'
  }
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
                  query: JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION,
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

    await waitFor(() => {
      expect(
        result.current.data?.journeyAiTranslateCreateSubscription.journey
      ).toEqual(translatedJourney)
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
                  query: JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION,
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

    await waitFor(() => {
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
                  query: JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION,
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

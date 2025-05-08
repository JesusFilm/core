import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import {
  JOURNEY_AI_TRANSLATE_CREATE,
  useJourneyAiTranslateMutation
} from './useJourneyAiTranslateMutation'

const variables = {
  journeyId: 'journey-123',
  name: 'Translated Journey',
  journeyLanguageName: 'English',
  textLanguageId: 'es-419',
  textLanguageName: 'Spanish'
}

const data = {
  journeyAiTranslateCreate: 'journeyAiTranslate/journey-123:es-419'
}

describe('useJourneyAiTranslateMutation', () => {
  it('returns a function which creates a translation job', async () => {
    const cache = new InMemoryCache()

    const { result } = renderHook(() => useJourneyAiTranslateMutation(), {
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
    })

    await act(async () => {
      await waitFor(async () => {
        expect(await result.current.translateJourney(variables)).toBe(
          data.journeyAiTranslateCreate
        )
      })
    })
  })

  it('returns a function which returns undefined if error', async () => {
    const { result } = renderHook(() => useJourneyAiTranslateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider
          addTypename={false}
          mocks={[
            {
              request: {
                query: JOURNEY_AI_TRANSLATE_CREATE,
                variables: { id: undefined }
              },
              result: { data: {} }
            }
          ]}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await waitFor(async () => {
        expect(await result.current.translateJourney(variables)).toBeUndefined()
      })
    })
  })

  it('returns a loading state', async () => {
    const { result } = renderHook(() => useJourneyAiTranslateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider
          addTypename={false}
          mocks={[
            {
              request: {
                query: JOURNEY_AI_TRANSLATE_CREATE,
                variables: { id: undefined }
              },
              result: { data: {} }
            }
          ]}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await waitFor(async () => {
        expect(await result.current.loading).toBe(false)
      })
    })
  })
})

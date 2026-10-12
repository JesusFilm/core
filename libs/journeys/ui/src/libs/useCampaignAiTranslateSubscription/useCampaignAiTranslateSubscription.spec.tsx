import { InMemoryCache, gql } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing/react'
import { renderHook, waitFor } from '@testing-library/react'

import {
  CAMPAIGN_AI_TRANSLATE_SUBSCRIPTION,
  isMachineTranslatable,
  useCampaignAiTranslateSubscription
} from './useCampaignAiTranslateSubscription'

const variables = {
  campaignId: 'campaignId',
  languageId: '496',
  mode: 'missing' as const
}

const progress = {
  __typename: 'CampaignAiTranslateProgress',
  progress: 100,
  message: 'Translation completed!',
  campaign: {
    __typename: 'Campaign',
    id: 'campaignId',
    titleTranslations: [
      {
        __typename: 'TranslatedValue',
        languageId: '496',
        value: 'Noël 2026',
        source: 'machine'
      }
    ]
  }
}

function wrapper(
  mock: Record<string, unknown>,
  cache = new InMemoryCache()
): ({ children }: { children: React.ReactNode }) => React.ReactElement {
  return function Wrapper({ children }) {
    return (
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: CAMPAIGN_AI_TRANSLATE_SUBSCRIPTION,
              variables
            },
            ...mock
          }
        ]}
      >
        {children}
      </MockedProvider>
    )
  }
}

describe('useCampaignAiTranslateSubscription', () => {
  it('returns progress as the run reports it', async () => {
    const { result } = renderHook(
      () => useCampaignAiTranslateSubscription({ variables }),
      {
        wrapper: wrapper({
          result: { data: { campaignAiTranslateSubscription: progress } }
        })
      }
    )

    await waitFor(() =>
      expect(result.current.data?.campaignAiTranslateSubscription).toEqual(
        progress
      )
    )
  })

  it('does not run without variables', () => {
    const onData = vi.fn()
    renderHook(() => useCampaignAiTranslateSubscription({ onData }), {
      wrapper: wrapper({
        result: { data: { campaignAiTranslateSubscription: progress } }
      })
    })

    expect(onData).not.toHaveBeenCalled()
  })

  it('does not run when skipped', () => {
    const onData = vi.fn()
    renderHook(
      () =>
        useCampaignAiTranslateSubscription({
          variables,
          skip: true,
          onData
        }),
      {
        wrapper: wrapper({
          result: { data: { campaignAiTranslateSubscription: progress } }
        })
      }
    )

    expect(onData).not.toHaveBeenCalled()
  })

  it('calls onComplete when the run finishes', async () => {
    const onComplete = vi.fn()
    renderHook(
      () => useCampaignAiTranslateSubscription({ variables, onComplete }),
      {
        wrapper: wrapper({
          result: { data: { campaignAiTranslateSubscription: progress } }
        })
      }
    )

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1))
  })

  it('reports an error without calling onComplete', async () => {
    const onError = vi.fn()
    const onComplete = vi.fn()
    renderHook(
      () =>
        useCampaignAiTranslateSubscription({ variables, onError, onComplete }),
      {
        wrapper: wrapper({ error: new Error('Translation failed') })
      }
    )

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1))
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('drops the cached Translations view rows when the run delivers the campaign', async () => {
    const cache = new InMemoryCache()
    cache.writeQuery({
      query: gql`
        query StaleRows {
          campaignTranslations(campaignId: "campaignId", languageId: "496") {
            group
          }
        }
      `,
      data: {
        campaignTranslations: [
          { __typename: 'CampaignTranslation', group: 'landing' }
        ]
      }
    })
    expect(
      Object.keys(cache.extract().ROOT_QUERY ?? {}).some((key) =>
        key.startsWith('campaignTranslations')
      )
    ).toBe(true)
    const { result } = renderHook(
      () => useCampaignAiTranslateSubscription({ variables }),
      {
        wrapper: wrapper(
          { result: { data: { campaignAiTranslateSubscription: progress } } },
          cache
        )
      }
    )

    await waitFor(() => expect(result.current.data).toBeDefined())
    expect(
      Object.keys(cache.extract().ROOT_QUERY ?? {}).some((key) =>
        key.startsWith('campaignTranslations')
      )
    ).toBe(false)
  })
})

describe('isMachineTranslatable', () => {
  it.each([
    ['English', '529', true],
    ['Amharic', '4791', true],
    ['a language outside the model’s list', '9999999', false]
  ])('is %s: %s -> %s', (_name, languageId, expected) => {
    expect(isMachineTranslatable(languageId)).toBe(expected)
  })
})

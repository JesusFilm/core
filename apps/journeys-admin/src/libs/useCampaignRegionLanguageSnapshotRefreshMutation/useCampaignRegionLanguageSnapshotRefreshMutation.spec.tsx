import { ApolloLink } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook } from '@testing-library/react'
import { ReactNode } from 'react'

import { eurEnglish } from '../../components/CampaignEditor/data'

import {
  CAMPAIGN_REGION_LANGUAGE_SNAPSHOT_REFRESH,
  useCampaignRegionLanguageSnapshotRefreshMutation
} from './useCampaignRegionLanguageSnapshotRefreshMutation'

/** Records the context of every request, then answers from the mocks. */
function recordingLink(
  contexts: Array<Record<string, unknown>>,
  mocks: MockLink.MockedResponse[]
): ApolloLink {
  return ApolloLink.from([
    new ApolloLink((operation, forward) => {
      contexts.push(operation.getContext())
      return forward(operation)
    }),
    new MockLink(mocks)
  ])
}

const mock: MockLink.MockedResponse = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_SNAPSHOT_REFRESH,
    variables: { id: eurEnglish.id }
  },
  result: { data: { campaignRegionLanguageSnapshotRefresh: eurEnglish } }
}

function wrapperWith(
  contexts: Array<Record<string, unknown>>
): ({ children }: { children: ReactNode }) => ReactNode {
  return function Wrapper({ children }: { children: ReactNode }): ReactNode {
    return (
      <MockedProvider link={recordingLink(contexts, [mock])}>
        {children}
      </MockedProvider>
    )
  }
}

describe('useCampaignRegionLanguageSnapshotRefreshMutation', () => {
  it('skips the mutation queue', async () => {
    const contexts: Array<Record<string, unknown>> = []
    const { result } = renderHook(
      () => useCampaignRegionLanguageSnapshotRefreshMutation(),
      {
        wrapper: wrapperWith(contexts)
      }
    )

    await act(async () => {
      await result.current[0]({ variables: { id: eurEnglish.id } })
    })

    expect(contexts).toHaveLength(1)
    expect(contexts[0].skipQueue).toBe(true)
  })

  it('keeps the context the caller passes', async () => {
    const contexts: Array<Record<string, unknown>> = []
    const { result } = renderHook(
      () =>
        useCampaignRegionLanguageSnapshotRefreshMutation({
          context: { flush: 'slotId' }
        }),
      { wrapper: wrapperWith(contexts) }
    )

    await act(async () => {
      await result.current[0]({ variables: { id: eurEnglish.id } })
    })

    expect(contexts[0]).toMatchObject({ flush: 'slotId', skipQueue: true })
  })
})

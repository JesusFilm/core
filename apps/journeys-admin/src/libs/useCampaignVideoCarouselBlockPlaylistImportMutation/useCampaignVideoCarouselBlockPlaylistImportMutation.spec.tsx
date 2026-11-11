import { ApolloLink } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook } from '@testing-library/react'
import { ReactNode } from 'react'

import {
  CAMPAIGN_VIDEO_CAROUSEL_BLOCK_PLAYLIST_IMPORT,
  useCampaignVideoCarouselBlockPlaylistImportMutation
} from './useCampaignVideoCarouselBlockPlaylistImportMutation'

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
    query: CAMPAIGN_VIDEO_CAROUSEL_BLOCK_PLAYLIST_IMPORT,
    variables: {
      id: 'carouselId',
      url: 'https://www.youtube.com/playlist?list=PLplaylist'
    }
  },
  result: { data: { campaignVideoCarouselBlockPlaylistImport: [] } }
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

describe('useCampaignVideoCarouselBlockPlaylistImportMutation', () => {
  it('skips the mutation queue', async () => {
    const contexts: Array<Record<string, unknown>> = []
    const { result } = renderHook(
      () => useCampaignVideoCarouselBlockPlaylistImportMutation('campaignId'),
      {
        wrapper: wrapperWith(contexts)
      }
    )

    await act(async () => {
      await result.current(
        'carouselId',
        'https://www.youtube.com/playlist?list=PLplaylist'
      )
    })

    expect(contexts).toHaveLength(1)
    expect(contexts[0].skipQueue).toBe(true)
  })
})

import { ApolloLink } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import {
  CreateCloudflareTeamUploadByUrl,
  CreateCloudflareTeamUploadByUrlVariables
} from '../../../__generated__/CreateCloudflareTeamUploadByUrl'

import {
  CREATE_CLOUDFLARE_TEAM_UPLOAD_BY_URL,
  useCloudflareTeamUploadByUrlMutation
} from './useCloudflareTeamUploadByUrlMutation'

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
    query: CREATE_CLOUDFLARE_TEAM_UPLOAD_BY_URL,
    variables: { url: 'https://example.com/cover.jpg', teamId: 'teamId' }
  },
  result: {
    data: {
      createCloudflareUploadByUrl: {
        __typename: 'CloudflareImage',
        id: 'imageId',
        url: 'https://imagedelivery.net/hash/imageId'
      }
    }
  }
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

describe('useCloudflareTeamUploadByUrlMutation', () => {
  it('skips the mutation queue', async () => {
    const contexts: Array<Record<string, unknown>> = []
    const { result } = renderHook(
      () => useCloudflareTeamUploadByUrlMutation(),
      {
        wrapper: wrapperWith(contexts)
      }
    )

    await act(async () => {
      await result.current[0]({
        variables: { url: 'https://example.com/cover.jpg', teamId: 'teamId' }
      })
    })

    expect(contexts).toHaveLength(1)
    expect(contexts[0].skipQueue).toBe(true)
  })

  it('keeps the context the caller passes', async () => {
    const contexts: Array<Record<string, unknown>> = []
    const { result } = renderHook(
      () =>
        useCloudflareTeamUploadByUrlMutation({ context: { flush: 'slotId' } }),
      { wrapper: wrapperWith(contexts) }
    )

    await act(async () => {
      await result.current[0]({
        variables: { url: 'https://example.com/cover.jpg', teamId: 'teamId' }
      })
    })

    expect(contexts[0]).toMatchObject({ flush: 'slotId', skipQueue: true })
  })

  const variables: CreateCloudflareTeamUploadByUrlVariables = {
    url: 'https://example.com/image.jpg',
    teamId: 'team.id'
  }

  const data: CreateCloudflareTeamUploadByUrl = {
    createCloudflareUploadByUrl: {
      __typename: 'CloudflareImage',
      id: 'cloudflareImage.id',
      url: 'https://imagedelivery.net/hash/cloudflareImage.id/public'
    }
  }

  function renderMutation(
    mocks: Array<
      MockLink.MockedResponse<
        CreateCloudflareTeamUploadByUrl,
        CreateCloudflareTeamUploadByUrlVariables
      >
    >
  ): ReturnType<
    typeof renderHook<
      ReturnType<typeof useCloudflareTeamUploadByUrlMutation>,
      unknown
    >
  > {
    return renderHook(() => useCloudflareTeamUploadByUrlMutation(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MockedProvider mocks={mocks}>{children}</MockedProvider>
      )
    })
  }

  it('uploads the url under the team and returns the Cloudflare image', async () => {
    const result = vi.fn(() => ({ data }))
    const uploadMock: MockLink.MockedResponse<
      CreateCloudflareTeamUploadByUrl,
      CreateCloudflareTeamUploadByUrlVariables
    > = {
      request: { query: CREATE_CLOUDFLARE_TEAM_UPLOAD_BY_URL, variables },
      result
    }
    const { result: hook } = renderMutation([uploadMock])

    let response: Awaited<ReturnType<(typeof hook.current)[0]>> | undefined
    await act(async () => {
      response = await hook.current[0]({ variables })
    })

    expect(result).toHaveBeenCalledWith(variables)
    expect(response?.data).toEqual(data)
    await waitFor(() => expect(hook.current[1].data).toEqual(data))
  })

  it('rejects and exposes the error when the upload fails', async () => {
    const uploadMock: MockLink.MockedResponse<
      CreateCloudflareTeamUploadByUrl,
      CreateCloudflareTeamUploadByUrlVariables
    > = {
      request: { query: CREATE_CLOUDFLARE_TEAM_UPLOAD_BY_URL, variables },
      error: new Error('upload failed')
    }
    const { result: hook } = renderMutation([uploadMock])

    await act(async () => {
      await expect(hook.current[0]({ variables })).rejects.toThrow(
        'upload failed'
      )
    })

    await waitFor(() =>
      expect(hook.current[1].error?.message).toBe('upload failed')
    )
    expect(hook.current[1].data).toBeUndefined()
  })
})

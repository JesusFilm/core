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
} from '.'

describe('useCloudflareTeamUploadByUrlMutation', () => {
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

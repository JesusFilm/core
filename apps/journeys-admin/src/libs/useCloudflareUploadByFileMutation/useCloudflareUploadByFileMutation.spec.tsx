import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useCloudflareUploadByFileMutation } from './useCloudflareUploadByFileMutation'
import { cloudflareUploadMutationMock } from './useCloudflareUploadByFileMutation.mock'

describe('useCloudflareUploadByFileMutation', () => {
  it('should create cloudflare upload by file', async () => {
    const { result } = renderHook(() => useCloudflareUploadByFileMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[cloudflareUploadMutationMock]}>
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await waitFor(async () => {
        await result.current[0]({
          variables: {}
        })
        expect(cloudflareUploadMutationMock.result).toHaveBeenCalled()
      })
    })
  })
})

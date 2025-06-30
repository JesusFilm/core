import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'

import { useCreateR2AssetMutation } from './useCreateR2Asset'
import { getCreateR2AssetMock } from './useCreateR2Asset.mock'

const createR2AssetMock = getCreateR2AssetMock({
  videoId: 'video-id',
  fileName: 'test.txt',
  originalFilename: 'test.txt',
  contentType: 'text/vtt',
  contentLength: 100
})

describe('useCreateR2AssetMutation', () => {
  it('should create an R2 asset', async () => {
    const { result } = renderHook(() => useCreateR2AssetMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[createR2AssetMock]}>{children}</MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0]({
        variables: {
          input: {
            videoId: 'video-id',
            fileName: 'test.txt',
            originalFilename: 'test.txt',
            contentType: 'text/vtt',
            contentLength: 100
          }
        }
      })

      expect(createR2AssetMock.result).toHaveBeenCalled()
    })
  })
})

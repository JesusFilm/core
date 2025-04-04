import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { videoVariantDownloadUpdateMock } from './useVideoVariantDownloadUpdate.mock'

import { useVideoVariantDownloadUpdate } from '.'

describe('useVideoVariantDownloadUpdateMutation', () => {
  it('should update a video variant download', async () => {
    const { result } = renderHook(() => useVideoVariantDownloadUpdate(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[videoVariantDownloadUpdateMock]}>
          <SnackbarProvider>{children}</SnackbarProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      await waitFor(async () => {
        await result.current[0]({
          variables: {
            input: {
              id: 'download-id',
              quality: 'high',
              size: 1024,
              height: 720,
              width: 1280,
              url: 'https://example.com/video.mp4',
              version: 1
            }
          }
        })
        expect(videoVariantDownloadUpdateMock.result).toHaveBeenCalled()
      })
    })
  })
})

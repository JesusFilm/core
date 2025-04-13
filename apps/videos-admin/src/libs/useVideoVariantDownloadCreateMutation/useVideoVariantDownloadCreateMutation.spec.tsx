import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { useVideoVariantDownloadCreateMutation } from './useVideoVariantDownloadCreateMutation'
import { getVideoVariantDownloadCreateMock } from './useVideoVariantDownloadCreateMutation.mock'

const videoVariantDownloadCreateMock = getVideoVariantDownloadCreateMock({
  videoVariantId: 'variant-id',
  quality: 'high',
  size: 4.94,
  height: 720,
  width: 1280,
  url: 'https://example.com/video.mp4',
  version: 1,
  assetId: 'asset-id'
})

describe('useVideoVariantDownloadCreateMutation', () => {
  it('should create a video variant download', async () => {
    const { result } = renderHook(
      () => useVideoVariantDownloadCreateMutation(),
      {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[videoVariantDownloadCreateMock]}>
            <SnackbarProvider>{children}</SnackbarProvider>
          </MockedProvider>
        )
      }
    )

    await act(async () => {
      await waitFor(async () => {
        await result.current[0]({
          variables: {
            input: {
              videoVariantId: 'variant-id',
              quality: 'high',
              size: 4.94,
              height: 720,
              width: 1280,
              url: 'https://example.com/video.mp4',
              version: 1,
              assetId: 'asset-id'
            }
          }
        })
        expect(videoVariantDownloadCreateMock.result).toHaveBeenCalled()
      })
    })
  })
})

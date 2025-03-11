import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { useVideoVariantDownloadCreateMutation } from './useVideoVariantDownloadCreateMutation'
import { videoVariantDownloadCreateMock } from './useVideoVariantDownloadCreateMutation.mock'

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

    const [mutate] = result.current
    void mutate({
      variables: {
        input: {
          videoVariantId: 'variant-id',
          quality: 'high',
          size: 4.94,
          height: 720,
          width: 1280,
          url: 'https://example.com/video.mp4',
          version: 1
        }
      }
    })

    await waitFor(() => {
      expect(result.current[1].data?.videoVariantDownloadCreate.id).toBe(
        'download-id'
      )
    })
  })
})

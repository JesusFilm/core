import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { useVideoVariantDownloadDeleteMutation } from './useVideoVariantDownloadDeleteMutation'
import { videoVariantDownloadDeleteMock } from './useVideoVariantDownloadDeleteMutation.mock'

describe('useVideoVariantDownloadDeleteMutation', () => {
  it('should delete a video variant download', async () => {
    const { result } = renderHook(
      () => useVideoVariantDownloadDeleteMutation(),
      {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[videoVariantDownloadDeleteMock]}>
            <SnackbarProvider>{children}</SnackbarProvider>
          </MockedProvider>
        )
      }
    )

    await act(async () => {
      await waitFor(async () => {
        await result.current[0]({
          variables: {
            id: 'download-id'
          }
        })
        expect(videoVariantDownloadDeleteMock.result).toHaveBeenCalled()
      })
    })
  })
})

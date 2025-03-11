import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
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

    const [mutate] = result.current
    void mutate({
      variables: {
        id: 'download-id'
      }
    })

    await waitFor(() => {
      expect(result.current[1].data?.videoVariantDownloadDelete.id).toBe(
        'download-id'
      )
    })
  })
})

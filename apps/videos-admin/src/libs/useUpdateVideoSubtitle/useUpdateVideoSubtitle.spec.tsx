import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'

import { useUpdateVideoSubtitle } from './useUpdateVideoSubtitle'
import { getUpdateVideoSubtitleMock } from './useUpdateVideoSubtitle.mock'

const updateVideoSubtitleMock = getUpdateVideoSubtitleMock({
  id: 'subtitle1.id',
  edition: 'base',
  languageId: '529',
  primary: true,
  vttSrc: 'https://example.com/subtitle.vtt',
  srtSrc: null,
  vttAssetId: 'vtt-asset-id',
  srtAssetId: null,
  vttVersion: 1,
  srtVersion: 1
})

describe('useUpdateVideoSubtitle', () => {
  it('should update a video subtitle', async () => {
    const { result } = renderHook(() => useUpdateVideoSubtitle(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[updateVideoSubtitleMock]}>
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0]({
        variables: {
          input: {
            id: 'subtitle1.id',
            edition: 'base',
            languageId: '529',
            primary: true,
            vttSrc: 'https://example.com/subtitle.vtt',
            srtSrc: null,
            vttAssetId: 'vtt-asset-id',
            srtAssetId: null,
            vttVersion: 1,
            srtVersion: 1
          }
        }
      })

      expect(updateVideoSubtitleMock.result).toHaveBeenCalled()
    })
  })

  it('should accept mutation options', async () => {
    const onCompletedMock = jest.fn()

    const { result } = renderHook(
      () =>
        useUpdateVideoSubtitle({
          onCompleted: onCompletedMock
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[updateVideoSubtitleMock]}>
            {children}
          </MockedProvider>
        )
      }
    )

    await act(async () => {
      await result.current[0]({
        variables: {
          input: {
            id: 'subtitle1.id',
            edition: 'base',
            languageId: '529',
            primary: true,
            vttSrc: 'https://example.com/subtitle.vtt',
            srtSrc: null,
            vttAssetId: 'vtt-asset-id',
            srtAssetId: null,
            vttVersion: 1,
            srtVersion: 1
          }
        }
      })

      expect(updateVideoSubtitleMock.result).toHaveBeenCalled()
      expect(onCompletedMock).toHaveBeenCalled()
    })
  })
})

import { MockedResponse } from '@apollo/client/testing'

import {
  VIDEO_VARIANT_DOWNLOAD_CREATE,
  VideoVariantDownloadCreate,
  VideoVariantDownloadCreateVariables
} from './useVideoVariantDownloadCreateMutation'

export const getVideoVariantDownloadCreateMock = <
  T extends VideoVariantDownloadCreateVariables['input']
>(
  input: T
): MockedResponse<
  VideoVariantDownloadCreate,
  VideoVariantDownloadCreateVariables
> => ({
  request: {
    query: VIDEO_VARIANT_DOWNLOAD_CREATE,
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
  },
  result: jest.fn(() => ({
    data: {
      videoVariantDownloadCreate: {
        __typename: 'VideoVariantDownload',
        id: input.id ?? 'download-id',
        quality: input.quality ?? 'high',
        size: input.size ?? 4.94,
        height: input.height ?? 720,
        width: input.width ?? 1280,
        url: input.url ?? 'https://example.com/video.mp4',
        version: input.version ?? 1
      }
    }
  }))
})

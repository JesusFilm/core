import { MockedResponse } from '@apollo/client/testing'

import {
  VIDEO_VARIANT_DOWNLOAD_CREATE,
  VideoVariantDownloadCreate
} from './useVideoVariantDownloadCreateMutation'

export const videoVariantDownloadCreateMock: MockedResponse<VideoVariantDownloadCreate> =
  {
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
          id: 'download-id',
          quality: 'high',
          size: 4.94,
          height: 720,
          width: 1280,
          url: 'https://example.com/video.mp4',
          version: 1
        }
      }
    }))
  }

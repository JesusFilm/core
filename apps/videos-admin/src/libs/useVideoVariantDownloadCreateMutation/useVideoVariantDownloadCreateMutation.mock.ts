import { MockedResponse } from '@apollo/client/testing'

import {
  VIDEO_VARIANT_DOWNLOAD_CREATE,
  VideoVariantDownloadCreate,
  VideoVariantDownloadCreateVariables
} from './useVideoVariantDownloadCreateMutation'

export const videoVariantDownloadCreateMock: MockedResponse<
  VideoVariantDownloadCreate,
  VideoVariantDownloadCreateVariables
> = {
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
  result: {
    data: {
      videoVariantDownloadCreate: {
        id: 'download-id',
        quality: 'high',
        size: 4.94,
        height: 720,
        width: 1280,
        url: 'https://example.com/video.mp4',
        version: 1
      }
    }
  }
}

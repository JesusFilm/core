import { MockedResponse } from '@apollo/client/testing'

import {
  VIDEO_VARIANT_DOWNLOAD_UPDATE,
  VideoVariantDownloadUpdate,
  VideoVariantDownloadUpdateVariables
} from './useVideoVariantDownloadUpdate'

export const videoVariantDownloadUpdateMock: MockedResponse<
  VideoVariantDownloadUpdate,
  VideoVariantDownloadUpdateVariables
> = {
  request: {
    query: VIDEO_VARIANT_DOWNLOAD_UPDATE,
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
  },
  result: jest.fn().mockReturnValue({
    data: {
      videoVariantDownloadUpdate: {
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
}

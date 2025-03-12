import { MockedResponse } from '@apollo/client/testing'

import {
  VIDEO_VARIANT_DOWNLOAD_DELETE,
  VideoVariantDownloadDelete
} from './useVideoVariantDownloadDeleteMutation'

export const videoVariantDownloadDeleteMock: MockedResponse<VideoVariantDownloadDelete> =
  {
    request: {
      query: VIDEO_VARIANT_DOWNLOAD_DELETE,
      variables: {
        id: 'download-id'
      }
    },
    result: jest.fn(() => ({
      data: {
        videoVariantDownloadDelete: {
          __typename: 'VideoVariantDownload',
          id: 'download-id'
        }
      }
    }))
  }

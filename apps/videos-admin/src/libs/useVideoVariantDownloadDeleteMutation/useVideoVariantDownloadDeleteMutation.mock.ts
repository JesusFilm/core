import { MockedResponse } from '@apollo/client/testing'

import {
  VIDEO_VARIANT_DOWNLOAD_DELETE,
  VideoVariantDownloadDelete,
  VideoVariantDownloadDeleteVariables
} from './useVideoVariantDownloadDeleteMutation'

export const videoVariantDownloadDeleteMock: MockedResponse<
  VideoVariantDownloadDelete,
  VideoVariantDownloadDeleteVariables
> = {
  request: {
    query: VIDEO_VARIANT_DOWNLOAD_DELETE,
    variables: {
      id: 'download-id'
    }
  },
  result: {
    data: {
      videoVariantDownloadDelete: {
        id: 'download-id'
      }
    }
  }
}

import { MockedResponse } from '@apollo/client/testing'

import {
  CloudflareUploadComplete,
  CloudflareUploadCompleteVariables
} from '../../../__generated__/CloudflareUploadComplete'

import { CLOUDFLARE_UPLOAD_COMPLETE } from './useCloudflareUploadCompleteMutation'

export function cloudflareUploadCompleteMock(
  id = 'cloudflare-image-id'
): MockedResponse<CloudflareUploadComplete, CloudflareUploadCompleteVariables> {
  return {
    request: {
      query: CLOUDFLARE_UPLOAD_COMPLETE,
      variables: { id }
    },
    result: jest.fn(() => ({
      data: { cloudflareUploadComplete: true }
    }))
  }
}

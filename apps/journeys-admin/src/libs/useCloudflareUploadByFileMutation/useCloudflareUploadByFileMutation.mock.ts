import { MockedResponse } from '@apollo/client/testing'

import { CreateCloudflareUploadByFile } from '../../../__generated__/CreateCloudflareUploadByFile'

import { CREATE_CLOUDFLARE_UPLOAD_BY_FILE } from './useCloudflareUploadByFileMutation'

export const cloudflareUploadMutationMock: MockedResponse<CreateCloudflareUploadByFile> =
  {
    request: {
      query: CREATE_CLOUDFLARE_UPLOAD_BY_FILE,
      variables: {}
    },
    result: vi.fn(() => ({
      data: {
        createCloudflareUploadByFile: {
          __typename: 'CloudflareImage',
          uploadUrl: 'https://upload.imagedelivery.net/upload-url',
          id: 'cloudflare-image-id'
        }
      }
    })) as MockedResponse<CreateCloudflareUploadByFile>['result']
  }

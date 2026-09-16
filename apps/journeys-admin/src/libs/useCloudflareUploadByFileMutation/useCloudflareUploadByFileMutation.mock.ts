import { MockLink } from '@apollo/client/testing'

import { CreateCloudflareUploadByFile } from '../../../__generated__/CreateCloudflareUploadByFile'

import { CREATE_CLOUDFLARE_UPLOAD_BY_FILE } from './useCloudflareUploadByFileMutation'

export const cloudflareUploadMutationMock: MockLink.MockedResponse<CreateCloudflareUploadByFile> =
  {
    request: {
      query: CREATE_CLOUDFLARE_UPLOAD_BY_FILE,
      // Match regardless of the journeyId variable so this shared mock works
      // for both personal (no journey) and team-tagged (journeyId present)
      // uploads.
      variables: () => true
    },
    result: vi.fn(() => ({
      data: {
        createCloudflareUploadByFile: {
          __typename: 'CloudflareImage',
          uploadUrl: 'https://upload.imagedelivery.net/upload-url',
          id: 'cloudflare-image-id'
        }
      }
    })) as MockLink.MockedResponse<CreateCloudflareUploadByFile>['result']
  }

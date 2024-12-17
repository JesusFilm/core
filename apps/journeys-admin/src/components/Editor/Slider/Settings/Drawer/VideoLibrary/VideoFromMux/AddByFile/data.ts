import { MockedResponse } from '@apollo/client/testing'

import { CreateCloudflareVideoUploadByFileMutation } from '../../../../../../../../../__generated__/CreateCloudflareVideoUploadByFileMutation'
import { GetMyCloudflareVideoQuery } from '../../../../../../../../../__generated__/GetMyCloudflareVideoQuery'

import {
  CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION,
  GET_MY_MUX_VIDEO_QUERY
} from './AddByFile'

export const createMuxVideoMock: MockedResponse<CreateCloudflareVideoUploadByFileMutation> =
  {
    request: {
      query: CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION,
      variables: {
        uploadLength: 4,
        name: 'testFile'
      }
    },
    result: {
      data: {
        createCloudflareVideoUploadByFile: {
          id: 'uploadId',
          uploadUrl: 'https://example.com/upload',
          __typename: 'CloudflareVideo'
        }
      }
    }
  }

export const getMuxVideoMock: MockedResponse<GetMyCloudflareVideoQuery> = {
  request: {
    query: GET_MY_MUX_VIDEO_QUERY,
    variables: {
      id: 'uploadId'
    }
  },
  result: {
    data: {
      getMyCloudflareVideo: {
        id: 'uploadId',
        readyToStream: true,
        __typename: 'CloudflareVideo'
      }
    }
  }
}

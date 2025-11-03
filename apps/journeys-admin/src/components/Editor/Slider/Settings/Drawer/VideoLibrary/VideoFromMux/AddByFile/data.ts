import { MockedResponse } from '@apollo/client/testing'

import { CreateMuxVideoUploadByFileMutation } from '../../../../../../../../../__generated__/CreateMuxVideoUploadByFileMutation'
import { GetMyMuxVideoQuery } from '../../../../../../../../../__generated__/GetMyMuxVideoQuery'

import {
  CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION,
  GET_MY_MUX_VIDEO_QUERY
} from './AddByFile'

export const createMuxVideoMock: MockedResponse<CreateMuxVideoUploadByFileMutation> =
  {
    request: {
      query: CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION,
      variables: {
        name: 'testFile'
      }
    },
    result: {
      data: {
        createMuxVideoUploadByFile: {
          id: 'uploadId',
          uploadUrl: 'https://example.com/upload',
          __typename: 'MuxVideo'
        }
      }
    }
  }

export const getMuxVideoMock: MockedResponse<GetMyMuxVideoQuery> = {
  request: {
    query: GET_MY_MUX_VIDEO_QUERY,
    variables: {
      id: 'uploadId'
    }
  },
  result: {
    data: {
      getMyMuxVideo: {
        id: 'uploadId',
        assetId: null,
        playbackId: null,
        readyToStream: true,
        __typename: 'MuxVideo'
      }
    }
  }
}

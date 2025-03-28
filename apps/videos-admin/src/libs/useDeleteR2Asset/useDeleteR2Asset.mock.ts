import { MockedResponse } from '@apollo/client/testing'

import {
  DELETE_CLOUDFLARE_R2_ASSET,
  DeleteCloudflareR2Asset,
  DeleteCloudflareR2AssetVariables
} from './useDeleteR2AssetMutation'

export const getDeleteR2AssetMock = <
  T extends DeleteCloudflareR2AssetVariables
>(
  input: T
): MockedResponse<
  DeleteCloudflareR2Asset,
  DeleteCloudflareR2AssetVariables
> => ({
  request: {
    query: DELETE_CLOUDFLARE_R2_ASSET,
    variables: {
      id: input.id
    }
  },
  result: jest.fn(() => ({
    data: {
      cloudflareR2Delete: {
        id: input.id
      }
    }
  }))
})

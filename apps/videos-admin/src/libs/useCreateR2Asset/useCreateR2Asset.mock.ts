import { MockedResponse } from '@apollo/client/testing'

import {
  CREATE_CLOUDFLARE_R2_ASSET,
  CreateCloudflareR2Asset,
  CreateCloudflareR2AssetVariables
} from './useCreateR2Asset'

const ASSET_DOMAIN = 'https://mock.cloudflare-domain.com'

export const getCreateR2AssetMock = <
  T extends CreateCloudflareR2AssetVariables['input']
>(
  input: T
): MockedResponse<
  CreateCloudflareR2Asset,
  CreateCloudflareR2AssetVariables
> => ({
  request: {
    query: CREATE_CLOUDFLARE_R2_ASSET,
    variables: {
      input
    }
  },
  result: jest.fn(() => ({
    data: {
      cloudflareR2Create: {
        id: 'r2-asset.id',
        fileName: input.fileName,
        originalFilename: input.originalFilename ?? null,
        uploadUrl: `${ASSET_DOMAIN}/${input.fileName}`,
        publicUrl: `${ASSET_DOMAIN}/${input.fileName}`
      }
    }
  }))
})

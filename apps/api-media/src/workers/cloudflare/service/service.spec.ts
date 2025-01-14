import Cloudflare from 'cloudflare'
import { APIPromise } from 'cloudflare/core'
import { Video } from 'cloudflare/resources/stream/stream'
import { mockDeep } from 'jest-mock-extended'
import clone from 'lodash/clone'

import { prismaMock } from '../../../../test/prismaMock'

import { service } from './service'

const mockCloudflare = mockDeep<Cloudflare>()

jest.mock('cloudflare', () => ({
  __esModule: true,
  default: jest.fn(() => mockCloudflare)
}))

describe('workers/cloudflare/service', () => {
  const originalEnv = clone(process.env)

  beforeEach(() => {
    process.env = originalEnv
    process.env.CLOUDFLARE_ACCOUNT_ID = 'cf_account_id'
    process.env.CLOUDFLARE_STREAM_TOKEN = 'cf_stream_token'
    process.env.MUX_UGC_ACCESS_TOKEN_ID = 'mux_ugc_access_token_id'
    process.env.MUX_UGC_SECRET_KEY = 'mux_ugc_secret_key'
    process.env.CORS_ORIGIN = 'cors_origin'
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('service', () => {
    it('returns stream create response', async () => {
      const video = {
        id: 'streamMediaId',
        name: 'name',
        downloadable: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        uploadUrl: null,
        userId: 'userId',
        readyToStream: true
      }
      prismaMock.cloudflareVideo.findMany.mockResolvedValueOnce([video])
      prismaMock.cloudflareVideo.update.mockResolvedValueOnce(video)
      mockCloudflare.post.mockReturnValue({
        asResponse: jest.fn().mockResolvedValueOnce({
          headers: {
            get(header: string) {
              switch (header) {
                case 'Location':
                  return 'https://example.com'
                case 'stream-media-id':
                  return 'streamMediaId'
              }
            }
          }
        })
      } as unknown as APIPromise<void>)
      await service(undefined)
      expect(mockCloudflare.stream.downloads.create).toHaveBeenCalledWith(
        'streamMediaId',
        {
          account_id: 'cf_account_id',
          body: {}
        }
      )
    })
  })
})

import Cloudflare from 'cloudflare'
import { APIPromise } from 'cloudflare/core'
import { Video } from 'cloudflare/resources/stream/stream'
import { mockDeep } from 'jest-mock-extended'
import clone from 'lodash/clone'

import {
  createVideoByDirectUpload,
  createVideoFromUrl,
  deleteVideo,
  getVideo
} from './service'

const mockCloudflare = mockDeep<Cloudflare>()

jest.mock('cloudflare', () => ({
  __esModule: true,
  default: jest.fn(() => mockCloudflare)
}))

describe('VideoService', () => {
  const originalEnv = clone(process.env)

  beforeEach(() => {
    process.env = originalEnv
    process.env.CLOUDFLARE_ACCOUNT_ID = 'cf_account_id'
    process.env.CLOUDFLARE_STREAM_TOKEN = 'cf_stream_token'
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('createVideoByDirectUpload', () => {
    it('returns stream create response', async () => {
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
      expect(await createVideoByDirectUpload(100, 'name', 'userId')).toEqual({
        id: 'streamMediaId',
        uploadUrl: 'https://example.com'
      })
      expect(mockCloudflare.post).toHaveBeenCalledWith(
        '/accounts/cf_account_id/stream?direct_user=true',
        {
          headers: {
            Accept: '*/*',
            'Tus-Resumable': '1.0.0',
            'Upload-Length': '100',
            'Upload-Creator': 'userId',
            'Upload-Metadata': 'name bmFtZQ=='
          }
        }
      )
    })

    it('throws error when missing CLOUDFLARE_ACCOUNT_ID', async () => {
      delete process.env.CLOUDFLARE_ACCOUNT_ID
      await expect(
        createVideoByDirectUpload(100, 'name', 'userId')
      ).rejects.toThrow('Missing CLOUDFLARE_ACCOUNT_ID')
    })

    it('throws error when missing CLOUDFLARE_STREAM_TOKEN', async () => {
      delete process.env.CLOUDFLARE_STREAM_TOKEN
      await expect(
        createVideoByDirectUpload(100, 'name', 'userId')
      ).rejects.toThrow('Missing CLOUDFLARE_STREAM_TOKEN')
    })

    it('throws error when missing stream-media-id', async () => {
      mockCloudflare.post.mockReturnValue({
        asResponse: jest.fn().mockResolvedValueOnce({
          headers: {
            get() {
              return null
            }
          }
        })
      } as unknown as APIPromise<void>)
      await expect(
        createVideoByDirectUpload(100, 'name', 'userId')
      ).rejects.toThrow("Couldn't get upload information from cloudflare")
    })

    it('throws error when missing Location', async () => {
      mockCloudflare.post.mockReturnValue({
        asResponse: jest.fn().mockResolvedValueOnce({
          headers: {
            get(header: string) {
              return header === 'stream-media-id' ? 'streamMediaId' : null
            }
          }
        })
      } as unknown as APIPromise<void>)
      await expect(
        createVideoByDirectUpload(100, 'name', 'userId')
      ).rejects.toThrow("Couldn't get upload information from cloudflare")
    })

    describe('createVideoFromUrl', () => {
      it('returns stream copy create response', async () => {
        mockCloudflare.stream.copy.create.mockResolvedValueOnce({
          uid: 'streamMediaId'
        })
        expect(
          await createVideoFromUrl('http://example.com/video.mp4', 'userId')
        ).toEqual({
          uid: 'streamMediaId'
        })
        expect(mockCloudflare.stream.copy.create).toHaveBeenCalledWith({
          account_id: 'cf_account_id',
          url: 'http://example.com/video.mp4',
          creator: 'userId'
        })
      })

      it('throws error when missing CLOUDFLARE_ACCOUNT_ID', async () => {
        delete process.env.CLOUDFLARE_ACCOUNT_ID
        await expect(createVideoFromUrl('url', 'userId')).rejects.toThrow(
          'Missing CLOUDFLARE_ACCOUNT_ID'
        )
      })
    })

    describe('getVideo', () => {
      it('returns stream get response', async () => {
        mockCloudflare.stream.get.mockResolvedValueOnce({
          id: 'streamMediaId'
        } as unknown as Video)
        expect(await getVideo('streamMediaId')).toEqual({
          id: 'streamMediaId'
        })
        expect(mockCloudflare.stream.get).toHaveBeenCalledWith(
          'streamMediaId',
          {
            account_id: 'cf_account_id'
          }
        )
      })

      it('throws error when missing CLOUDFLARE_ACCOUNT_ID', async () => {
        delete process.env.CLOUDFLARE_ACCOUNT_ID
        await expect(getVideo('streamMediaId')).rejects.toThrow(
          'Missing CLOUDFLARE_ACCOUNT_ID'
        )
      })
    })

    describe('deleteVideo', () => {
      it('returns stream delete response', async () => {
        await deleteVideo('streamMediaId')
        expect(mockCloudflare.stream.delete).toHaveBeenCalledWith(
          'streamMediaId',
          { account_id: 'cf_account_id' }
        )
      })

      it('throws error when missing CLOUDFLARE_ACCOUNT_ID', async () => {
        delete process.env.CLOUDFLARE_ACCOUNT_ID
        await expect(deleteVideo('streamMediaId')).rejects.toThrow(
          'Missing CLOUDFLARE_ACCOUNT_ID'
        )
      })
    })
  })
})

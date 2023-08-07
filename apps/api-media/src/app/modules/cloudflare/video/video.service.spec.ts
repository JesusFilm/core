import { Test, TestingModule } from '@nestjs/testing'
import fetch, { Response } from 'node-fetch'

import {
  CloudflareVideoGetResponse,
  CloudflareVideoUrlUploadResponse,
  VideoService
} from './video.service'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('VideoService', () => {
  let service: VideoService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoService]
    }).compile()

    service = module.get<VideoService>(VideoService)
    mockFetch.mockClear()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('uploadToCloudflareByFile', () => {
    it('returns cloudflare response information', async () => {
      const request = mockFetch.mockResolvedValueOnce({
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
      } as unknown as Response)
      expect(
        await service.uploadToCloudflareByFile(100, 'name', 'userId')
      ).toEqual({
        id: 'streamMediaId',
        uploadUrl: 'https://example.com'
      })
      expect(request).toHaveBeenCalledWith(
        `https://api.cloudflare.com/client/v4/accounts/${
          process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
        }/stream?direct_user=true`,
        {
          headers: {
            Authorization: `Bearer ${
              process.env.CLOUDFLARE_STREAM_TOKEN ?? ''
            }`,
            'Tus-Resumable': '1.0.0',
            'Upload-Length': '100',
            'Upload-Creator': 'userId',
            'Upload-Metadata': 'name bmFtZQ=='
          },
          method: 'POST'
        }
      )
    })

    it('returns null where response header is not present', async () => {
      mockFetch.mockResolvedValueOnce({
        headers: {
          get(header: string) {
            switch (header) {
              case 'Location':
                return null
            }
          }
        }
      } as unknown as Response)
      expect(
        await service.uploadToCloudflareByFile(100, 'name', 'userId')
      ).toBeUndefined()
    })
  })

  describe('deleteVideoFromCloudflare', () => {
    it('returns true when successful', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true
      } as unknown as Response)
      expect(await service.deleteVideoFromCloudflare('videoId')).toBe(true)
      expect(request).toHaveBeenCalledWith(
        `https://api.cloudflare.com/client/v4/accounts/${
          process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
        }/stream/videoId`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN ?? ''}`
          },
          method: 'DELETE'
        }
      )
    })

    it('returns false when unsuccessful', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: false
      } as unknown as Response)
      expect(await service.deleteVideoFromCloudflare('videoId')).toBe(false)
      expect(request).toHaveBeenCalledWith(
        `https://api.cloudflare.com/client/v4/accounts/${
          process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
        }/stream/videoId`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN ?? ''}`
          },
          method: 'DELETE'
        }
      )
    })
  })

  describe('getVideoFromCloudflare', () => {
    it('returns true when successful', async () => {
      const result: CloudflareVideoGetResponse['result'] = {
        readyToStream: true
      }
      const request = mockFetch.mockResolvedValueOnce({
        json: async () => {
          const response: CloudflareVideoGetResponse = {
            result,
            success: true,
            errors: [],
            messages: []
          }
          return await Promise.resolve(response)
        }
      } as unknown as Response)
      expect((await service.getVideoFromCloudflare('videoId')).result).toEqual(
        result
      )
      expect(request).toHaveBeenCalledWith(
        `https://api.cloudflare.com/client/v4/accounts/${
          process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
        }/stream/videoId`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN ?? ''}`
          },
          method: 'GET'
        }
      )
    })

    it('returns false when unsuccessful', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        json: async () => {
          const response: CloudflareVideoGetResponse = {
            result: null,
            success: false,
            errors: [],
            messages: []
          }
          return await Promise.resolve(response)
        }
      } as unknown as Response)
      expect((await service.getVideoFromCloudflare('videoId')).success).toBe(
        false
      )
      expect(request).toHaveBeenCalledWith(
        `https://api.cloudflare.com/client/v4/accounts/${
          process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
        }/stream/videoId`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN ?? ''}`
          },
          method: 'GET'
        }
      )
    })
  })

  describe('uploadToCloudflareByUrl', () => {
    it('returns cloudflare response information', async () => {
      const response: CloudflareVideoUrlUploadResponse = {
        result: {
          uid: 'cloudflareUid'
        },
        success: true,
        errors: [],
        messages: []
      }
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => await Promise.resolve(response)
      } as unknown as Response)
      expect(
        await service.uploadToCloudflareByUrl(
          'https://example.com/video.mp4',
          'userId'
        )
      ).toEqual(response)
      expect(request).toHaveBeenCalledWith(
        `https://api.cloudflare.com/client/v4/accounts/${
          process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
        }/stream/copy`,
        {
          headers: {
            Authorization: `Bearer ${
              process.env.CLOUDFLARE_STREAM_TOKEN ?? ''
            }`,
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({
            url: 'https://example.com/video.mp4',
            creator: 'userId'
          })
        }
      )
    })
  })
})

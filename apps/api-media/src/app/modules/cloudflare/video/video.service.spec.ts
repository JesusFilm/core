import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockDbQueryResult } from '@core/nest/database/mock'

import { DocumentCollection, EdgeCollection } from 'arangojs/collection'
import fetch, { Response } from 'node-fetch'

import { CloudflareVideo } from '../../../__generated__/graphql'
import { CloudflareVideoUrlUploadResponse, VideoService } from './video.service'

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
  let service: VideoService,
    db: DeepMockProxy<Database>,
    collectionMock: DeepMockProxy<DocumentCollection & EdgeCollection>

  beforeEach(async () => {
    db = mockDeep()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<VideoService>(VideoService)
    collectionMock = mockDeep()
    service.collection = collectionMock
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
      expect(await service.uploadToCloudflareByFile(100, 'userId')).toEqual({
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
            'Upload-Creator': 'userId'
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
      expect(await service.uploadToCloudflareByFile(100, 'userId')).toEqual(
        undefined
      )
    })
  })
  describe('deleteVideoFromCloudflare', () => {
    it('returns true when successful', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true
      } as unknown as Response)
      expect(await service.deleteVideoFromCloudflare('videoId')).toEqual(true)
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
      expect(await service.deleteVideoFromCloudflare('videoId')).toEqual(false)
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
  describe('getCloudflareVideosForUserId', () => {
    const video1: CloudflareVideo = {
      id: 'video1Id',
      uploadUrl: 'https://example.com/video1.mp4',
      userId: 'userId',
      createdAt: new Date().toISOString()
    }
    const video2: CloudflareVideo = {
      id: 'video2Id',
      uploadUrl: 'https://example.com/video2.mp4',
      userId: 'userId',
      createdAt: new Date().toISOString()
    }
    beforeEach(() => {
      db.query.mockReturnValue(mockDbQueryResult(service.db, [video1, video2]))
    })

    it('should return an updated result', async () => {
      expect(await service.getCloudflareVideosForUserId('userId')).toEqual([
        video1,
        video2
      ])
    })
  })
})

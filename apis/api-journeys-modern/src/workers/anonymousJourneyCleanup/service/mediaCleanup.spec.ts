import { VideoBlockSource } from '@core/prisma/journeys/client'
import { Logger } from 'pino'

import { prismaMock } from '../../../../test/prismaMock'

import {
  collectMediaFromJourneys,
  deleteCloudflareImageAsset,
  deleteMuxAsset,
  deleteUnusedMedia,
  extractCloudflareImageId,
  MediaReferences
} from './mediaCleanup'

jest.mock('@core/prisma/media/client', () => ({
  prisma: {
    muxVideo: {
      findUnique: jest.fn(),
      delete: jest.fn()
    },
    cloudflareImage: {
      findUnique: jest.fn(),
      delete: jest.fn()
    }
  }
}))

const { prisma: mockPrismaMedia } = jest.requireMock(
  '@core/prisma/media/client'
)

const mockMuxAssetsDelete = jest.fn()
jest.mock('@mux/mux-node', () => {
  return jest.fn().mockImplementation(() => ({
    video: { assets: { delete: mockMuxAssetsDelete } }
  }))
})

const mockCloudflareImagesDelete = jest.fn()
jest.mock('cloudflare', () => {
  return jest.fn().mockImplementation(() => ({
    images: { v1: { delete: mockCloudflareImagesDelete } }
  }))
})

describe('mediaCleanup', () => {
  let mockLogger: Logger

  beforeEach(() => {
    jest.clearAllMocks()
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as any
  })

  describe('extractCloudflareImageId', () => {
    it('should extract image ID from a standard imagedelivery.net URL', () => {
      const id = extractCloudflareImageId(
        'https://imagedelivery.net/abc123/image-uuid-456/public'
      )
      expect(id).toBe('image-uuid-456')
    })

    it('should extract image ID from a URL with a variant', () => {
      const id = extractCloudflareImageId(
        'https://imagedelivery.net/abc123/image-uuid-456/f=jpg,w=640'
      )
      expect(id).toBe('image-uuid-456')
    })

    it('should return null for non-imagedelivery URLs', () => {
      expect(extractCloudflareImageId('https://unsplash.com/photo.jpg')).toBeNull()
      expect(extractCloudflareImageId('https://example.com/image.png')).toBeNull()
    })

    it('should return null for empty string', () => {
      expect(extractCloudflareImageId('')).toBeNull()
    })
  })

  describe('collectMediaFromJourneys', () => {
    it('should collect Mux video IDs from blocks', async () => {
      prismaMock.block.findMany.mockResolvedValue([
        { videoId: 'mux-1', source: VideoBlockSource.mux, src: null },
        { videoId: 'mux-2', source: VideoBlockSource.mux, src: null }
      ] as any)

      const refs = await collectMediaFromJourneys(['journey-1'])

      expect(refs.muxVideoIds).toEqual(new Set(['mux-1', 'mux-2']))
      expect(refs.cloudflareImageIds).toEqual(new Set())
    })

    it('should collect Cloudflare image IDs from block src', async () => {
      prismaMock.block.findMany.mockResolvedValue([
        {
          videoId: null,
          source: null,
          src: 'https://imagedelivery.net/key/cf-img-1/public'
        },
        {
          videoId: null,
          source: null,
          src: 'https://imagedelivery.net/key/cf-img-2/public'
        }
      ] as any)

      const refs = await collectMediaFromJourneys(['journey-1'])

      expect(refs.muxVideoIds).toEqual(new Set())
      expect(refs.cloudflareImageIds).toEqual(new Set(['cf-img-1', 'cf-img-2']))
    })

    it('should ignore non-mux video sources', async () => {
      prismaMock.block.findMany.mockResolvedValue([
        { videoId: 'yt-1', source: VideoBlockSource.youTube, src: null },
        { videoId: 'int-1', source: VideoBlockSource.internal, src: null }
      ] as any)

      const refs = await collectMediaFromJourneys(['journey-1'])

      expect(refs.muxVideoIds).toEqual(new Set())
    })

    it('should ignore non-cloudflare src URLs', async () => {
      prismaMock.block.findMany.mockResolvedValue([
        { videoId: null, source: null, src: 'https://unsplash.com/photo.jpg' }
      ] as any)

      const refs = await collectMediaFromJourneys(['journey-1'])

      expect(refs.cloudflareImageIds).toEqual(new Set())
    })

    it('should deduplicate IDs', async () => {
      prismaMock.block.findMany.mockResolvedValue([
        { videoId: 'mux-1', source: VideoBlockSource.mux, src: null },
        { videoId: 'mux-1', source: VideoBlockSource.mux, src: null },
        {
          videoId: null,
          source: null,
          src: 'https://imagedelivery.net/key/cf-1/public'
        },
        {
          videoId: null,
          source: null,
          src: 'https://imagedelivery.net/key/cf-1/public'
        }
      ] as any)

      const refs = await collectMediaFromJourneys(['journey-1'])

      expect(refs.muxVideoIds.size).toBe(1)
      expect(refs.cloudflareImageIds.size).toBe(1)
    })
  })

  describe('deleteMuxAsset', () => {
    it('should call Mux SDK to delete asset', async () => {
      process.env.MUX_UGC_ACCESS_TOKEN_ID = 'token-id'
      process.env.MUX_UGC_SECRET_KEY = 'secret-key'

      await deleteMuxAsset('asset-123')

      expect(mockMuxAssetsDelete).toHaveBeenCalledWith('asset-123')
    })

    it('should skip when env vars are missing', async () => {
      delete process.env.MUX_UGC_ACCESS_TOKEN_ID
      delete process.env.MUX_UGC_SECRET_KEY

      await deleteMuxAsset('asset-123')

      expect(mockMuxAssetsDelete).not.toHaveBeenCalled()
    })
  })

  describe('deleteCloudflareImageAsset', () => {
    it('should call Cloudflare SDK to delete image', async () => {
      process.env.CLOUDFLARE_IMAGES_TOKEN = 'cf-token'
      process.env.CLOUDFLARE_ACCOUNT_ID = 'cf-account'

      await deleteCloudflareImageAsset('img-123')

      expect(mockCloudflareImagesDelete).toHaveBeenCalledWith('img-123', {
        account_id: 'cf-account'
      })
    })

    it('should skip when env vars are missing', async () => {
      delete process.env.CLOUDFLARE_IMAGES_TOKEN
      delete process.env.CLOUDFLARE_ACCOUNT_ID

      await deleteCloudflareImageAsset('img-123')

      expect(mockCloudflareImagesDelete).not.toHaveBeenCalled()
    })
  })

  describe('deleteUnusedMedia', () => {
    beforeEach(() => {
      process.env.MUX_UGC_ACCESS_TOKEN_ID = 'token-id'
      process.env.MUX_UGC_SECRET_KEY = 'secret-key'
      process.env.CLOUDFLARE_IMAGES_TOKEN = 'cf-token'
      process.env.CLOUDFLARE_ACCOUNT_ID = 'cf-account'
    })

    it('should delete Mux video when unused elsewhere and owned by user', async () => {
      const refs: MediaReferences = {
        muxVideoIds: new Set(['mux-1']),
        cloudflareImageIds: new Set()
      }

      prismaMock.block.count.mockResolvedValue(0)
      mockPrismaMedia.muxVideo.findUnique.mockResolvedValue({
        assetId: 'mux-asset-1',
        userId: 'user-1'
      })
      mockPrismaMedia.muxVideo.delete.mockResolvedValue({})

      const result = await deleteUnusedMedia(
        refs,
        ['journey-1'],
        'user-1',
        mockLogger
      )

      expect(result.deletedMuxVideos).toBe(1)
      expect(mockMuxAssetsDelete).toHaveBeenCalledWith('mux-asset-1')
      expect(mockPrismaMedia.muxVideo.delete).toHaveBeenCalledWith({
        where: { id: 'mux-1' }
      })
    })

    it('should skip Mux video when used elsewhere', async () => {
      const refs: MediaReferences = {
        muxVideoIds: new Set(['mux-1']),
        cloudflareImageIds: new Set()
      }

      prismaMock.block.count.mockResolvedValue(1)

      const result = await deleteUnusedMedia(
        refs,
        ['journey-1'],
        'user-1',
        mockLogger
      )

      expect(result.deletedMuxVideos).toBe(0)
      expect(mockPrismaMedia.muxVideo.findUnique).not.toHaveBeenCalled()
    })

    it('should skip Mux video when owned by a different user', async () => {
      const refs: MediaReferences = {
        muxVideoIds: new Set(['mux-1']),
        cloudflareImageIds: new Set()
      }

      prismaMock.block.count.mockResolvedValue(0)
      mockPrismaMedia.muxVideo.findUnique.mockResolvedValue({
        assetId: 'mux-asset-1',
        userId: 'other-user'
      })

      const result = await deleteUnusedMedia(
        refs,
        ['journey-1'],
        'user-1',
        mockLogger
      )

      expect(result.deletedMuxVideos).toBe(0)
      expect(mockPrismaMedia.muxVideo.delete).not.toHaveBeenCalled()
    })

    it('should skip Mux video when MuxVideo record not found', async () => {
      const refs: MediaReferences = {
        muxVideoIds: new Set(['mux-1']),
        cloudflareImageIds: new Set()
      }

      prismaMock.block.count.mockResolvedValue(0)
      mockPrismaMedia.muxVideo.findUnique.mockResolvedValue(null)

      const result = await deleteUnusedMedia(
        refs,
        ['journey-1'],
        'user-1',
        mockLogger
      )

      expect(result.deletedMuxVideos).toBe(0)
    })

    it('should skip Mux API call when assetId is null', async () => {
      const refs: MediaReferences = {
        muxVideoIds: new Set(['mux-1']),
        cloudflareImageIds: new Set()
      }

      prismaMock.block.count.mockResolvedValue(0)
      mockPrismaMedia.muxVideo.findUnique.mockResolvedValue({
        assetId: null,
        userId: 'user-1'
      })
      mockPrismaMedia.muxVideo.delete.mockResolvedValue({})

      const result = await deleteUnusedMedia(
        refs,
        ['journey-1'],
        'user-1',
        mockLogger
      )

      expect(result.deletedMuxVideos).toBe(1)
      expect(mockMuxAssetsDelete).not.toHaveBeenCalled()
      expect(mockPrismaMedia.muxVideo.delete).toHaveBeenCalled()
    })

    it('should delete Cloudflare image when unused elsewhere and owned by user', async () => {
      const refs: MediaReferences = {
        muxVideoIds: new Set(),
        cloudflareImageIds: new Set(['cf-img-1'])
      }

      prismaMock.block.count.mockResolvedValue(0)
      mockPrismaMedia.cloudflareImage.findUnique.mockResolvedValue({
        userId: 'user-1'
      })
      mockPrismaMedia.cloudflareImage.delete.mockResolvedValue({})

      const result = await deleteUnusedMedia(
        refs,
        ['journey-1'],
        'user-1',
        mockLogger
      )

      expect(result.deletedCloudflareImages).toBe(1)
      expect(mockCloudflareImagesDelete).toHaveBeenCalledWith('cf-img-1', {
        account_id: 'cf-account'
      })
      expect(mockPrismaMedia.cloudflareImage.delete).toHaveBeenCalledWith({
        where: { id: 'cf-img-1' }
      })
    })

    it('should skip Cloudflare image when used elsewhere', async () => {
      const refs: MediaReferences = {
        muxVideoIds: new Set(),
        cloudflareImageIds: new Set(['cf-img-1'])
      }

      prismaMock.block.count.mockResolvedValue(2)

      const result = await deleteUnusedMedia(
        refs,
        ['journey-1'],
        'user-1',
        mockLogger
      )

      expect(result.deletedCloudflareImages).toBe(0)
      expect(mockPrismaMedia.cloudflareImage.findUnique).not.toHaveBeenCalled()
    })

    it('should skip Cloudflare image when owned by a different user', async () => {
      const refs: MediaReferences = {
        muxVideoIds: new Set(),
        cloudflareImageIds: new Set(['cf-img-1'])
      }

      prismaMock.block.count.mockResolvedValue(0)
      mockPrismaMedia.cloudflareImage.findUnique.mockResolvedValue({
        userId: 'other-user'
      })

      const result = await deleteUnusedMedia(
        refs,
        ['journey-1'],
        'user-1',
        mockLogger
      )

      expect(result.deletedCloudflareImages).toBe(0)
      expect(mockPrismaMedia.cloudflareImage.delete).not.toHaveBeenCalled()
    })

    it('should continue processing when a media deletion fails', async () => {
      const refs: MediaReferences = {
        muxVideoIds: new Set(['mux-1', 'mux-2']),
        cloudflareImageIds: new Set()
      }

      prismaMock.block.count.mockResolvedValue(0)
      mockPrismaMedia.muxVideo.findUnique
        .mockResolvedValueOnce({ assetId: 'asset-1', userId: 'user-1' })
        .mockResolvedValueOnce({ assetId: 'asset-2', userId: 'user-1' })
      mockPrismaMedia.muxVideo.delete
        .mockRejectedValueOnce(new Error('delete failed'))
        .mockResolvedValueOnce({})

      const result = await deleteUnusedMedia(
        refs,
        ['journey-1'],
        'user-1',
        mockLogger
      )

      expect(result.deletedMuxVideos).toBe(1)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ videoId: 'mux-1' }),
        'Failed to delete Mux video'
      )
    })

    it('should handle mixed Mux and Cloudflare media', async () => {
      const refs: MediaReferences = {
        muxVideoIds: new Set(['mux-1']),
        cloudflareImageIds: new Set(['cf-img-1'])
      }

      prismaMock.block.count.mockResolvedValue(0)
      mockPrismaMedia.muxVideo.findUnique.mockResolvedValue({
        assetId: 'asset-1',
        userId: 'user-1'
      })
      mockPrismaMedia.muxVideo.delete.mockResolvedValue({})
      mockPrismaMedia.cloudflareImage.findUnique.mockResolvedValue({
        userId: 'user-1'
      })
      mockPrismaMedia.cloudflareImage.delete.mockResolvedValue({})

      const result = await deleteUnusedMedia(
        refs,
        ['journey-1'],
        'user-1',
        mockLogger
      )

      expect(result.deletedMuxVideos).toBe(1)
      expect(result.deletedCloudflareImages).toBe(1)
    })
  })
})

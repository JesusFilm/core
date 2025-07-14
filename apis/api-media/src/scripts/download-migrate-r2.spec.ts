import { S3Client } from '@aws-sdk/client-s3'
import { mockDeep } from 'jest-mock-extended'
import { Logger } from 'pino'

import { VideoVariantDownloadQuality } from '.prisma/api-media-client'

import { prismaMock } from '../../test/prismaMock'

import { migrateDownloadsToR2 } from './download-migrate-r2'

jest.mock('@aws-sdk/client-s3', () => {
  const originalModule = jest.requireActual('@aws-sdk/client-s3')
  return {
    ...originalModule,
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({})
    }))
  }
})

global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: jest.fn().mockResolvedValue(Buffer.from('test-file-content'))
  })
)

describe('download-migrate-r2', () => {
  const originalEnv = { ...process.env }
  const mockLogger = mockDeep<Logger>()

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      CLOUDFLARE_R2_ENDPOINT: 'https://test-endpoint.com',
      CLOUDFLARE_R2_ACCESS_KEY_ID: 'test-access-key',
      CLOUDFLARE_R2_SECRET: 'test-secret',
      CLOUDFLARE_R2_BUCKET: 'test-bucket',
      CLOUDFLARE_R2_CUSTOM_DOMAIN: 'https://test-domain.com'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('migrateDownloadsToR2', () => {
    it('should process videoVariantDownloads without assets', async () => {
      const mockDownloads = [
        {
          id: 'download-1',
          quality: VideoVariantDownloadQuality.high,
          size: 1024,
          height: 720,
          width: 1280,
          url: 'https://example.com/video1.mp4',
          assetId: null,
          videoVariantId: 'variant-1',
          videoVariant: {
            id: 'variant-1',
            videoId: 'video-1',
            languageId: 'en'
          }
        },
        {
          id: 'download-2',
          quality: VideoVariantDownloadQuality.low,
          size: 512,
          height: 480,
          width: 854,
          url: 'https://example.com/video2.mp4',
          assetId: null,
          videoVariantId: 'variant-2',
          videoVariant: {
            id: 'variant-2',
            videoId: 'video-2',
            languageId: 'es'
          }
        }
      ]

      const expectedFileName1 =
        'video-1/variants/en/downloads/variant-1_high.mp4'
      const expectedFileName2 =
        'video-2/variants/es/downloads/variant-2_low.mp4'

      const mockAsset1 = {
        id: 'asset-1',
        fileName: expectedFileName1,
        userId: 'system',
        contentType: 'video/mp4',
        contentLength: 1024,
        videoId: 'video-1',
        publicUrl: `https://test-domain.com/${expectedFileName1}`,
        uploadUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockAsset2 = {
        id: 'asset-2',
        fileName: expectedFileName2,
        userId: 'system',
        contentType: 'video/mp4',
        contentLength: 512,
        videoId: 'video-2',
        publicUrl: `https://test-domain.com/${expectedFileName2}`,
        uploadUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      prismaMock.videoVariantDownload.findMany.mockResolvedValue(
        mockDownloads as any
      )
      prismaMock.cloudflareR2.create
        .mockResolvedValueOnce(mockAsset1 as any)
        .mockResolvedValueOnce(mockAsset2 as any)
      prismaMock.cloudflareR2.update
        .mockResolvedValueOnce(mockAsset1 as any)
        .mockResolvedValueOnce(mockAsset2 as any)
      prismaMock.videoVariantDownload.update
        .mockResolvedValueOnce({
          ...mockDownloads[0],
          assetId: 'asset-1',
          url: mockAsset1.publicUrl
        } as any)
        .mockResolvedValueOnce({
          ...mockDownloads[1],
          assetId: 'asset-2',
          url: mockAsset2.publicUrl
        } as any)

      await migrateDownloadsToR2(mockLogger)

      expect(prismaMock.videoVariantDownload.findMany).toHaveBeenCalledWith({
        where: {
          assetId: null,
          url: { not: '' }
        },
        include: {
          videoVariant: {
            select: {
              id: true,
              languageId: true,
              videoId: true
            }
          }
        }
      })

      expect(prismaMock.cloudflareR2.create).toHaveBeenCalledTimes(2)
      expect(prismaMock.cloudflareR2.create).toHaveBeenCalledWith({
        data: {
          fileName: expectedFileName1,
          userId: 'system',
          contentType: 'video/mp4',
          contentLength: 1024,
          videoId: 'video-1'
        }
      })
      expect(prismaMock.cloudflareR2.create).toHaveBeenCalledWith({
        data: {
          fileName: expectedFileName2,
          userId: 'system',
          contentType: 'video/mp4',
          contentLength: 512,
          videoId: 'video-2'
        }
      })

      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/video1.mp4'
      )
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/video2.mp4'
      )

      expect(S3Client).toHaveBeenCalledTimes(2)

      expect(prismaMock.cloudflareR2.update).toHaveBeenCalledTimes(2)
      expect(prismaMock.cloudflareR2.update).toHaveBeenCalledWith({
        where: { id: 'asset-1' },
        data: {
          publicUrl: `https://test-domain.com/${expectedFileName1}`,
          contentLength: 17 // Length of 'test-file-content'
        }
      })
      expect(prismaMock.cloudflareR2.update).toHaveBeenCalledWith({
        where: { id: 'asset-2' },
        data: {
          publicUrl: `https://test-domain.com/${expectedFileName2}`,
          contentLength: 17 // Length of 'test-file-content'
        }
      })

      expect(prismaMock.videoVariantDownload.update).toHaveBeenCalledTimes(2)
      expect(prismaMock.videoVariantDownload.update).toHaveBeenCalledWith({
        where: { id: 'download-1' },
        data: {
          assetId: 'asset-1',
          url: `https://test-domain.com/${expectedFileName1}`
        }
      })
      expect(prismaMock.videoVariantDownload.update).toHaveBeenCalledWith({
        where: { id: 'download-2' },
        data: {
          assetId: 'asset-2',
          url: `https://test-domain.com/${expectedFileName2}`
        }
      })

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Starting download migration to R2'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Found 2 downloads without assets'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Completed download migration to R2'
      )
    })

    it('should handle errors when processing downloads', async () => {
      const mockDownloads = [
        {
          id: 'download-error',
          quality: VideoVariantDownloadQuality.high,
          size: 1024,
          height: 720,
          width: 1280,
          url: 'https://example.com/error.mp4',
          assetId: null,
          videoVariantId: 'variant-error',
          videoVariant: {
            id: 'variant-error',
            videoId: 'video-error',
            languageId: 'en'
          }
        }
      ]

      prismaMock.videoVariantDownload.findMany.mockResolvedValue(
        mockDownloads as any
      )

      global.fetch = jest.fn().mockImplementation(() => {
        throw new Error('Network error')
      })

      await migrateDownloadsToR2(mockLogger)

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          downloadId: 'download-error'
        }),
        'Error processing download: download-error'
      )
    })

    it('should handle downloads without associated video variants', async () => {
      const mockDownloads = [
        {
          id: 'download-no-variant',
          quality: VideoVariantDownloadQuality.high,
          size: 1024,
          height: 720,
          width: 1280,
          url: 'https://example.com/no-variant.mp4',
          assetId: null,
          videoVariantId: 'variant-missing',
          videoVariant: null
        }
      ]

      prismaMock.videoVariantDownload.findMany.mockResolvedValue(
        mockDownloads as any
      )

      await migrateDownloadsToR2(mockLogger)

      expect(mockLogger.error).toHaveBeenCalledWith(
        { downloadId: 'download-no-variant' },
        'Download has no associated video variant'
      )
    })

    it('should update download size when size is 0 or null', async () => {
      const mockDownloads = [
        {
          id: 'download-zero-size',
          quality: VideoVariantDownloadQuality.high,
          size: 0, // Zero size should be updated
          height: 720,
          width: 1280,
          url: 'https://example.com/zero-size.mp4',
          assetId: null,
          videoVariantId: 'variant-zero',
          videoVariant: {
            id: 'variant-zero',
            videoId: 'video-zero',
            languageId: 'en'
          }
        }
      ]

      const mockAsset1 = {
        id: 'asset-zero',
        fileName: 'video-zero/variants/en/downloads/variant-zero_high.mp4',
        userId: 'system',
        contentType: 'video/mp4',
        contentLength: 0,
        videoId: 'video-zero'
      }

      prismaMock.videoVariantDownload.findMany.mockResolvedValue(
        mockDownloads as any
      )
      prismaMock.cloudflareR2.create.mockResolvedValueOnce(mockAsset1 as any)
      prismaMock.cloudflareR2.update.mockResolvedValueOnce(mockAsset1 as any)
      prismaMock.videoVariantDownload.update.mockResolvedValueOnce({} as any)

      await migrateDownloadsToR2(mockLogger)

      // Should update downloads with actual file size (17 bytes for 'test-file-content')
      expect(prismaMock.videoVariantDownload.update).toHaveBeenCalledWith({
        where: { id: 'download-zero-size' },
        data: {
          assetId: 'asset-zero',
          url: 'https://test-domain.com/video-zero/variants/en/downloads/variant-zero_high.mp4',
          size: 17
        }
      })

      expect(mockLogger.info).toHaveBeenCalledWith(
        { downloadId: 'download-zero-size', actualSize: 17 },
        'Updated download size with actual file size'
      )
    })
  })
})

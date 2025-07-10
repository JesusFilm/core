import Mux from '@mux/mux-node'
import { AssetOptions } from '@mux/mux-node/resources/video/assets'
import { Job } from 'bullmq'
import { Logger } from 'pino'

import { MuxVideo, VideoVariantDownloadQuality } from '.prisma/api-media-client'

import { prismaMock } from '../../../../test/prismaMock'
import { getVideo } from '../../../schema/mux/video/service'

import { service } from './service'

// Mock the getVideo function
jest.mock('../../../schema/mux/video/service', () => ({
  getVideo: jest.fn()
}))

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
} as unknown as Logger

const mockJob = {
  data: {
    videoId: 'test-video-id',
    assetId: 'test-asset-id',
    isUserGenerated: false
  }
} as Job<{
  videoId: string
  assetId: string
  isUserGenerated: boolean
}>

const mockMuxVideo: MuxVideo = {
  id: 'test-video-id',
  name: 'Test Video',
  assetId: 'test-asset-id',
  duration: 120,
  uploadId: 'test-upload-id',
  playbackId: 'test-playback-id',
  uploadUrl: 'https://test.upload.url',
  userId: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  readyToStream: true,
  downloadable: true
}

const mockMuxVideoAsset = {
  id: 'test-asset-id',
  status: 'ready',
  duration: 120,
  playback_ids: [{ id: 'test-playback-id', policy: 'public' }],
  static_renditions: {
    status: 'ready',
    files: [
      {
        name: '720p.mp4',
        ext: 'mp4',
        height: 720,
        width: 1280,
        bitrate: 2500000,
        filesize: '157286400',
        resolution: '720p' as AssetOptions.StaticRendition['resolution'],
        resolution_tier: '720p',
        status: 'ready'
      },
      {
        name: '360p.mp4',
        ext: 'mp4',
        height: 360,
        width: 640,
        bitrate: 800000,
        filesize: '52428800',
        resolution: '360p' as any,
        resolution_tier: '360p' as any,
        status: 'ready'
      }
    ]
  }
}

const mockVideoVariants = [
  {
    id: 'variant-1',
    videoId: 'test-video-id',
    muxVideoId: 'test-video-id',
    edition: 'standard',
    languageId: '529',
    slug: 'test-video-slug',
    duration: 120,
    assetId: null,
    downloadable: true,
    hls: null,
    dash: null,
    share: null,
    subtitleVttId: null,
    subtitleSrtId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    studyQuestionCount: 0,
    childrenCount: 0,
    published: true,
    lengthInMilliseconds: 120000,
    masterUrl: null,
    masterWidth: null,
    masterHeight: null,
    version: 1
  },
  {
    id: 'variant-2',
    videoId: 'test-video-id',
    muxVideoId: 'test-video-id',
    edition: 'extended',
    languageId: '529',
    slug: 'test-video-extended-slug',
    duration: 150,
    assetId: null,
    downloadable: true,
    hls: null,
    dash: null,
    share: null,
    subtitleVttId: null,
    subtitleSrtId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    studyQuestionCount: 0,
    childrenCount: 0,
    published: true,
    lengthInMilliseconds: 150000,
    masterUrl: null,
    masterWidth: null,
    masterHeight: null,
    version: 1
  }
] as any[]

describe('processVideoDownloads service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock setTimeout to avoid delays in tests
    jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback()
      return {} as NodeJS.Timeout
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('service', () => {
    it('should successfully process video downloads when static renditions are ready', async () => {
      // Mock database calls
      prismaMock.muxVideo.findUnique.mockResolvedValue(mockMuxVideo)
      prismaMock.muxVideo.update.mockResolvedValue(mockMuxVideo)
      prismaMock.videoVariant.findMany.mockResolvedValue(mockVideoVariants)
      prismaMock.videoVariantDownload.create.mockResolvedValue({} as any)

      // Mock Mux API call
      ;(getVideo as jest.Mock).mockResolvedValue(mockMuxVideoAsset)

      await service(mockJob, mockLogger)

      expect(prismaMock.muxVideo.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-video-id' }
      })
      expect(getVideo).toHaveBeenCalledWith('test-asset-id', false)
      expect(prismaMock.muxVideo.update).toHaveBeenCalledWith({
        where: { id: 'test-video-id' },
        data: {
          readyToStream: true,
          playbackId: 'test-playback-id',
          duration: 120
        }
      })
      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledTimes(6) // 2 variants × 3 downloads each (720p, 360p, highest)
    })

    it('should handle video not found', async () => {
      prismaMock.muxVideo.findUnique.mockResolvedValue(null)

      await service(mockJob, mockLogger)

      expect(mockLogger.warn).toHaveBeenCalledWith(
        { videoId: 'test-video-id' },
        'Video not found'
      )
      expect(getVideo).not.toHaveBeenCalled()
    })

    it('should handle video with no asset ID', async () => {
      const videoWithoutAsset = { ...mockMuxVideo, assetId: null }
      prismaMock.muxVideo.findUnique.mockResolvedValue(videoWithoutAsset)

      await service(mockJob, mockLogger)

      expect(mockLogger.warn).toHaveBeenCalledWith(
        { videoId: 'test-video-id' },
        'Video has no asset ID'
      )
      expect(getVideo).not.toHaveBeenCalled()
    })

    it('should handle timeout from static rendition monitoring', async () => {
      prismaMock.muxVideo.findUnique.mockResolvedValue(mockMuxVideo)

      // Mock getVideo to return asset without static renditions for 180 attempts
      let callCount = 0
      ;(getVideo as jest.Mock).mockImplementation(() => {
        callCount++
        return Promise.resolve({
          ...mockMuxVideoAsset,
          static_renditions: null
        })
      })

      await service(mockJob, mockLogger)

      expect(callCount).toBe(180)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          assetId: 'test-asset-id',
          maxAttempts: 180
        }),
        'Static rendition monitoring reached maximum attempts without final status'
      )
    }, 10000)

    it('should handle errors during processing', async () => {
      prismaMock.muxVideo.findUnique.mockRejectedValue(
        new Error('Database error')
      )

      await expect(service(mockJob, mockLogger)).rejects.toThrow(
        'Database error'
      )

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          videoId: 'test-video-id',
          assetId: 'test-asset-id'
        }),
        'Failed to process video downloads'
      )
    })
  })

  describe('static rendition monitoring', () => {
    it('should handle static renditions with errored status', async () => {
      prismaMock.muxVideo.findUnique.mockResolvedValue(mockMuxVideo)
      prismaMock.muxVideo.update.mockResolvedValue(mockMuxVideo)
      prismaMock.videoVariant.findMany.mockResolvedValue(mockVideoVariants)

      const assetWithErroredRenditions = {
        ...mockMuxVideoAsset,
        static_renditions: {
          status: 'ready',
          files: [
            {
              ...mockMuxVideoAsset.static_renditions.files[0],
              status: 'errored'
            },
            {
              ...mockMuxVideoAsset.static_renditions.files[1],
              status: 'ready'
            }
          ]
        }
      }

      ;(getVideo as jest.Mock).mockResolvedValue(assetWithErroredRenditions)

      await service(mockJob, mockLogger)

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          assetId: 'test-asset-id',
          renditionStatuses: expect.arrayContaining([
            expect.objectContaining({ status: 'errored' })
          ])
        }),
        'Static renditions have errored status'
      )
    })

    it('should handle static renditions with skipped status', async () => {
      prismaMock.muxVideo.findUnique.mockResolvedValue(mockMuxVideo)
      prismaMock.muxVideo.update.mockResolvedValue(mockMuxVideo)
      prismaMock.videoVariant.findMany.mockResolvedValue(mockVideoVariants)

      const assetWithSkippedRenditions = {
        ...mockMuxVideoAsset,
        static_renditions: {
          status: 'ready',
          files: [
            {
              ...mockMuxVideoAsset.static_renditions.files[0],
              status: 'skipped'
            },
            {
              ...mockMuxVideoAsset.static_renditions.files[1],
              status: 'ready'
            }
          ]
        }
      }

      ;(getVideo as jest.Mock).mockResolvedValue(assetWithSkippedRenditions)

      await service(mockJob, mockLogger)

      // Should still process since skipped is considered a final state
      expect(prismaMock.muxVideo.update).toHaveBeenCalled()
    })

    it('should continue monitoring while renditions are processing', async () => {
      prismaMock.muxVideo.findUnique.mockResolvedValue(mockMuxVideo)

      // First call returns processing, second call returns ready
      ;(getVideo as jest.Mock)
        .mockResolvedValueOnce({
          ...mockMuxVideoAsset,
          static_renditions: {
            status: 'preparing',
            files: [
              {
                ...mockMuxVideoAsset.static_renditions.files[0],
                status: 'processing'
              }
            ]
          }
        })
        .mockResolvedValueOnce(mockMuxVideoAsset)

      prismaMock.muxVideo.update.mockResolvedValue(mockMuxVideo)
      prismaMock.videoVariant.findMany.mockResolvedValue(mockVideoVariants)
      prismaMock.videoVariantDownload.create.mockResolvedValue({} as any)

      await service(mockJob, mockLogger)

      expect(getVideo).toHaveBeenCalledTimes(2)
      expect(prismaMock.muxVideo.update).toHaveBeenCalled()
    })
  })

  describe('download processing', () => {
    it('should skip downloads for renditions with errored status', async () => {
      prismaMock.muxVideo.findUnique.mockResolvedValue(mockMuxVideo)
      prismaMock.muxVideo.update.mockResolvedValue(mockMuxVideo)
      prismaMock.videoVariant.findMany.mockResolvedValue([mockVideoVariants[0]])

      const assetWithMixedStatuses = {
        ...mockMuxVideoAsset,
        static_renditions: {
          status: 'ready',
          files: [
            {
              ...mockMuxVideoAsset.static_renditions.files[0],
              status: 'ready'
            },
            {
              ...mockMuxVideoAsset.static_renditions.files[1],
              status: 'errored'
            }
          ]
        }
      }

      ;(getVideo as jest.Mock).mockResolvedValue(assetWithMixedStatuses)
      prismaMock.videoVariantDownload.create.mockResolvedValue({} as any)

      await service(mockJob, mockLogger)

      // Should only create 2 downloads: 720p + highest (360p is errored and skipped)
      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledTimes(2)
    })

    it('should handle duplicate download creation gracefully', async () => {
      prismaMock.muxVideo.findUnique.mockResolvedValue(mockMuxVideo)
      prismaMock.muxVideo.update.mockResolvedValue(mockMuxVideo)
      prismaMock.videoVariant.findMany.mockResolvedValue([mockVideoVariants[0]])
      ;(getVideo as jest.Mock).mockResolvedValue(mockMuxVideoAsset)

      // Mock P2002 constraint violation for duplicate
      prismaMock.videoVariantDownload.create
        .mockResolvedValueOnce({} as any) // First succeeds
        .mockRejectedValueOnce({ code: 'P2002' }) // Second fails with constraint violation
        .mockResolvedValueOnce({} as any) // Third succeeds

      await service(mockJob, mockLogger)

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          videoVariantId: 'variant-1',
          quality: expect.any(String)
        }),
        'Download already exists, skipping'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          videoId: 'test-video-id',
          videoVariantId: 'variant-1',
          downloadsCount: 2
        }),
        'Successfully created video downloads'
      )
    })

    it('should handle other database errors during download creation', async () => {
      prismaMock.muxVideo.findUnique.mockResolvedValue(mockMuxVideo)
      prismaMock.muxVideo.update.mockResolvedValue(mockMuxVideo)
      prismaMock.videoVariant.findMany.mockResolvedValue([mockVideoVariants[0]])
      ;(getVideo as jest.Mock).mockResolvedValue(mockMuxVideoAsset)

      // Mock other database error
      prismaMock.videoVariantDownload.create.mockRejectedValue({
        code: 'P1001',
        message: 'Database connection error'
      })

      await service(mockJob, mockLogger)

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code: 'P1001' }),
          videoVariantId: 'variant-1'
        }),
        'Failed to create individual download'
      )
    })

    it('should skip processing when video has no variants', async () => {
      prismaMock.muxVideo.findUnique.mockResolvedValue(mockMuxVideo)
      prismaMock.muxVideo.update.mockResolvedValue(mockMuxVideo)
      prismaMock.videoVariant.findMany.mockResolvedValue([])
      ;(getVideo as jest.Mock).mockResolvedValue(mockMuxVideoAsset)

      await service(mockJob, mockLogger)

      expect(prismaMock.videoVariantDownload.create).not.toHaveBeenCalled()
    })

    it('should create correct download URLs and metadata', async () => {
      prismaMock.muxVideo.findUnique.mockResolvedValue(mockMuxVideo)
      prismaMock.muxVideo.update.mockResolvedValue(mockMuxVideo)
      prismaMock.videoVariant.findMany.mockResolvedValue([mockVideoVariants[0]])
      ;(getVideo as jest.Mock).mockResolvedValue(mockMuxVideoAsset)
      prismaMock.videoVariantDownload.create.mockResolvedValue({} as any)

      await service(mockJob, mockLogger)

      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          videoVariantId: 'variant-1',
          quality: VideoVariantDownloadQuality.high,
          url: 'https://stream.mux.com/test-playback-id/720p.mp4',
          version: 1,
          size: 157286400,
          height: 720,
          width: 1280,
          bitrate: 2500000
        })
      })

      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          videoVariantId: 'variant-1',
          quality: VideoVariantDownloadQuality.sd,
          url: 'https://stream.mux.com/test-playback-id/360p.mp4',
          version: 1,
          size: 52428800,
          height: 360,
          width: 640,
          bitrate: 800000
        })
      })

      // Check highest quality download
      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          videoVariantId: 'variant-1',
          quality: VideoVariantDownloadQuality.highest,
          url: 'https://stream.mux.com/test-playback-id/720p.mp4',
          version: 1,
          size: 157286400,
          height: 720,
          width: 1280,
          bitrate: 2500000
        })
      })
    })
  })

  describe('resolution quality mapping', () => {
    it('should map resolution tiers to correct download qualities', async () => {
      const assetWithAllResolutions = {
        ...mockMuxVideoAsset,
        static_renditions: {
          status: 'ready',
          files: [
            {
              name: '270p.mp4',
              resolution: '270p' as AssetOptions.StaticRendition['resolution'],
              resolution_tier: '270p',
              status: 'ready',
              filesize: '10000000',
              height: 270,
              width: 480,
              bitrate: 400000
            },
            {
              name: '1080p.mp4',
              resolution: '1080p' as AssetOptions.StaticRendition['resolution'],
              resolution_tier: '1080p',
              status: 'ready',
              filesize: '300000000',
              height: 1080,
              width: 1920,
              bitrate: 5000000
            }
          ]
        }
      }

      prismaMock.muxVideo.findUnique.mockResolvedValue(mockMuxVideo)
      prismaMock.muxVideo.update.mockResolvedValue(mockMuxVideo)
      prismaMock.videoVariant.findMany.mockResolvedValue([mockVideoVariants[0]])
      ;(getVideo as jest.Mock).mockResolvedValue(assetWithAllResolutions)
      prismaMock.videoVariantDownload.create.mockResolvedValue({} as any)

      await service(mockJob, mockLogger)

      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          quality: VideoVariantDownloadQuality.low // 270p
        })
      })

      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          quality: VideoVariantDownloadQuality.fhd // 1080p
        })
      })

      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          quality: VideoVariantDownloadQuality.highest // highest available (1080p)
        })
      })
    })
  })
})

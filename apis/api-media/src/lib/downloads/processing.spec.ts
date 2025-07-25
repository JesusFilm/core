import { VideoVariantDownloadQuality } from '.prisma/api-media-client'

import { prismaMock } from '../../../test/prismaMock'

import {
  createDownloadsFromMuxAsset,
  downloadsReadyToStore,
  getHighestResolutionDownload,
  mapStaticResolutionTierToDownloadQuality,
  mapStaticResolutionTierToDownloadQualityWithFallback,
  qualityEnumToOrder
} from './processing'

describe('download processing utilities', () => {
  describe('mapStaticResolutionTierToDownloadQuality', () => {
    it('should map resolution tiers correctly', () => {
      expect(mapStaticResolutionTierToDownloadQuality('270p')).toBe(
        VideoVariantDownloadQuality.low
      )
      expect(mapStaticResolutionTierToDownloadQuality('360p')).toBe(
        VideoVariantDownloadQuality.sd
      )
      expect(mapStaticResolutionTierToDownloadQuality('720p')).toBe(
        VideoVariantDownloadQuality.high
      )
      expect(mapStaticResolutionTierToDownloadQuality('1080p')).toBe(
        VideoVariantDownloadQuality.fhd
      )
      expect(mapStaticResolutionTierToDownloadQuality('1440p')).toBe(
        VideoVariantDownloadQuality.qhd
      )
      expect(mapStaticResolutionTierToDownloadQuality('2160p')).toBe(
        VideoVariantDownloadQuality.uhd
      )
    })

    it('should return null for unmapped resolutions', () => {
      expect(mapStaticResolutionTierToDownloadQuality('480p' as any)).toBe(null)
      expect(mapStaticResolutionTierToDownloadQuality('1440p' as any)).toBe(
        VideoVariantDownloadQuality.qhd
      )
    })
  })

  describe('qualityEnumToOrder', () => {
    it('should have correct ordering values', () => {
      expect(qualityEnumToOrder[VideoVariantDownloadQuality.distroLow]).toBe(0)
      expect(qualityEnumToOrder[VideoVariantDownloadQuality.distroSd]).toBe(1)
      expect(qualityEnumToOrder[VideoVariantDownloadQuality.distroHigh]).toBe(2)
      expect(qualityEnumToOrder[VideoVariantDownloadQuality.low]).toBe(3)
      expect(qualityEnumToOrder[VideoVariantDownloadQuality.sd]).toBe(4)
      expect(qualityEnumToOrder[VideoVariantDownloadQuality.high]).toBe(5)
      expect(qualityEnumToOrder[VideoVariantDownloadQuality.fhd]).toBe(6)
      expect(qualityEnumToOrder[VideoVariantDownloadQuality.qhd]).toBe(7)
      expect(qualityEnumToOrder[VideoVariantDownloadQuality.uhd]).toBe(8)
      expect(qualityEnumToOrder[VideoVariantDownloadQuality.highest]).toBe(9)
    })
  })

  describe('getHighestResolutionDownload', () => {
    it('should return the highest quality download', () => {
      const downloads = [
        {
          videoVariantId: 'variant-1',
          quality: VideoVariantDownloadQuality.sd,
          url: 'test-url',
          version: 1,
          size: 100,
          height: 360,
          width: 640,
          bitrate: 800000
        },
        {
          videoVariantId: 'variant-1',
          quality: VideoVariantDownloadQuality.fhd,
          url: 'test-url',
          version: 1,
          size: 200,
          height: 1080,
          width: 1920,
          bitrate: 2500000
        },
        {
          videoVariantId: 'variant-1',
          quality: VideoVariantDownloadQuality.high,
          url: 'test-url',
          version: 1,
          size: 150,
          height: 720,
          width: 1280,
          bitrate: 1500000
        }
      ]

      const result = getHighestResolutionDownload(downloads)

      expect(result.quality).toBe(VideoVariantDownloadQuality.highest)
      expect(result.height).toBe(1080) // Should inherit from FHD (highest quality)
      expect(result.width).toBe(1920)
      expect(result.bitrate).toBe(2500000)
    })
  })

  describe('downloadsReadyToStore', () => {
    it('should return true when all files are ready', () => {
      const muxVideo = {
        static_renditions: {
          files: [
            { status: 'ready' },
            { status: 'ready' },
            { status: 'skipped' }
          ]
        }
      }

      expect(downloadsReadyToStore(muxVideo)).toBe(true)
    })

    it('should return true when files have mixed ready/skipped/errored status', () => {
      const muxVideo = {
        static_renditions: {
          files: [
            { status: 'ready' },
            { status: 'skipped' },
            { status: 'errored' }
          ]
        }
      }

      expect(downloadsReadyToStore(muxVideo)).toBe(true)
    })

    it('should return false when some files are still processing', () => {
      const muxVideo = {
        static_renditions: {
          files: [
            { status: 'ready' },
            { status: 'preparing' },
            { status: 'ready' }
          ]
        }
      }

      expect(downloadsReadyToStore(muxVideo)).toBe(false)
    })

    it('should return false when static_renditions is null', () => {
      const muxVideo = {
        static_renditions: null
      }

      expect(downloadsReadyToStore(muxVideo)).toBe(false)
    })

    it('should return false when files is null', () => {
      const muxVideo = {
        static_renditions: {
          files: null
        }
      }

      expect(downloadsReadyToStore(muxVideo)).toBe(false)
    })
  })

  describe('mapStaticResolutionTierToDownloadQualityWithFallback', () => {
    it('should return exact match when available', () => {
      const files = [
        { resolution: '360p', status: 'ready' },
        { resolution: '720p', status: 'ready' }
      ]

      const result = mapStaticResolutionTierToDownloadQualityWithFallback(
        files,
        '360p'
      )
      expect(result).toEqual({
        resolution: '360p',
        quality: VideoVariantDownloadQuality.sd
      })
    })

    it('should fallback to lower resolution for sd when 360p not available', () => {
      const files = [
        { resolution: '270p', status: 'ready' },
        { resolution: '480p', status: 'ready' },
        { resolution: '720p', status: 'ready' }
      ]

      const result = mapStaticResolutionTierToDownloadQualityWithFallback(
        files,
        '360p'
      )
      expect(result).toEqual({
        resolution: '270p',
        quality: VideoVariantDownloadQuality.sd
      })
    })

    it('should fallback to lower resolution for high when 720p not available', () => {
      const files = [
        { resolution: '270p', status: 'ready' },
        { resolution: '360p', status: 'ready' },
        { resolution: '480p', status: 'ready' },
        { resolution: '1080p', status: 'ready' }
      ]

      const result = mapStaticResolutionTierToDownloadQualityWithFallback(
        files,
        '720p'
      )
      expect(result).toEqual({
        resolution: '480p',
        quality: VideoVariantDownloadQuality.high
      })
    })

    it('should return null when no lower resolution available', () => {
      const files = [
        { resolution: '1080p', status: 'ready' },
        { resolution: '1440p', status: 'ready' }
      ]

      const result = mapStaticResolutionTierToDownloadQualityWithFallback(
        files,
        '360p'
      )
      expect(result).toBe(null)
    })

    it('should skip errored and skipped files', () => {
      const files = [
        { resolution: '270p', status: 'errored' },
        { resolution: '360p', status: 'skipped' },
        { resolution: '480p', status: 'ready' }
      ]

      const result = mapStaticResolutionTierToDownloadQualityWithFallback(
        files,
        '720p'
      )
      expect(result).toEqual({
        resolution: '480p',
        quality: VideoVariantDownloadQuality.high
      })
    })

    it('should return null for non-sd/high target resolutions', () => {
      const files = [
        { resolution: '270p', status: 'ready' },
        { resolution: '480p', status: 'ready' }
      ]

      const result = mapStaticResolutionTierToDownloadQualityWithFallback(
        files,
        '1080p'
      )
      expect(result).toBe(null)
    })
  })

  describe('createDownloadsFromMuxAsset', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should create downloads successfully', async () => {
      const muxVideoAsset = {
        playback_ids: [{ id: 'test-playback-id' }],
        static_renditions: {
          files: [
            {
              resolution: '720p',
              status: 'ready',
              filesize: '157286400',
              height: 720,
              width: 1280,
              bitrate: 2500000
            },
            {
              resolution: '360p',
              status: 'ready',
              filesize: '52428800',
              height: 360,
              width: 640,
              bitrate: 800000
            }
          ]
        }
      }

      prismaMock.videoVariantDownload.create.mockResolvedValue({} as any)

      const result = await createDownloadsFromMuxAsset({
        variantId: 'variant-1',
        muxVideoAsset
      })

      expect(result).toBe(3) // 2 quality downloads + 1 highest
      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledTimes(3)

      // Check first download (720p)
      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledWith({
        data: {
          videoVariantId: 'variant-1',
          quality: VideoVariantDownloadQuality.high,
          url: 'https://stream.mux.com/test-playback-id/720p.mp4',
          version: 1,
          size: 157286400,
          height: 720,
          width: 1280,
          bitrate: 2500000
        }
      })

      // Check second download (360p)
      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledWith({
        data: {
          videoVariantId: 'variant-1',
          quality: VideoVariantDownloadQuality.sd,
          url: 'https://stream.mux.com/test-playback-id/360p.mp4',
          version: 1,
          size: 52428800,
          height: 360,
          width: 640,
          bitrate: 800000
        }
      })

      // Check highest quality download
      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledWith({
        data: {
          videoVariantId: 'variant-1',
          quality: VideoVariantDownloadQuality.highest,
          url: 'https://stream.mux.com/test-playback-id/720p.mp4',
          version: 1,
          size: 157286400,
          height: 720,
          width: 1280,
          bitrate: 2500000
        }
      })
    })

    it('should return 0 when no static renditions files', async () => {
      const muxVideoAsset = {
        playback_ids: [{ id: 'test-playback-id' }],
        static_renditions: {
          files: null
        }
      }

      const result = await createDownloadsFromMuxAsset({
        variantId: 'variant-1',
        muxVideoAsset
      })

      expect(result).toBe(0)
      expect(prismaMock.videoVariantDownload.create).not.toHaveBeenCalled()
    })

    it('should return 0 when no playback ID', async () => {
      const muxVideoAsset = {
        playback_ids: [],
        static_renditions: {
          files: [
            {
              resolution: '720p',
              status: 'ready',
              filesize: '157286400',
              height: 720,
              width: 1280,
              bitrate: 2500000
            }
          ]
        }
      }

      const result = await createDownloadsFromMuxAsset({
        variantId: 'variant-1',
        muxVideoAsset
      })

      expect(result).toBe(0)
      expect(prismaMock.videoVariantDownload.create).not.toHaveBeenCalled()
    })

    it('should skip files with unmapped resolutions', async () => {
      const muxVideoAsset = {
        playback_ids: [{ id: 'test-playback-id' }],
        static_renditions: {
          files: [
            {
              resolution: '720p',
              status: 'ready',
              filesize: '157286400',
              height: 720,
              width: 1280,
              bitrate: 2500000
            },
            {
              resolution: '480p', // Unmapped resolution
              status: 'ready',
              filesize: '100000000',
              height: 480,
              width: 854,
              bitrate: 1000000
            }
          ]
        }
      }

      prismaMock.videoVariantDownload.create.mockResolvedValue({} as any)

      const result = await createDownloadsFromMuxAsset({
        variantId: 'variant-1',
        muxVideoAsset
      })

      expect(result).toBe(2) // 1 valid download + 1 highest
      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledTimes(2)
    })

    it('should handle duplicate constraint violations gracefully', async () => {
      const muxVideoAsset = {
        playback_ids: [{ id: 'test-playback-id' }],
        static_renditions: {
          files: [
            {
              resolution: '720p',
              status: 'ready',
              filesize: '157286400',
              height: 720,
              width: 1280,
              bitrate: 2500000
            }
          ]
        }
      }

      const duplicateError = new Error('Unique constraint violation') as any
      duplicateError.code = 'P2002'

      prismaMock.videoVariantDownload.create
        .mockRejectedValueOnce(duplicateError)
        .mockResolvedValueOnce({} as any)

      const result = await createDownloadsFromMuxAsset({
        variantId: 'variant-1',
        muxVideoAsset
      })

      expect(result).toBe(1) // Only 1 successful creation
      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledTimes(2)
    })

    it('should handle other database errors', async () => {
      const muxVideoAsset = {
        playback_ids: [{ id: 'test-playback-id' }],
        static_renditions: {
          files: [
            {
              resolution: '720p',
              status: 'ready',
              filesize: '157286400',
              height: 720,
              width: 1280,
              bitrate: 2500000
            }
          ]
        }
      }

      prismaMock.videoVariantDownload.create
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce({} as any)

      const result = await createDownloadsFromMuxAsset({
        variantId: 'variant-1',
        muxVideoAsset
      })

      expect(result).toBe(1) // Only 1 successful creation
      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledTimes(2)
    })

    it('should use fallback resolution for sd when 360p not available', async () => {
      const muxVideoAsset = {
        playback_ids: [{ id: 'test-playback-id' }],
        static_renditions: {
          files: [
            {
              resolution: '270p',
              status: 'ready',
              filesize: '26214400',
              height: 270,
              width: 480,
              bitrate: 400000
            },
            {
              resolution: '720p',
              status: 'ready',
              filesize: '157286400',
              height: 720,
              width: 1280,
              bitrate: 2500000
            }
            // Note: 360p is missing, should fallback to 270p for sd
          ]
        }
      }

      prismaMock.videoVariantDownload.create.mockResolvedValue({} as any)

      const result = await createDownloadsFromMuxAsset({
        variantId: 'variant-1',
        muxVideoAsset
      })

      expect(result).toBe(4) // 270p (low) + 720p (high) + 270p (fallback sd) + highest
      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledTimes(4)

      // Check fallback sd download (270p used as sd)
      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledWith({
        data: {
          videoVariantId: 'variant-1',
          quality: VideoVariantDownloadQuality.sd,
          url: 'https://stream.mux.com/test-playback-id/270p.mp4',
          version: 1,
          size: 26214400,
          height: 270,
          width: 480,
          bitrate: 400000
        }
      })
    })

    it('should use fallback resolution for high when 720p not available', async () => {
      const muxVideoAsset = {
        playback_ids: [{ id: 'test-playback-id' }],
        static_renditions: {
          files: [
            {
              resolution: '360p',
              status: 'ready',
              filesize: '52428800',
              height: 360,
              width: 640,
              bitrate: 800000
            },
            {
              resolution: '480p',
              status: 'ready',
              filesize: '78643200',
              height: 480,
              width: 854,
              bitrate: 1200000
            },
            {
              resolution: '1080p',
              status: 'ready',
              filesize: '314572800',
              height: 1080,
              width: 1920,
              bitrate: 5000000
            }
            // Note: 720p is missing, should fallback to 480p for high
          ]
        }
      }

      prismaMock.videoVariantDownload.create.mockResolvedValue({} as any)

      const result = await createDownloadsFromMuxAsset({
        variantId: 'variant-1',
        muxVideoAsset
      })

      expect(result).toBe(4) // 360p (sd) + 480p (fallback high) + 1080p (fhd) + highest
      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledTimes(4)

      // Check fallback high download (480p used as high)
      expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledWith({
        data: {
          videoVariantId: 'variant-1',
          quality: VideoVariantDownloadQuality.high,
          url: 'https://stream.mux.com/test-playback-id/480p.mp4',
          version: 1,
          size: 78643200,
          height: 480,
          width: 854,
          bitrate: 1200000
        }
      })
    })
  })
})

import Mux from '@mux/mux-node'
import { MockProxy, mockDeep } from 'jest-mock-extended'
import clone from 'lodash/clone'
import { Logger } from 'pino'

import { prismaMock } from '../../../../test/prismaMock'

import { createMuxAsset, importMuxVideos, updateHls, service } from './service'

// Mock the entire Mux module
const mockMux = mockDeep<Mux>()

jest.mock('@mux/mux-node', () => ({
  __esModule: true,
  default: jest.fn(() => mockMux)
}))

describe('muxVideos/service', () => {
  const originalEnv = clone(process.env)
  let mockLogger: MockProxy<Logger>

  beforeEach(() => {
    process.env.MUX_ACCESS_TOKEN_ID = 'mux_access_token_id'
    process.env.MUX_SECRET_KEY = 'mux_secret_key'
    mockLogger = mockDeep<Logger>()
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('createMuxAsset', () => {
    it('should create mux asset with 1080p resolution for videos <= 1080p height', async () => {
      const mockAsset = { id: 'mock-asset-id' }
      mockMux.video.assets.create.mockResolvedValue(mockAsset as any)

      const result = await createMuxAsset(
        'https://example.com/video.mp4',
        mockMux,
        720
      )

      expect(mockMux.video.assets.create).toHaveBeenCalledWith({
        inputs: [{ url: 'https://example.com/video.mp4' }],
        video_quality: 'plus',
        playback_policy: ['public'],
        max_resolution_tier: '1080p'
      })
      expect(result).toBe('mock-asset-id')
    })

    it('should create mux asset with 1440p resolution for videos > 1080p and <= 1440p height', async () => {
      const mockAsset = { id: 'mock-asset-id-1440p' }
      mockMux.video.assets.create.mockResolvedValue(mockAsset as any)

      const result = await createMuxAsset(
        'https://example.com/video.mp4',
        mockMux,
        1200
      )

      expect(mockMux.video.assets.create).toHaveBeenCalledWith({
        inputs: [{ url: 'https://example.com/video.mp4' }],
        video_quality: 'plus',
        playback_policy: ['public'],
        max_resolution_tier: '1440p'
      })
      expect(result).toBe('mock-asset-id-1440p')
    })

    it('should create mux asset with 2160p resolution for videos > 1440p height', async () => {
      const mockAsset = { id: 'mock-asset-id-2160p' }
      mockMux.video.assets.create.mockResolvedValue(mockAsset as any)

      const result = await createMuxAsset(
        'https://example.com/video.mp4',
        mockMux,
        2000
      )

      expect(mockMux.video.assets.create).toHaveBeenCalledWith({
        inputs: [{ url: 'https://example.com/video.mp4' }],
        video_quality: 'plus',
        playback_policy: ['public'],
        max_resolution_tier: '2160p'
      })
      expect(result).toBe('mock-asset-id-2160p')
    })

    it('should handle mux api errors', async () => {
      const error = new Error('Mux API Error')
      mockMux.video.assets.create.mockRejectedValue(error)

      await expect(
        createMuxAsset('https://example.com/video.mp4', mockMux, 720)
      ).rejects.toThrow('Mux API Error')
    })
  })

  describe('importMuxVideos', () => {
    beforeEach(() => {
      // Mock successful mux asset creation
      mockMux.video.assets.create.mockResolvedValue({
        id: 'mock-asset-id'
      } as any)
    })

    it('should process video variants and create mux assets', async () => {
      const mockVariants = [
        {
          id: 'variant-1',
          masterUrl: 'https://example.com/video1.mp4',
          masterHeight: 1080,
          muxVideoId: null
        },
        {
          id: 'variant-2',
          masterUrl: 'https://example.com/video2.mp4',
          masterHeight: 720,
          muxVideoId: null
        }
      ]

      prismaMock.videoVariant.findMany.mockResolvedValueOnce(
        mockVariants as any
      )
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([]) // Second call returns empty array
      prismaMock.muxVideo.create.mockResolvedValue({
        id: 'mux-video-id'
      } as any)
      prismaMock.videoVariant.update.mockResolvedValue({} as any)
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock)
      })

      await importMuxVideos(mockMux, mockLogger)

      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        where: {
          muxVideoId: null,
          masterHeight: { not: null },
          masterUrl: { not: null },
          OR: [
            { masterHeight: { gt: 720 } },
            { video: { originId: { not: '1' } } }
          ]
        },
        take: 100
      })

      expect(mockMux.video.assets.create).toHaveBeenCalledTimes(2)
      expect(prismaMock.muxVideo.create).toHaveBeenCalledTimes(2)
      expect(prismaMock.videoVariant.update).toHaveBeenCalledTimes(2)

      expect(mockLogger.info).toHaveBeenCalledWith('mux videos import started')
      expect(mockLogger.info).toHaveBeenCalledWith('Found 2 variants to import')
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Importing mux video for variant variant-1'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Importing mux video for variant variant-2'
      )
      expect(mockLogger.info).toHaveBeenCalledWith('Imported 2 mux videos')
    })

    it('should handle errors when creating mux asset and continue processing', async () => {
      const mockVariants = [
        {
          id: 'variant-1',
          masterUrl: 'https://example.com/video1.mp4',
          masterHeight: 1080,
          muxVideoId: null
        },
        {
          id: 'variant-2',
          masterUrl: 'https://example.com/video2.mp4',
          masterHeight: 720,
          muxVideoId: null
        }
      ]

      prismaMock.videoVariant.findMany.mockResolvedValueOnce(
        mockVariants as any
      )
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([])

      // First call fails, second succeeds
      mockMux.video.assets.create
        .mockRejectedValueOnce(new Error('Mux creation failed'))
        .mockResolvedValueOnce({ id: 'mock-asset-id-2' } as any)

      prismaMock.muxVideo.create.mockResolvedValue({
        id: 'mux-video-id'
      } as any)
      prismaMock.videoVariant.update.mockResolvedValue({} as any)
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock)
      })

      await importMuxVideos(mockMux, mockLogger)

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error creating mux asset for variant variant-1: Mux creation failed'
      )
      expect(prismaMock.muxVideo.create).toHaveBeenCalledTimes(1) // Only for successful variant
      expect(mockLogger.info).toHaveBeenCalledWith('Imported 2 mux videos')
    })

    it('should handle errors when updating database and continue processing', async () => {
      const mockVariants = [
        {
          id: 'variant-1',
          masterUrl: 'https://example.com/video1.mp4',
          masterHeight: 1080,
          muxVideoId: null
        }
      ]

      prismaMock.videoVariant.findMany.mockResolvedValueOnce(
        mockVariants as any
      )
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([])

      // Transaction fails
      prismaMock.$transaction.mockRejectedValueOnce(new Error('Database error'))

      await importMuxVideos(mockMux, mockLogger)

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error updating video variant variant-1: Database error'
      )
      expect(mockLogger.info).toHaveBeenCalledWith('Imported 1 mux videos')
    })

    it('should handle non-Error objects in catch blocks', async () => {
      const mockVariants = [
        {
          id: 'variant-1',
          masterUrl: 'https://example.com/video1.mp4',
          masterHeight: 1080,
          muxVideoId: null
        }
      ]

      prismaMock.videoVariant.findMany.mockResolvedValueOnce(
        mockVariants as any
      )
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([])

      // Throw non-Error object
      mockMux.video.assets.create.mockRejectedValueOnce('String error')

      await importMuxVideos(mockMux, mockLogger)

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error creating mux asset for variant variant-1'
      )
    })

    it('should process multiple batches when there are more than 100 variants', async () => {
      // Create 150 mock variants (will require 2 batches)
      const firstBatch = Array.from({ length: 100 }, (_, i) => ({
        id: `variant-${i}`,
        masterUrl: `https://example.com/video${i}.mp4`,
        masterHeight: 1080,
        muxVideoId: null
      }))

      const secondBatch = Array.from({ length: 50 }, (_, i) => ({
        id: `variant-${i + 100}`,
        masterUrl: `https://example.com/video${i + 100}.mp4`,
        masterHeight: 1080,
        muxVideoId: null
      }))

      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce(firstBatch as any)
        .mockResolvedValueOnce(secondBatch as any)
        .mockResolvedValueOnce([]) // Third call returns empty array

      prismaMock.muxVideo.create.mockResolvedValue({
        id: 'mux-video-id'
      } as any)
      prismaMock.videoVariant.update.mockResolvedValue({} as any)
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock)
      })

      await importMuxVideos(mockMux, mockLogger)

      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledTimes(3)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Found 100 variants to import'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Found 50 variants to import'
      )
      expect(mockLogger.info).toHaveBeenCalledWith('Imported 150 mux videos')
    })

    it('should work without logger', async () => {
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([])

      await expect(importMuxVideos(mockMux)).resolves.not.toThrow()
    })

    it('should include rate limiting delay between requests', async () => {
      const mockVariants = [
        {
          id: 'variant-1',
          masterUrl: 'https://example.com/video1.mp4',
          masterHeight: 1080,
          muxVideoId: null
        }
      ]

      prismaMock.videoVariant.findMany.mockResolvedValueOnce(
        mockVariants as any
      )
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([])
      prismaMock.muxVideo.create.mockResolvedValue({
        id: 'mux-video-id'
      } as any)
      prismaMock.videoVariant.update.mockResolvedValue({} as any)
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock)
      })

      const startTime = Date.now()
      await importMuxVideos(mockMux, mockLogger)
      const endTime = Date.now()

      // Should take at least 1000ms due to rate limiting
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000)
    })
  })

  describe('updateHls', () => {
    it('should update HLS URLs for variants with Mux videos', async () => {
      const mockVariants = [
        {
          id: 'variant-1',
          muxVideoId: 'mux-video-id-1',
          hls: 'https://old-url.com/variant1.m3u8',
          muxVideo: {
            playbackId: 'playback-id-1'
          }
        },
        {
          id: 'variant-2',
          muxVideoId: 'mux-video-id-2',
          hls: 'https://old-url.com/variant2.m3u8',
          muxVideo: {
            playbackId: 'playback-id-2'
          }
        }
      ]

      prismaMock.videoVariant.findMany.mockResolvedValueOnce(
        mockVariants as any
      )
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([])
      prismaMock.videoVariant.update.mockResolvedValue({} as any)

      await updateHls(mockMux, mockLogger)

      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        where: {
          muxVideoId: { not: null },
          hls: { not: { startsWith: 'https://stream.mux.com' } },
          muxVideo: {
            playbackId: { not: null }
          }
        },
        include: {
          muxVideo: true
        },
        take: 100
      })

      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant-1' },
        data: { hls: 'https://stream.mux.com/playback-id-1' }
      })

      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant-2' },
        data: { hls: 'https://stream.mux.com/playback-id-2' }
      })

      expect(mockLogger.info).toHaveBeenCalledWith('mux videos update started')
      expect(mockLogger.info).toHaveBeenCalledWith('Found 2 variants to update')
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Updating hls for variant variant-1'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Updating hls for variant variant-2'
      )
    })

    it('should process multiple batches when there are more than 100 variants', async () => {
      const firstBatch = Array.from({ length: 100 }, (_, i) => ({
        id: `variant-${i}`,
        muxVideoId: `mux-video-id-${i}`,
        hls: `https://old-url.com/variant${i}.m3u8`,
        muxVideo: {
          playbackId: `playback-id-${i}`
        }
      }))

      const secondBatch = Array.from({ length: 50 }, (_, i) => ({
        id: `variant-${i + 100}`,
        muxVideoId: `mux-video-id-${i + 100}`,
        hls: `https://old-url.com/variant${i + 100}.m3u8`,
        muxVideo: {
          playbackId: `playback-id-${i + 100}`
        }
      }))

      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce(firstBatch as any)
        .mockResolvedValueOnce(secondBatch as any)
        .mockResolvedValueOnce([])

      prismaMock.videoVariant.update.mockResolvedValue({} as any)

      await updateHls(mockMux, mockLogger)

      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledTimes(3)
      expect(prismaMock.videoVariant.update).toHaveBeenCalledTimes(150)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Found 100 variants to update'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Found 50 variants to update'
      )
    })

    it('should work without logger', async () => {
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([])

      await expect(updateHls(mockMux)).resolves.not.toThrow()
    })

    it('should handle empty results gracefully', async () => {
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([])

      await updateHls(mockMux, mockLogger)

      expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledWith('mux videos update started')
      expect(mockLogger.info).toHaveBeenCalledWith('Found 0 variants to update')
    })
  })

  describe('service', () => {
    it('should throw error when MUX_ACCESS_TOKEN_ID is missing', async () => {
      delete process.env.MUX_ACCESS_TOKEN_ID

      await expect(service(mockLogger)).rejects.toThrow(
        'Missing MUX_ACCESS_TOKEN_ID'
      )
    })

    it('should throw error when MUX_SECRET_KEY is missing', async () => {
      delete process.env.MUX_SECRET_KEY

      await expect(service(mockLogger)).rejects.toThrow(
        'Missing MUX_SECRET_KEY'
      )
    })

    it('should call both importMuxVideos and updateHls', async () => {
      // Mock empty results for both functions
      prismaMock.videoVariant.findMany.mockResolvedValue([])

      await service(mockLogger)

      // Verify importMuxVideos was called (it queries for variants without muxVideoId)
      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        where: {
          muxVideoId: null,
          masterHeight: { not: null },
          masterUrl: { not: null },
          OR: [
            { masterHeight: { gt: 720 } },
            { video: { originId: { not: '1' } } }
          ]
        },
        take: 100
      })

      // Verify updateHls was called (it queries for variants with muxVideoId but non-Mux HLS URLs)
      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        where: {
          muxVideoId: { not: null },
          hls: { not: { startsWith: 'https://stream.mux.com' } },
          muxVideo: {
            playbackId: { not: null }
          }
        },
        include: {
          muxVideo: true
        },
        take: 100
      })

      expect(mockLogger.info).toHaveBeenCalledWith('mux videos import started')
      expect(mockLogger.info).toHaveBeenCalledWith('mux videos update started')
    })

    it('should work without logger', async () => {
      prismaMock.videoVariant.findMany.mockResolvedValue([])

      await expect(service()).resolves.not.toThrow()
    })
  })
})

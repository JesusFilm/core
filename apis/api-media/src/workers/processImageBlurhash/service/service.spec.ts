import { Job } from 'bullmq'
import { Logger } from 'pino'

import { CloudflareImage } from '@core/prisma/media/client'

import { prismaMock } from '../../../../test/prismaMock'
import { generateBlurhash } from '../utils/generateBlurhash'

import { service } from './service'

const mockGenerateBlurhash = generateBlurhash as jest.MockedFunction<
  typeof generateBlurhash
>

jest.mock('../utils/generateBlurhash', () => ({
  generateBlurhash: jest.fn()
}))

describe('processImageBlurhash service', () => {
  let mockLogger: Partial<Logger>
  let mockJob: Job

  beforeEach(() => {
    jest.clearAllMocks()
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      child: jest.fn().mockReturnValue({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      })
    }

    mockJob = {
      id: 'test-job-id',
      name: 'test-job',
      data: {},
      queueName: 'test-queue'
    } as Job
  })

  describe('service', () => {
    it('should process single image when imageId is provided', async () => {
      const imageId = 'test-image-id'
      mockJob.data = { imageId }

      prismaMock.cloudflareImage.findUnique.mockResolvedValue({
        id: imageId,
        uploaded: true,
        blurhash: null
      } as CloudflareImage)

      mockGenerateBlurhash.mockResolvedValue('test-blurhash')
      prismaMock.cloudflareImage.update.mockResolvedValue({
        id: imageId,
        blurhash: 'test-blurhash',
        blurhashAttemptedAt: new Date()
      } as CloudflareImage)

      await service(mockJob, mockLogger as Logger)

      expect(prismaMock.cloudflareImage.findUnique).toHaveBeenCalledWith({
        where: { id: imageId },
        select: { id: true, uploaded: true, blurhash: true }
      })
      expect(mockGenerateBlurhash).toHaveBeenCalledWith(imageId)
      expect(prismaMock.cloudflareImage.update).toHaveBeenCalledWith({
        where: { id: imageId },
        data: {
          blurhash: 'test-blurhash',
          blurhashAttemptedAt: expect.any(Date)
        }
      })
      expect(mockLogger.info).toHaveBeenCalledWith(
        { imageId },
        'Processing single image blurhash'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        { imageId },
        'Successfully generated blurhash'
      )
    })

    it('should process batch when imageId is not provided', async () => {
      mockJob.data = {}

      prismaMock.cloudflareImage.findMany
        .mockResolvedValueOnce([
          { id: 'image-1' } as unknown as CloudflareImage,
          { id: 'image-2' } as unknown as CloudflareImage
        ])
        .mockResolvedValueOnce([])

      mockGenerateBlurhash
        .mockResolvedValueOnce('blurhash-1')
        .mockResolvedValueOnce(null)

      prismaMock.cloudflareImage.update
        .mockResolvedValueOnce({
          id: 'image-1',
          blurhash: 'blurhash-1'
        } as CloudflareImage)
        .mockResolvedValueOnce({
          id: 'image-2',
          blurhashAttemptedAt: new Date()
        } as CloudflareImage)

      await service(mockJob, mockLogger as Logger)

      expect(prismaMock.cloudflareImage.findMany).toHaveBeenCalledWith({
        where: {
          blurhash: null,
          uploaded: true,
          blurhashAttemptedAt: {
            lt: expect.any(Date)
          }
        },
        take: 50,
        select: { id: true }
      })
      expect(mockGenerateBlurhash).toHaveBeenCalledTimes(2)
      expect(prismaMock.cloudflareImage.update).toHaveBeenCalledTimes(2)
      expect(mockLogger.info).toHaveBeenCalledWith(
        { batchSize: 2 },
        'Processing batch of images'
      )
    })
  })

  describe('processSingleImage', () => {
    it('should handle image not found', async () => {
      const imageId = 'non-existent-id'
      mockJob.data = { imageId }

      prismaMock.cloudflareImage.findUnique.mockResolvedValue(null)

      await service(mockJob, mockLogger as Logger)

      expect(mockLogger.warn).toHaveBeenCalledWith(
        { imageId },
        'Image not found'
      )
      expect(mockGenerateBlurhash).not.toHaveBeenCalled()
    })

    it('should handle image not uploaded yet', async () => {
      const imageId = 'test-image-id'
      mockJob.data = { imageId }

      prismaMock.cloudflareImage.findUnique.mockResolvedValue({
        id: imageId,
        uploaded: false,
        blurhash: null
      } as CloudflareImage)

      await service(mockJob, mockLogger as Logger)

      expect(mockLogger.warn).toHaveBeenCalledWith(
        { imageId },
        'Image not uploaded yet'
      )
      expect(mockGenerateBlurhash).not.toHaveBeenCalled()
    })

    it('should skip image that already has blurhash', async () => {
      const imageId = 'test-image-id'
      mockJob.data = { imageId }

      prismaMock.cloudflareImage.findUnique.mockResolvedValue({
        id: imageId,
        uploaded: true,
        blurhash: 'existing-blurhash'
      } as CloudflareImage)

      await service(mockJob, mockLogger as Logger)

      expect(mockLogger.info).toHaveBeenCalledWith(
        { imageId },
        'Image already has blurhash'
      )
      expect(mockGenerateBlurhash).not.toHaveBeenCalled()
    })

    it('should handle blurhash generation failure', async () => {
      const imageId = 'test-image-id'
      mockJob.data = { imageId }

      prismaMock.cloudflareImage.findUnique.mockResolvedValue({
        id: imageId,
        uploaded: true,
        blurhash: null
      } as CloudflareImage)

      mockGenerateBlurhash.mockResolvedValue(null)
      prismaMock.cloudflareImage.update.mockResolvedValue({
        id: imageId,
        blurhashAttemptedAt: new Date()
      } as CloudflareImage)

      await service(mockJob, mockLogger as Logger)

      expect(mockGenerateBlurhash).toHaveBeenCalledWith(imageId)
      expect(prismaMock.cloudflareImage.update).toHaveBeenCalledWith({
        where: { id: imageId },
        data: { blurhashAttemptedAt: expect.any(Date) }
      })
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { imageId },
        'Failed to generate blurhash'
      )
    })

    it('should handle errors during blurhash generation', async () => {
      const imageId = 'test-image-id'
      mockJob.data = { imageId }
      const error = new Error('Generation failed')

      prismaMock.cloudflareImage.findUnique.mockResolvedValue({
        id: imageId,
        uploaded: true,
        blurhash: null
      } as CloudflareImage)

      mockGenerateBlurhash.mockRejectedValue(error)

      await service(mockJob, mockLogger as Logger)

      expect(mockLogger.error).toHaveBeenCalledWith(
        { imageId, error },
        'Error processing image blurhash'
      )
    })
  })

  describe('processBatch', () => {
    it('should process multiple batches', async () => {
      mockJob.data = {}

      prismaMock.cloudflareImage.findMany
        .mockResolvedValueOnce([
          { id: 'image-1' } as unknown as CloudflareImage,
          { id: 'image-2' } as unknown as CloudflareImage
        ])
        .mockResolvedValueOnce([
          { id: 'image-3' } as unknown as CloudflareImage
        ])
        .mockResolvedValueOnce([])

      mockGenerateBlurhash
        .mockResolvedValueOnce('blurhash-1')
        .mockResolvedValueOnce('blurhash-2')
        .mockResolvedValueOnce('blurhash-3')

      prismaMock.cloudflareImage.update.mockResolvedValue({
        id: 'image-1',
        blurhash: 'blurhash-1',
        blurhashAttemptedAt: new Date()
      } as CloudflareImage)

      await service(mockJob, mockLogger as Logger)

      expect(prismaMock.cloudflareImage.findMany).toHaveBeenCalledTimes(3)
      expect(mockGenerateBlurhash).toHaveBeenCalledTimes(3)
      expect(prismaMock.cloudflareImage.update).toHaveBeenCalledTimes(3)
      expect(mockLogger.info).toHaveBeenCalledWith(
        { totalProcessed: 3, totalFailed: 0 },
        'Finished processing images'
      )
    })

    it('should handle failed blurhash generations in batch', async () => {
      mockJob.data = {}

      prismaMock.cloudflareImage.findMany
        .mockResolvedValueOnce([
          { id: 'image-1' } as unknown as CloudflareImage,
          { id: 'image-2' } as unknown as CloudflareImage,
          { id: 'image-3' } as unknown as CloudflareImage
        ])
        .mockResolvedValueOnce([])

      mockGenerateBlurhash
        .mockResolvedValueOnce('blurhash-1')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('blurhash-3')

      prismaMock.cloudflareImage.update
        .mockResolvedValueOnce({
          id: 'image-1',
          blurhash: 'blurhash-1',
          blurhashAttemptedAt: new Date()
        } as CloudflareImage)
        .mockResolvedValueOnce({
          id: 'image-2',
          blurhashAttemptedAt: new Date()
        } as CloudflareImage)
        .mockResolvedValueOnce({
          id: 'image-3',
          blurhash: 'blurhash-3',
          blurhashAttemptedAt: new Date()
        } as CloudflareImage)

      await service(mockJob, mockLogger as Logger)

      expect(mockGenerateBlurhash).toHaveBeenCalledTimes(3)
      expect(prismaMock.cloudflareImage.update).toHaveBeenCalledTimes(3)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { imageId: 'image-2' },
        'Failed to generate blurhash, skipping future retries in this run'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        { totalProcessed: 2, totalFailed: 1 },
        'Finished processing images'
      )
    })

    it('should stop when no more images are found', async () => {
      mockJob.data = {}

      prismaMock.cloudflareImage.findMany.mockResolvedValueOnce([])

      await service(mockJob, mockLogger as Logger)

      expect(prismaMock.cloudflareImage.findMany).toHaveBeenCalledTimes(1)
      expect(mockGenerateBlurhash).not.toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledWith(
        { totalProcessed: 0, totalFailed: 0 },
        'Finished processing images'
      )
    })
  })

  describe('generateAndSaveBlurhash', () => {
    it('should save blurhash when generation succeeds', async () => {
      const imageId = 'test-image-id'
      mockJob.data = { imageId }

      prismaMock.cloudflareImage.findUnique.mockResolvedValue({
        id: imageId,
        uploaded: true,
        blurhash: null
      } as CloudflareImage)

      mockGenerateBlurhash.mockResolvedValue('test-blurhash')
      prismaMock.cloudflareImage.update.mockResolvedValue({
        id: imageId,
        blurhash: 'test-blurhash',
        blurhashAttemptedAt: new Date()
      } as CloudflareImage)

      await service(mockJob, mockLogger as Logger)

      expect(prismaMock.cloudflareImage.update).toHaveBeenCalledWith({
        where: { id: imageId },
        data: {
          blurhash: 'test-blurhash',
          blurhashAttemptedAt: expect.any(Date)
        }
      })
    })

    it('should update blurhashAttemptedAt even when generation fails', async () => {
      const imageId = 'test-image-id'
      mockJob.data = { imageId }

      prismaMock.cloudflareImage.findUnique.mockResolvedValue({
        id: imageId,
        uploaded: true,
        blurhash: null
      } as CloudflareImage)

      mockGenerateBlurhash.mockResolvedValue(null)
      prismaMock.cloudflareImage.update.mockResolvedValue({
        id: imageId,
        blurhashAttemptedAt: new Date()
      } as CloudflareImage)

      await service(mockJob, mockLogger as Logger)

      expect(prismaMock.cloudflareImage.update).toHaveBeenCalledWith({
        where: { id: imageId },
        data: { blurhashAttemptedAt: expect.any(Date) }
      })
      expect(prismaMock.cloudflareImage.update).not.toHaveBeenCalledWith({
        where: { id: imageId },
        data: expect.objectContaining({ blurhash: expect.anything() })
      })
    })
  })
})

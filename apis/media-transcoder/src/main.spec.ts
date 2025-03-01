import { S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Job, Queue } from 'bullmq'
import { mockDeep, mockReset } from 'jest-mock-extended'
import fetch from 'node-fetch'

import { getClient, getPresignedUrl, main, uploadToR2 } from './main'

// Define a minimal FfmpegCommand type for testing
interface MockFfmpegCommand {
  input: (url: string) => MockFfmpegCommand
  size: (size: string) => MockFfmpegCommand
  autopad: () => MockFfmpegCommand
  videoBitrate: (bitrate: string) => MockFfmpegCommand
  saveToFile: (outputFile: string) => MockFfmpegCommand
  on: (event: string, callback: any) => MockFfmpegCommand
  [key: string]: any // Allow any other properties
}

// Hoisted mocks
const mockFfmpeg = jest.fn()

// Mock deep objects
const mockJob = mockDeep<Job<any>>()
const mockQueue = mockDeep<Queue>()

// Mock all external dependencies
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      // Mock methods as needed
    })),
    PutObjectCommand: jest.fn().mockImplementation((params) => ({
      ...params
    }))
  }
})

jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: jest.fn().mockResolvedValue('https://mock-presigned-url.com')
  }
})

// Mock ffmpeg
jest.mock('./types/fluent-ffmpeg', () => {
  // Create a mock ffmpeg instance that properly handles events
  type ProgressCallback = (progress: { percent: number }) => void
  type EndCallback = () => void
  type ErrorCallback = (error: Error) => void

  const eventHandlers: {
    progress: ProgressCallback | null
    end: EndCallback | null
    error: ErrorCallback | null
  } = {
    progress: null,
    end: null,
    error: null
  }

  const mockFfmpegInstance = {
    input: jest.fn().mockReturnThis(),
    size: jest.fn().mockReturnThis(),
    autopad: jest.fn().mockReturnThis(),
    videoBitrate: jest.fn().mockReturnThis(),
    saveToFile: jest.fn().mockReturnThis(),
    on: jest.fn().mockImplementation((event: string, callback: any) => {
      if (event === 'progress') {
        eventHandlers.progress = callback as ProgressCallback
      } else if (event === 'end') {
        eventHandlers.end = callback as EndCallback
      } else if (event === 'error') {
        eventHandlers.error = callback as ErrorCallback
      }
      return mockFfmpegInstance
    }),
    // Helper methods to trigger events in tests
    _triggerProgress: (percent: number) => {
      if (eventHandlers.progress) {
        eventHandlers.progress({ percent })
      }
    },
    _triggerEnd: () => {
      if (eventHandlers.end) {
        eventHandlers.end()
      }
    },
    _triggerError: (error: Error) => {
      if (eventHandlers.error) {
        eventHandlers.error(error)
      }
    }
  }

  return {
    default: jest.fn().mockReturnValue(mockFfmpegInstance)
  }
})

// Mock bullmq
jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation(() => mockQueue),
    Job: jest.fn().mockImplementation(() => mockJob)
  }
})

jest.mock('fs/promises', () => {
  return {
    readFile: jest.fn().mockResolvedValue(Buffer.from('mock file content')),
    stat: jest.fn().mockResolvedValue({ size: 1024 })
  }
})

jest.mock('node-fetch', () => {
  return {
    default: jest.fn().mockResolvedValue({
      ok: true
    })
  }
})

describe('Media Transcoder', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Setup environment variables
    process.env.CLOUDFLARE_R2_ENDPOINT = 'https://mock-endpoint.com'
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID = 'mock-access-key'
    process.env.CLOUDFLARE_R2_SECRET = 'mock-secret'
    process.env.CLOUDFLARE_R2_BUCKET = 'mock-bucket'
    process.env.BULLMQ_QUEUE = 'mock-queue'
    process.env.BULLMQ_JOB = 'mock-job-id'
    process.env.REDIS_URL = 'mock-redis-url'
    process.env.REDIS_PORT = '6379'

    // Reset all mocks
    jest.clearAllMocks()
    mockReset(mockJob)
    mockReset(mockQueue)

    // Setup default mock job data
    mockJob.data = {
      inputUrl: 'https://example.com/input.mp4',
      outputFilename: '/tmp/output.mp4',
      resolution: '1280x720',
      videoBitrate: '1000k',
      contentType: 'video/mp4',
      outputPath: '/tmp',
      userId: 'test-user'
    }
    mockJob.id = 'test-job-id'
  })

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv }
  })

  describe('getClient', () => {
    it('should create an S3Client with correct configuration', () => {
      const client = getClient()
      expect(S3Client).toHaveBeenCalledWith({
        region: 'auto',
        endpoint: 'https://mock-endpoint.com',
        credentials: {
          accessKeyId: 'mock-access-key',
          secretAccessKey: 'mock-secret'
        }
      })
    })

    it('should throw an error if environment variables are missing', () => {
      delete process.env.CLOUDFLARE_R2_ENDPOINT
      expect(() => getClient()).toThrow('Missing CLOUDFLARE_R2_ENDPOINT')

      process.env.CLOUDFLARE_R2_ENDPOINT = 'https://mock-endpoint.com'
      delete process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
      expect(() => getClient()).toThrow('Missing CLOUDFLARE_R2_ACCESS_KEY_ID')

      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID = 'mock-access-key'
      delete process.env.CLOUDFLARE_R2_SECRET
      expect(() => getClient()).toThrow('Missing CLOUDFLARE_R2_SECRET')
    })
  })

  describe('getPresignedUrl', () => {
    it('should generate a presigned URL with correct parameters', async () => {
      const url = await getPresignedUrl('test-file.mp4')
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          Bucket: 'mock-bucket',
          Key: 'test-file.mp4'
        })
      )
      expect(url).toBe('https://mock-presigned-url.com')
    })

    it('should throw an error if CLOUDFLARE_R2_BUCKET is missing', async () => {
      delete process.env.CLOUDFLARE_R2_BUCKET
      await expect(getPresignedUrl('test-file.mp4')).rejects.toThrow(
        'Missing CLOUDFLARE_R2_BUCKET'
      )
    })
  })

  describe('uploadToR2', () => {
    it('should upload file to R2 and update job progress', async () => {
      await uploadToR2(mockJob)

      expect(getSignedUrl).toHaveBeenCalled()
      expect(fetch).toHaveBeenCalledWith(
        'https://mock-presigned-url.com',
        expect.objectContaining({
          method: 'PUT',
          body: expect.any(Buffer),
          headers: {
            'Content-Type': 'video/mp4'
          }
        })
      )
      expect(mockJob.updateData).toHaveBeenCalled()
      expect(mockJob.updateProgress).toHaveBeenCalledWith(100)
      expect(mockJob.moveToCompleted).toHaveBeenCalledWith(
        { message: 'Uploaded to R2' },
        'test-job-id'
      )
    })
  })

  describe('main', () => {
    it('should process a job successfully', async () => {
      // Mock the getJob method to return our mock job
      mockQueue.getJob.mockResolvedValue(mockJob)

      // Get the mock ffmpeg instance
      const mockFfmpegInstance = mockFfmpeg()

      // Run the main function
      await main()

      // Verify the Queue constructor was called with correct params
      expect(Queue).toHaveBeenCalledWith('mock-queue', {
        connection: {
          host: 'mock-redis-url',
          port: 6379
        }
      })

      // Verify getJob was called with the correct job ID
      expect(mockQueue.getJob).toHaveBeenCalledWith('mock-job-id')

      // Verify ffmpeg was called with correct parameters
      expect(mockFfmpeg).toHaveBeenCalled()
      expect(mockFfmpegInstance.input).toHaveBeenCalledWith(
        'https://example.com/input.mp4'
      )
      expect(mockFfmpegInstance.size).toHaveBeenCalledWith('1280x720')
      expect(mockFfmpegInstance.autopad).toHaveBeenCalled()
      expect(mockFfmpegInstance.videoBitrate).toHaveBeenCalledWith('1000k')
      expect(mockFfmpegInstance.saveToFile).toHaveBeenCalledWith(
        '/tmp/output.mp4'
      )

      // Verify event handlers were registered
      expect(mockFfmpegInstance.on).toHaveBeenCalledWith(
        'progress',
        expect.any(Function)
      )
      expect(mockFfmpegInstance.on).toHaveBeenCalledWith(
        'end',
        expect.any(Function)
      )
      expect(mockFfmpegInstance.on).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      )

      // Trigger progress event and verify job progress was updated
      mockFfmpegInstance._triggerProgress(50)
      expect(mockJob.updateProgress).toHaveBeenCalledWith(40) // 50 * 0.8 = 40

      // Trigger end event and verify transcodeFinished was called
      mockFfmpegInstance._triggerEnd()
      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(mockJob.updateData).toHaveBeenCalled()
    })

    it('should throw an error if BULLMQ_QUEUE is not set', async () => {
      delete process.env.BULLMQ_QUEUE
      await expect(main()).rejects.toThrow('BULLMQ_QUEUE is not set')
    })

    it('should throw an error if BULLMQ_JOB is not set', async () => {
      delete process.env.BULLMQ_JOB
      await expect(main()).rejects.toThrow('BULLMQ_JOB is not set')
    })

    it('should throw an error if job is not found', async () => {
      mockQueue.getJob.mockResolvedValue(null)
      await expect(main()).rejects.toThrow('Job mock-job-id not found')
    })

    it('should handle ffmpeg errors', async () => {
      // Mock the getJob method to return our mock job
      mockQueue.getJob.mockResolvedValue(mockJob)

      // Get the mock ffmpeg instance and set up to trigger an error
      const mockFfmpegInstance = mockFfmpeg()

      // Run the main function
      await main()

      // Trigger an error
      mockFfmpegInstance._triggerError(new Error('Ffmpeg error'))

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Verify job was moved to failed
      expect(mockJob.moveToFailed).toHaveBeenCalledWith(
        { message: 'Ffmpeg error', name: 'Error' },
        'test-job-id'
      )
    })
  })
})

import { S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Job, Queue } from 'bullmq'
import fetch from 'node-fetch'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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
const mockFfmpeg = vi.hoisted(() => {
  return vi.fn()
})

// Mock Worker class
const mockGetNextJob = vi.fn()

// Mock all external dependencies
vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: vi.fn().mockImplementation(() => ({
      // Mock methods as needed
    })),
    PutObjectCommand: vi.fn().mockImplementation((params) => ({
      ...params
    }))
  }
})

vi.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: vi.fn().mockResolvedValue('https://mock-presigned-url.com')
  }
})

// Mock ffmpeg
vi.mock('./types/fluent-ffmpeg', () => {
  return {
    default: mockFfmpeg
  }
})

// Create mock job and queue for testing
const createMockJob = () =>
  ({
    data: {
      inputUrl: 'https://example.com/input.mp4',
      outputFile: '/tmp/output.mp4',
      size: '1280x720',
      videoBitrate: '1000k',
      r2Filename: 'output.mp4',
      contentType: 'video/mp4'
    },
    updateProgress: vi.fn(),
    moveToCompleted: vi.fn(),
    moveToFailed: vi.fn(),
    // Add required Job properties
    queue: {} as any,
    name: 'test-job',
    opts: {},
    queueQualifiedName: 'test-queue:test-job',
    id: 'test-job-id',
    attemptsMade: 0
  }) as unknown as Job

const createMockQueue = () =>
  ({
    add: vi.fn()
  }) as unknown as Queue

vi.mock('bullmq', () => {
  const mockUpdateProgress = vi.fn()
  const mockMoveToCompleted = vi.fn()
  const mockMoveToFailed = vi.fn()
  const mockAdd = vi.fn()

  return {
    Job: vi.fn().mockImplementation(() => ({
      updateProgress: mockUpdateProgress,
      moveToCompleted: mockMoveToCompleted,
      moveToFailed: mockMoveToFailed,
      data: {
        inputUrl: 'https://example.com/input.mp4',
        outputFile: '/tmp/output.mp4',
        size: '1280x720',
        videoBitrate: '1000k',
        r2Filename: 'output.mp4',
        contentType: 'video/mp4'
      },
      // Add required Job properties
      queue: {},
      name: 'test-job',
      opts: {},
      queueQualifiedName: 'test-queue:test-job',
      id: 'test-job-id',
      attemptsMade: 0
    })),
    Queue: vi.fn().mockImplementation(() => ({
      add: mockAdd
    })),
    Worker: vi.fn().mockImplementation(() => ({
      getNextJob: mockGetNextJob
    }))
  }
})

vi.mock('fs/promises', () => {
  return {
    readFile: vi.fn().mockResolvedValue(Buffer.from('mock file content'))
  }
})

vi.mock('node-fetch', () => {
  return {
    default: vi.fn().mockResolvedValue({
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
    process.env.BULLMQ_OUTPUT_QUEUE = 'mock-output-queue'
    process.env.BULLMQ_JOB = 'mock-job-id'
    process.env.REDIS_URL = 'mock-redis-url'
    process.env.REDIS_PORT = '6379'

    // Reset all mocks
    vi.clearAllMocks()
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
    it('should upload file to R2 and move job to completed', async () => {
      const mockJob = createMockJob()
      const mockQueue = createMockQueue()
      const jobId = 'test-job-id'

      await uploadToR2(jobId, mockJob, mockQueue)

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
      expect(mockJob.updateProgress).toHaveBeenCalledWith(100)
      expect(mockJob.moveToCompleted).toHaveBeenCalledWith(
        { message: 'Uploaded to R2' },
        jobId
      )
      expect(mockQueue.add).toHaveBeenCalledWith(
        'mock-output-queue',
        mockJob.data
      )
    })

    it('should throw an error if BULLMQ_OUTPUT_QUEUE is missing', async () => {
      delete process.env.BULLMQ_OUTPUT_QUEUE
      const mockJob = createMockJob()
      const mockQueue = createMockQueue()
      const jobId = 'test-job-id'

      await expect(uploadToR2(jobId, mockJob, mockQueue)).rejects.toThrow(
        'BULLMQ_OUTPUT_QUEUE is not set'
      )
    })
  })

  describe('main', () => {
    it('should process a job successfully', async () => {
      // Setup mocks
      const mockJob = createMockJob()

      // Set up the mock for getNextJob
      mockGetNextJob.mockResolvedValue(mockJob)

      // Create a mock ffmpeg instance
      const mockFfmpegInstance: MockFfmpegCommand = {
        input: vi.fn().mockReturnThis(),
        size: vi.fn().mockReturnThis(),
        autopad: vi.fn().mockReturnThis(),
        videoBitrate: vi.fn().mockReturnThis(),
        saveToFile: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis()
      }

      // Set up the ffmpeg mock
      mockFfmpeg.mockReturnValue(mockFfmpegInstance)

      // Run the main function
      await main()

      // Verify the ffmpeg configuration was set up correctly
      expect(mockFfmpegInstance.input).toHaveBeenCalledWith(
        mockJob.data.inputUrl
      )
      expect(mockFfmpegInstance.size).toHaveBeenCalledWith(mockJob.data.size)
      expect(mockFfmpegInstance.videoBitrate).toHaveBeenCalledWith(
        mockJob.data.videoBitrate
      )
      expect(mockFfmpegInstance.saveToFile).toHaveBeenCalledWith(
        mockJob.data.outputFile
      )
      expect(mockFfmpegInstance.on).toHaveBeenCalledTimes(3) // progress, end, error
    })

    it('should throw an error if required environment variables are missing', async () => {
      // Test each required environment variable
      const requiredVars = ['BULLMQ_QUEUE', 'BULLMQ_OUTPUT_QUEUE', 'BULLMQ_JOB']

      for (const varName of requiredVars) {
        const originalValue = process.env[varName]
        delete process.env[varName]

        await expect(main()).rejects.toThrow(`${varName} is not set`)

        // Restore the variable for the next test
        process.env[varName] = originalValue
      }
    })

    it('should throw an error if job is not found', async () => {
      // Set up the mock for getNextJob to return null
      mockGetNextJob.mockResolvedValue(null)

      await expect(main()).rejects.toThrow(
        `Job ${process.env.BULLMQ_JOB} not found`
      )
    })

    it('should handle ffmpeg errors correctly', async () => {
      // Setup mocks
      const mockJob = createMockJob()

      // Set up the mock for getNextJob
      mockGetNextJob.mockResolvedValue(mockJob)

      // Create a mock ffmpeg instance that triggers an error
      const mockFfmpegInstance: MockFfmpegCommand = {
        input: vi.fn().mockReturnThis(),
        size: vi.fn().mockReturnThis(),
        autopad: vi.fn().mockReturnThis(),
        videoBitrate: vi.fn().mockReturnThis(),
        saveToFile: vi.fn().mockReturnThis(),
        on: vi.fn().mockImplementation(function (event, callback) {
          if (event === 'error') {
            // Execute callback immediately
            callback(new Error('Ffmpeg error'))
          }
          return this
        })
      }

      // Set up the ffmpeg mock
      mockFfmpeg.mockReturnValue(mockFfmpegInstance)

      // Run the main function and wait for it to complete
      await main()

      // Verify the job was moved to failed
      expect(mockJob.moveToFailed).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Ffmpeg error'
        }),
        process.env.BULLMQ_JOB
      )
    })
  })
})

import { S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Job, Queue } from 'bullmq'
import fetch from 'node-fetch'

// Import after mocks are set up
import {
  type TranscodeVideoJob,
  getClient,
  getPresignedUrl,
  main,
  uploadToR2
} from './main'

// Mock all external dependencies first
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  PutObjectCommand: jest.fn().mockImplementation((params) => ({ ...params }))
}))

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://mock-presigned-url.com')
}))

jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue(Buffer.from('mock file content')),
  stat: jest.fn().mockResolvedValue({ size: 1024 })
}))

// Mock node-fetch with a function that returns a resolved promise
jest.mock('node-fetch', () => jest.fn().mockResolvedValue({ ok: true }))

// Create a mock ffmpeg instance directly in the mock
jest.mock('./types/fluent-ffmpeg', () => {
  // Create a mock instance
  const mockInstance = {
    input: jest.fn().mockReturnThis(),
    size: jest.fn().mockReturnThis(),
    autopad: jest.fn().mockReturnThis(),
    videoBitrate: jest.fn().mockReturnThis(),
    saveToFile: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis()
  }

  // Create the mock ffmpeg function
  const mockFn = jest.fn().mockReturnValue(mockInstance)

  return {
    __esModule: true,
    default: mockFn
  }
})

// Create a mock job that matches the Job<TranscodeVideoJob> type
const mockJobData: TranscodeVideoJob = {
  inputUrl: 'https://example.com/input.mp4',
  outputFilename: '/tmp/output.mp4',
  resolution: '1280x720',
  videoBitrate: '1000k',
  contentType: 'video/mp4',
  outputPath: '/tmp',
  userId: 'test-user'
}

// Create mock functions with Jest mock functionality
const updateProgressMock = jest.fn().mockResolvedValue(undefined)
const updateDataMock = jest.fn().mockResolvedValue(undefined)
const moveToCompletedMock = jest.fn().mockResolvedValue(undefined)
const moveToFailedMock = jest.fn().mockResolvedValue(undefined)
const getJobMock = jest.fn()

// Create a partial implementation of Job that has the methods we need
const mockJob = {
  id: 'test-job-id',
  data: mockJobData,
  queue: {} as any,
  name: 'transcode',
  opts: {},
  queueQualifiedName: 'test-queue',
  updateProgress: updateProgressMock,
  updateData: updateDataMock,
  moveToCompleted: moveToCompletedMock,
  moveToFailed: moveToFailedMock
} as unknown as Job<TranscodeVideoJob>

const mockQueue = {
  getJob: getJobMock
} as unknown as Queue

// Mock bullmq
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => mockQueue),
  Job: jest.fn().mockImplementation(() => mockJob)
}))

// Get the mocks from the jest mock system
const mockFfmpeg = jest.requireMock('./types/fluent-ffmpeg').default
const mockFfmpegInstance = mockFfmpeg()

// Add event trigger methods
const triggerProgress = (percent: number) => {
  // Find the progress callback and call it
  const calls = mockFfmpegInstance.on.mock.calls
  const progressCall = calls.find((call) => call[0] === 'progress')
  if (progressCall && progressCall[1]) {
    progressCall[1]({ percent })
  }
}

const triggerEnd = () => {
  // Find the end callback and call it
  const calls = mockFfmpegInstance.on.mock.calls
  const endCall = calls.find((call) => call[0] === 'end')
  if (endCall && endCall[1]) {
    endCall[1]()
  }
}

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
    updateProgressMock.mockClear()
    updateDataMock.mockClear()
    moveToCompletedMock.mockClear()
    moveToFailedMock.mockClear()
    getJobMock.mockClear()
    mockFfmpeg.mockClear()
    mockFfmpegInstance.input.mockClear()
    mockFfmpegInstance.size.mockClear()
    mockFfmpegInstance.autopad.mockClear()
    mockFfmpegInstance.videoBitrate.mockClear()
    mockFfmpegInstance.saveToFile.mockClear()
    mockFfmpegInstance.on.mockClear()

    // Reset mock job data
    mockJob.id = 'test-job-id'
    mockJob.data = { ...mockJobData }
  })

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv }
  })

  describe('main', () => {
    it('should process a job successfully', async () => {
      // Mock the getJob method to return our mock job
      getJobMock.mockResolvedValue(mockJob)

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
      expect(getJobMock).toHaveBeenCalledWith('mock-job-id')

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
      triggerProgress(50)
      expect(updateProgressMock).toHaveBeenCalledWith(40) // 50 * 0.8 = 40

      // Trigger end event and verify transcodeFinished was called
      triggerEnd()
      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(updateDataMock).toHaveBeenCalled()
    })

    it('should handle ffmpeg errors', async () => {
      // Mock the getJob method to return our mock job
      getJobMock.mockResolvedValue(mockJob)

      // Create a mock implementation that throws an error
      mockFfmpeg.mockImplementationOnce(() => {
        throw new Error('Ffmpeg error')
      })

      // Run the main function
      await main()

      // Verify job was moved to failed
      expect(moveToFailedMock).toHaveBeenCalledWith(
        { message: 'Ffmpeg error', name: 'Error' },
        'test-job-id'
      )
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
      getJobMock.mockResolvedValue(null)
      await expect(main()).rejects.toThrow('Job mock-job-id not found')
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
      expect(updateDataMock).toHaveBeenCalled()
      expect(updateProgressMock).toHaveBeenCalledWith(100)
      expect(moveToCompletedMock).toHaveBeenCalledWith(
        { message: 'Uploaded to R2' },
        'test-job-id'
      )
    })
  })

  describe('getClient', () => {
    it('should create an S3Client with correct configuration', () => {
      getClient()
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
})

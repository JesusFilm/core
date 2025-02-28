import {
  ECSClient,
  RunTaskCommand,
  RunTaskCommandOutput
} from '@aws-sdk/client-ecs'
import { Job, Queue, QueueEvents } from 'bullmq'
import { mockDeep, mockReset } from 'jest-mock-extended'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { builder } from '../../../schema/builder'
import { connection } from '../../../workers/lib/connection'

// Mock BullMQ
jest.mock('bullmq', () => {
  const originalModule = jest.requireActual('bullmq')
  const mockAdd = jest.fn().mockImplementation(() => ({
    id: 'mock-job-id',
    data: {
      inputUrl: 'https://example.com/input.mp4',
      resolution: '720p',
      videoBitrate: '2000k',
      contentType: 'video/mp4',
      outputFilename: 'output.mp4',
      outputPath: '/videos'
    }
  }))
  const mockGetJob = jest.fn().mockImplementation(() => ({
    progress: 50
  }))

  return {
    ...originalModule,
    Queue: jest.fn().mockImplementation(() => ({
      add: mockAdd,
      getJob: mockGetJob
    })),
    QueueEvents: jest.fn().mockImplementation(() => ({
      on: jest.fn()
    }))
  }
})

// Mock AWS SDK
jest.mock('@aws-sdk/client-ecs', () => {
  const mockSend = jest.fn().mockImplementation(() => ({
    tasks: [{ taskArn: 'mock-task-arn' }]
  }))

  return {
    ECSClient: jest.fn().mockImplementation(() => ({
      send: mockSend
    })),
    RunTaskCommand: jest.fn().mockImplementation((input) => ({
      input
    }))
  }
})

// Mock environment variables
const originalEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = {
    ...originalEnv,
    AWS_REGION: 'us-east-1',
    ECS_CLUSTER: 'test-cluster',
    MEDIA_TRANSCODER_TASK_DEFINITION: 'test-task-definition'
  }
  mockReset(prismaMock)
})

afterEach(() => {
  process.env = originalEnv
})

describe('Transcode Mutations', () => {
  describe('transcodeAsset mutation', () => {
    it('should create a transcode job and launch ECS task', async () => {
      // Mock Prisma findUnique
      prismaMock.cloudflareR2.findUnique.mockResolvedValue({
        id: 'mock-asset-id',
        publicUrl: 'https://example.com/input.mp4',
        contentType: 'video/mp4',
        size: 1000,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const client = getClient()
      const result = await client({
        document: `
          mutation TranscodeAsset($input: TranscodeVideoInput!) {
            transcodeAsset(input: $input)
          }
        `,
        variables: {
          input: {
            r2AssetId: 'mock-asset-id',
            resolution: '720p',
            bitrate: 2000,
            outputFilename: 'output.mp4',
            outputPath: '/videos'
          }
        },
        context: {
          user: {
            id: 'user-id',
            isPublisher: true
          }
        }
      })

      expect(result.data?.transcodeAsset).toBe('mock-job-id')
    })

    it('should throw an error if user is not authenticated', async () => {
      const client = getClient()
      const result = await client({
        document: `
          mutation TranscodeAsset($input: TranscodeVideoInput!) {
            transcodeAsset(input: $input)
          }
        `,
        variables: {
          input: {
            r2AssetId: 'mock-asset-id',
            resolution: '720p',
            outputFilename: 'output.mp4',
            outputPath: '/videos'
          }
        },
        context: {
          user: null
        }
      })

      expect(result.errors).toBeDefined()
      expect(result.errors?.[0].message).toBe('User not found')
    })

    it('should throw an error if input asset is not found', async () => {
      // Mock Prisma findUnique to return null
      prismaMock.cloudflareR2.findUnique.mockResolvedValue(null)

      const client = getClient()
      const result = await client({
        document: `
          mutation TranscodeAsset($input: TranscodeVideoInput!) {
            transcodeAsset(input: $input)
          }
        `,
        variables: {
          input: {
            r2AssetId: 'non-existent-asset-id',
            resolution: '720p',
            outputFilename: 'output.mp4',
            outputPath: '/videos'
          }
        },
        context: {
          user: {
            id: 'user-id',
            isPublisher: true
          }
        }
      })

      expect(result.errors).toBeDefined()
      expect(result.errors?.[0].message).toBe('Input asset not found')
    })
  })

  describe('getTranscodeStatus mutation', () => {
    it('should return the job progress', async () => {
      const client = getClient()
      const result = await client({
        document: `
          mutation GetTranscodeStatus($jobId: String!) {
            getTranscodeStatus(jobId: $jobId)
          }
        `,
        variables: {
          jobId: 'mock-job-id'
        },
        context: {
          user: {
            id: 'user-id',
            isPublisher: true
          }
        }
      })

      expect(result.data?.getTranscodeStatus).toBe(50)
    })

    it('should throw an error if job is not found', async () => {
      // Mock Queue.getJob to return null
      jest.spyOn(Queue.prototype, 'getJob').mockResolvedValueOnce(null)

      const client = getClient()
      const result = await client({
        document: `
          mutation GetTranscodeStatus($jobId: String!) {
            getTranscodeStatus(jobId: $jobId)
          }
        `,
        variables: {
          jobId: 'non-existent-job-id'
        },
        context: {
          user: {
            id: 'user-id',
            isPublisher: true
          }
        }
      })

      expect(result.errors).toBeDefined()
      expect(result.errors?.[0].message).toBe('Job not found')
    })
  })
})

describe('launchTranscodeTask', () => {
  it('should launch an ECS task with correct parameters', async () => {
    // Import the module to test
    const { launchTranscodeTask } = require('./transcode')

    const taskArn = await launchTranscodeTask({
      jobId: 'test-job-id',
      queue: 'test-queue'
    })

    // Verify ECSClient was initialized
    expect(ECSClient).toHaveBeenCalledWith({
      region: 'us-east-1'
    })

    // Verify RunTaskCommand was called with correct parameters
    expect(RunTaskCommand).toHaveBeenCalledWith({
      cluster: 'test-cluster',
      taskDefinition: 'test-task-definition',
      count: 1,
      launchType: 'FARGATE',
      overrides: {
        containerOverrides: [
          {
            name: 'test-task-definition-app',
            environment: [
              { name: 'BULLMQ_JOB', value: 'test-job-id' },
              { name: 'BULLMQ_QUEUE', value: 'test-queue' }
            ]
          }
        ]
      }
    })

    expect(taskArn).toBe('mock-task-arn')
  })

  it('should throw an error if AWS_REGION is not set', async () => {
    // Remove AWS_REGION from environment
    delete process.env.AWS_REGION

    // Import the module to test
    const { launchTranscodeTask } = require('./transcode')

    await expect(
      launchTranscodeTask({
        jobId: 'test-job-id',
        queue: 'test-queue'
      })
    ).rejects.toThrow('AWS_REGION environment variable is required')
  })

  it('should throw an error if ECS_CLUSTER is not set', async () => {
    // Remove ECS_CLUSTER from environment
    delete process.env.ECS_CLUSTER

    // Import the module to test
    const { launchTranscodeTask } = require('./transcode')

    await expect(
      launchTranscodeTask({
        jobId: 'test-job-id',
        queue: 'test-queue'
      })
    ).rejects.toThrow('ECS_CLUSTER environment variable is required')
  })

  it('should throw an error if MEDIA_TRANSCODER_TASK_DEFINITION is not set', async () => {
    // Remove MEDIA_TRANSCODER_TASK_DEFINITION from environment
    delete process.env.MEDIA_TRANSCODER_TASK_DEFINITION

    // Import the module to test
    const { launchTranscodeTask } = require('./transcode')

    await expect(
      launchTranscodeTask({
        jobId: 'test-job-id',
        queue: 'test-queue'
      })
    ).rejects.toThrow(
      'MEDIA_TRANSCODER_TASK_DEFINITION environment variable is required'
    )
  })

  it('should throw an error if ECS task launch fails', async () => {
    // Mock ECSClient.send to throw an error
    const mockEcsClient = {
      send: jest.fn().mockRejectedValue(new Error('ECS task launch failed'))
    }
    jest
      .spyOn(ECSClient.prototype, 'send')
      .mockImplementation(mockEcsClient.send)

    // Import the module to test
    const { launchTranscodeTask } = require('./transcode')

    await expect(
      launchTranscodeTask({
        jobId: 'test-job-id',
        queue: 'test-queue'
      })
    ).rejects.toThrow(
      'Failed to launch transcoding task: ECS task launch failed'
    )
  })

  it('should throw an error if no tasks are returned', async () => {
    // Mock ECSClient.send to return empty tasks array
    const mockEcsClient = {
      send: jest.fn().mockResolvedValue({ tasks: [] })
    }
    jest
      .spyOn(ECSClient.prototype, 'send')
      .mockImplementation(mockEcsClient.send)

    // Import the module to test
    const { launchTranscodeTask } = require('./transcode')

    await expect(
      launchTranscodeTask({
        jobId: 'test-job-id',
        queue: 'test-queue'
      })
    ).rejects.toThrow('Failed to launch ECS task')
  })

  it('should throw an error if taskArn is undefined', async () => {
    // Mock ECSClient.send to return task with undefined taskArn
    const mockEcsClient = {
      send: jest.fn().mockResolvedValue({ tasks: [{ taskArn: undefined }] })
    }
    jest
      .spyOn(ECSClient.prototype, 'send')
      .mockImplementation(mockEcsClient.send)

    // Import the module to test
    const { launchTranscodeTask } = require('./transcode')

    await expect(
      launchTranscodeTask({
        jobId: 'test-job-id',
        queue: 'test-queue'
      })
    ).rejects.toThrow('Task ARN is undefined')
  })
})

describe('QueueEvents', () => {
  it('should create CloudflareR2 record when job is completed', async () => {
    // Import the module to test to trigger the QueueEvents.on setup
    jest.resetModules()
    require('./transcode')

    // Get the callback function registered with QueueEvents.on
    const queueEventsMock = QueueEvents.mock.instances[0]
    const onCallback = queueEventsMock.on.mock.calls[0][1]

    // Create a mock job
    const mockJob = {
      data: {
        publicUrl: 'https://example.com/output.mp4',
        contentType: 'video/mp4',
        outputSize: 2000
      }
    }

    // Call the callback
    await onCallback(mockJob)

    // Verify Prisma create was called with correct parameters
    expect(prismaMock.cloudflareR2.create).toHaveBeenCalledWith({
      data: {
        publicUrl: 'https://example.com/output.mp4',
        contentType: 'video/mp4',
        size: 2000
      }
    })
  })

  it('should handle job with undefined outputSize', async () => {
    // Import the module to test to trigger the QueueEvents.on setup
    jest.resetModules()
    require('./transcode')

    // Get the callback function registered with QueueEvents.on
    const queueEventsMock = QueueEvents.mock.instances[0]
    const onCallback = queueEventsMock.on.mock.calls[0][1]

    // Create a mock job without outputSize
    const mockJob = {
      data: {
        publicUrl: 'https://example.com/output.mp4',
        contentType: 'video/mp4'
        // outputSize is undefined
      }
    }

    // Call the callback
    await onCallback(mockJob)

    // Verify Prisma create was called with correct parameters
    expect(prismaMock.cloudflareR2.create).toHaveBeenCalledWith({
      data: {
        publicUrl: 'https://example.com/output.mp4',
        contentType: 'video/mp4',
        size: 0
      }
    })
  })
})

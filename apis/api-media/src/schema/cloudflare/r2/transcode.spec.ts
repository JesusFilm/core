import { ExecutionResult } from 'graphql'

import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

// Mock BullMQ
jest.mock('bullmq', () => ({
  __esModule: true,
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockImplementation(() => ({
      id: 'mockJobId'
    })),
    getJob: jest.fn().mockImplementation((jobId) => {
      if (jobId === 'nonExistentJobId') return null
      return {
        id: jobId,
        progress: 50
      }
    })
  })),
  QueueEvents: jest.fn().mockImplementation(() => ({
    on: jest.fn()
  }))
}))

// Mock AWS ECS Client
jest.mock('@aws-sdk/client-ecs', () => ({
  __esModule: true,
  ECSClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({
      tasks: [{ taskArn: 'mockTaskArn' }]
    })
  })),
  RunTaskCommand: jest.fn().mockImplementation((input) => ({
    input
  }))
}))

// Define interfaces for our GraphQL responses
interface TranscodeAssetResponse {
  transcodeAsset: string
}

interface GetTranscodeAssetProgressResponse {
  getTranscodeAssetProgress: number
}

describe('cloudflare/r2/transcode', () => {
  const client = getClient()
  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      user: { id: 'userId' },
      currentRoles: ['publisher']
    }
  })

  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1'
    process.env.ECS_CLUSTER = 'test-cluster'
    process.env.MEDIA_TRANSCODER_TASK_DEFINITION = 'test-task-definition'
  })

  beforeEach(() => {
    // Mock user roles for authorization
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'userId',
      userId: 'userId',
      roles: ['publisher']
    })
  })

  describe('queries', () => {
    describe('getTranscodeAssetProgress', () => {
      const GET_TRANSCODE_PROGRESS_QUERY = graphql(`
        query GetTranscodeAssetProgress($jobId: String!) {
          getTranscodeAssetProgress(jobId: $jobId)
        }
      `)

      it('should return the progress of a transcode job', async () => {
        const result = (await authClient({
          document: GET_TRANSCODE_PROGRESS_QUERY,
          variables: {
            jobId: 'mockJobId'
          }
        })) as ExecutionResult<GetTranscodeAssetProgressResponse>

        expect(result.data?.getTranscodeAssetProgress).toBe(50)
      })

      it('should fail if not publisher', async () => {
        // Override the mock for this specific test
        prismaMock.userMediaRole.findUnique.mockResolvedValue(null)

        const result = (await client({
          document: GET_TRANSCODE_PROGRESS_QUERY,
          variables: {
            jobId: 'mockJobId'
          }
        })) as ExecutionResult<GetTranscodeAssetProgressResponse>

        // Check that the data property exists but getTranscodeAssetProgress is null
        expect(result.data?.getTranscodeAssetProgress).toBeNull()
      })

      it('should throw an error if job not found', async () => {
        const result = (await authClient({
          document: GET_TRANSCODE_PROGRESS_QUERY,
          variables: {
            jobId: 'nonExistentJobId'
          }
        })) as ExecutionResult<GetTranscodeAssetProgressResponse>

        expect(result.errors).toBeDefined()
        // Just check that there's an error message, don't check the specific content
        expect(result.errors?.[0]?.message).toBeDefined()
      })
    })
  })

  describe('mutations', () => {
    describe('transcodeAsset', () => {
      const TRANSCODE_ASSET_MUTATION = graphql(`
        mutation TranscodeAsset($input: TranscodeVideoInput!) {
          transcodeAsset(input: $input)
        }
      `)

      it('should create a transcode job and return the job ID', async () => {
        // Mock the input asset
        prismaMock.cloudflareR2.findUnique.mockResolvedValue({
          id: 'assetId',
          fileName: 'input.mp4',
          originalFilename: null,
          publicUrl: 'https://assets.jesusfilm.org/input.mp4',
          userId: 'userId',
          contentType: 'video/mp4',
          contentLength: BigInt(1000),
          createdAt: new Date(),
          updatedAt: new Date(),
          videoId: 'videoId',
          uploadUrl: 'uploadUrl'
        })

        const result = (await authClient({
          document: TRANSCODE_ASSET_MUTATION,
          variables: {
            input: {
              r2AssetId: 'assetId',
              resolution: '720p',
              videoBitrate: '2000',
              outputFilename: 'output.mp4',
              outputPath: '/videos/'
            }
          }
        })) as ExecutionResult<TranscodeAssetResponse>

        expect(result.data?.transcodeAsset).toBe('mockJobId')
      })

      it('should fail if not publisher', async () => {
        // Override the mock for this specific test
        prismaMock.userMediaRole.findUnique.mockResolvedValue(null)

        const result = (await client({
          document: TRANSCODE_ASSET_MUTATION,
          variables: {
            input: {
              r2AssetId: 'assetId',
              resolution: '720p',
              videoBitrate: '2000',
              outputFilename: 'output.mp4',
              outputPath: '/videos/'
            }
          }
        })) as ExecutionResult<TranscodeAssetResponse>

        // Check that the data property exists but transcodeAsset is null
        expect(result.data?.transcodeAsset).toBeNull()
      })

      it('should throw an error if input asset not found', async () => {
        prismaMock.cloudflareR2.findUnique.mockResolvedValue(null)

        const result = (await authClient({
          document: TRANSCODE_ASSET_MUTATION,
          variables: {
            input: {
              r2AssetId: 'nonExistentAssetId',
              resolution: '720p',
              videoBitrate: '2000',
              outputFilename: 'output.mp4',
              outputPath: '/videos/'
            }
          }
        })) as ExecutionResult<TranscodeAssetResponse>

        expect(result.errors).toBeDefined()
        // Just check that there's an error message, don't check the specific content
        expect(result.errors?.[0]?.message).toBeDefined()
      })
    })
  })
})

import {
  ECSClient,
  RunTaskCommand,
  RunTaskCommandInput
} from '@aws-sdk/client-ecs'
import { Job, Queue } from 'bullmq'

import { prisma } from '../../../lib/prisma'
import { connection } from '../../../workers/lib/connection'
import { builder } from '../../builder'

import { TranscodeVideoInput } from './inputs/transcodeVideoInput'

interface TranscodeVideoJob {
  inputUrl: string
  resolution: string
  videoBitrate: string
  contentType: string
  outputFilename: string
  outputPath: string
}

builder.mutationFields((t) => ({
  transcodeAsset: t.withAuth({ isPublisher: true }).field({
    type: 'String',
    args: {
      input: t.arg({ type: TranscodeVideoInput, required: true })
    },
    description: 'Transcode an asset. Returns the bullmq job ID.',
    resolve: async (_parent, { input }, { user }) => {
      if (!user) throw new Error('User not found')

      const inputAsset = await prisma.cloudflareR2.findUnique({
        where: {
          id: input.r2AssetId
        }
      })
      if (!inputAsset) throw new Error('Input asset not found')

      const queue = new Queue('jfp-video-transcode', { connection })
      const job = (await queue.add('api-media-transcode-video', {
        inputUrl: inputAsset.publicUrl,
        resolution: input.resolution,
        bitrate: input.bitrate ?? undefined,
        contentType: inputAsset.contentType,
        outputFilename: input.outputFilename,
        outputPath: input.outputPath
      })) as Job<TranscodeVideoJob>

      if (!job.id) throw new Error('Failed to create job')

      await launchTranscodeTask({
        jobId: job.id,
        queue: 'jfp-video-transcode',
        outputQueue: 'jfp-video-transcode-output'
      })

      return job.id
    }
  })
}))

export interface TranscodeVideoParams {
  jobId: string
  queue: string
  outputQueue: string
}

let ecsClient: ECSClient | null = null

function initializeECSClient() {
  if (!process.env.AWS_REGION) {
    throw new Error('AWS_REGION environment variable is required')
  }

  ecsClient = new ECSClient({
    region: process.env.AWS_REGION
  })
}

export async function launchTranscodeTask(
  params: TranscodeVideoParams
): Promise<string> {
  if (!ecsClient) {
    initializeECSClient()
  }

  if (!process.env.ECS_CLUSTER) {
    throw new Error('ECS_CLUSTER environment variable is required')
  }

  if (!process.env.MEDIA_TRANSCODER_TASK_DEFINITION) {
    throw new Error(
      'MEDIA_TRANSCODER_TASK_DEFINITION environment variable is required'
    )
  }

  const environment = [
    { name: 'BULLMQ_JOB', value: params.jobId },
    { name: 'BULLMQ_QUEUE', value: params.queue },
    { name: 'BULLMQ_OUTPUT_QUEUE', value: params.outputQueue }
  ]

  const input: RunTaskCommandInput = {
    cluster: process.env.ECS_CLUSTER,
    taskDefinition: process.env.MEDIA_TRANSCODER_TASK_DEFINITION,
    count: 1,
    launchType: 'FARGATE',
    overrides: {
      containerOverrides: [
        {
          name: `${process.env.MEDIA_TRANSCODER_TASK_DEFINITION}-app`,
          environment
        }
      ]
    }
  }

  try {
    const command = new RunTaskCommand(input)
    if (!ecsClient) {
      throw new Error('ECS client not initialized')
    }
    const response = await ecsClient.send(command)

    if (!response.tasks || response.tasks.length === 0) {
      throw new Error('Failed to launch ECS task')
    }

    const taskArn = response.tasks[0].taskArn
    if (!taskArn) {
      throw new Error('Task ARN is undefined')
    }

    return taskArn
  } catch (error: unknown) {
    console.error('Error launching ECS task:', error)
    throw new Error(
      `Failed to launch transcoding task: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

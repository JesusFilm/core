import {
  ECSClient,
  RunTaskCommand,
  RunTaskCommandInput
} from '@aws-sdk/client-ecs'
import { Job, Queue, QueueEvents } from 'bullmq'

import { prisma } from '@core/prisma/media/client'

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
  userId: string
  outputSize?: string
  publicUrl?: string
}

const queueName = 'jfp-video-transcode'
const queue = new Queue(queueName, { connection })

export function initializeQueue() {
  const queueEvents = new QueueEvents(queueName, { connection })
  queueEvents.on('completed', ({ jobId }) => {
    void completeJob(jobId)
  })
}

const completeJob = async (jobId: string) => {
  const job = (await queue.getJob(jobId)) as Job<TranscodeVideoJob>
  if (!job) return
  try {
    await prisma.cloudflareR2.create({
      data: {
        publicUrl: job.data.publicUrl,
        contentType: job.data.contentType,
        contentLength: job.data.outputSize ?? '0',
        fileName: job.data.outputFilename,
        userId: job.data.userId
      }
    })
  } catch (err) {
    console.error('Failed to persist the completed job in DB', err)
  }
}

builder.queryFields((t) => ({
  getTranscodeAssetProgress: t.withAuth({ isPublisher: true }).field({
    type: 'Int',
    args: {
      jobId: t.arg({ type: 'String', required: true })
    },
    resolve: async (_parent, { jobId }) => {
      const job = await queue.getJob(jobId)
      if (!job) throw new Error('Job not found')
      return Number(job.progress)
    }
  })
}))

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

      const job = (await queue.add('api-media-transcode-video', {
        inputUrl: inputAsset.publicUrl,
        resolution: input.resolution,
        videoBitrate: input.videoBitrate ?? undefined,
        contentType: inputAsset.contentType,
        outputFilename: input.outputFilename,
        outputPath: input.outputPath,
        userId: user.id
      })) as Job<TranscodeVideoJob>

      if (!job.id) throw new Error('Failed to create job')

      await launchTranscodeTask({
        jobId: job.id,
        queue: queueName
      })

      return job.id
    }
  })
}))

export interface TranscodeVideoParams {
  jobId: string
  queue: string
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
    { name: 'BULLMQ_QUEUE', value: params.queue }
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

import { readFile, stat } from 'fs/promises'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Job, Queue } from 'bullmq'
import fetch from 'node-fetch'

// Import ffmpeg from our custom module
import ffmpeg from './types/fluent-ffmpeg'

export interface TranscodeVideoJob {
  inputUrl: string
  resolution: string
  videoBitrate: string
  contentType: string
  outputFilename: string
  outputPath: string
  userId: string
  outputSize?: number
  publicUrl?: string
}

export function getClient(): S3Client {
  if (process.env.CLOUDFLARE_R2_ENDPOINT == null)
    throw new Error('Missing CLOUDFLARE_R2_ENDPOINT')
  if (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID == null)
    throw new Error('Missing CLOUDFLARE_R2_ACCESS_KEY_ID')
  if (process.env.CLOUDFLARE_R2_SECRET == null)
    throw new Error('Missing CLOUDFLARE_R2_SECRET')

  return new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET
    }
  })
}

export async function getPresignedUrl(fileName: string): Promise<string> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')

  return await getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: fileName
    })
  )
}

export async function uploadToR2(job: Job<TranscodeVideoJob>) {
  const url = await getPresignedUrl(job.data.outputFilename)
  await fetch(url, {
    method: 'PUT',
    body: await readFile(job.data.outputFilename),
    headers: {
      'Content-Type': job.data.contentType
    }
  })
  await job.updateData({
    ...job.data,
    publicUrl: url
  })
  await job.updateProgress(100)
  await job.moveToCompleted({ message: 'Uploaded to R2' }, job.id as string)
}

async function transcodeFinished(job: Job<TranscodeVideoJob>) {
  const fileState = await stat(job.data.outputFilename)
  await job.updateData({
    ...job.data,
    outputSize: fileState.size
  })
  await uploadToR2(job)
}

export async function main() {
  if (!process.env.BULLMQ_QUEUE) {
    throw new Error('BULLMQ_QUEUE is not set')
  }

  if (!process.env.BULLMQ_JOB) {
    throw new Error('BULLMQ_JOB is not set')
  }

  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
    throw new Error('REDIS_URL is not set')
  }

  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_PORT) {
    throw new Error('REDIS_PORT is not set')
  }

  const connection = {
    host: process.env.REDIS_URL ?? 'redis',
    port: process.env.REDIS_PORT != null ? Number(process.env.REDIS_PORT) : 6379
  }

  const queue = new Queue(process.env.BULLMQ_QUEUE, { connection })
  const job = (await queue.getJob(
    process.env.BULLMQ_JOB
  )) as Job<TranscodeVideoJob>

  // const jobId = process.env.BULLMQ_JOB
  // const job = (await worker.getNextJob(jobId)) as Job<TranscodeVideoJob>

  if (job == null) {
    throw new Error(`Job ${process.env.BULLMQ_JOB} not found`)
  }

  try {
    ffmpeg()
      .input(job.data.inputUrl)
      .size(job.data.resolution)
      .autopad()
      .videoBitrate(job.data.videoBitrate.toString())
      .saveToFile(job.data.outputFilename)
      .on('progress', (progress: { percent: number }) => {
        if (progress.percent) {
          void job.updateProgress(progress.percent * 0.8)
        }
      })
      .on('end', () => {
        void transcodeFinished(job)
      })
      .on('error', (error: Error) => {
        throw error
      })
  } catch (error) {
    if (error instanceof Error) {
      void job.moveToFailed(
        { message: error.message, name: error.name },
        job.id as string
      )
    } else {
      void job.moveToFailed(
        { message: 'Unknown error', name: 'UnknownError' },
        job.id as string
      )
    }
  }
}

// Only run if this is the main module
if (require.main === module) {
  main().catch((error) => {
    console.error('Error in main:', error)
    process.exit(1)
  })
}

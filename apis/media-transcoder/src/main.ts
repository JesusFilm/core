import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import ffmpeg from './types/fluent-ffmpeg'
import { Job, Queue, Worker } from 'bullmq'
import { readFile } from 'fs/promises'
import fetch from 'node-fetch'

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

export async function uploadToR2(jobId: string, job: Job, queue: Queue) {
  if (!process.env.BULLMQ_OUTPUT_QUEUE) {
    throw new Error('BULLMQ_OUTPUT_QUEUE is not set')
  }
  const url = await getPresignedUrl(job.data.r2Filename)
  await fetch(url, {
    method: 'PUT',
    body: await readFile(job.data.outputFile),
    headers: {
      'Content-Type': job.data.contentType
    }
  })
  job.updateProgress(100)
  job.moveToCompleted({ message: 'Uploaded to R2' }, jobId)
  queue.add(process.env.BULLMQ_OUTPUT_QUEUE, job.data)
}

export async function main() {
  if (!process.env.BULLMQ_QUEUE) {
    throw new Error('BULLMQ_QUEUE is not set')
  }

  if (!process.env.BULLMQ_OUTPUT_QUEUE) {
    throw new Error('BULLMQ_OUTPUT_QUEUE is not set')
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

  const outputQueue = new Queue(process.env.BULLMQ_OUTPUT_QUEUE, { connection })

  const worker = new Worker(process.env.BULLMQ_QUEUE)

  const jobId = process.env.BULLMQ_JOB
  const job = await worker.getNextJob(jobId)

  if (job == null) {
    throw new Error(`Job ${process.env.BULLMQ_JOB} not found`)
  }

  try {
    ffmpeg()
      .input(job.data.inputUrl)
      .size(job.data.size)
      .autopad()
      .videoBitrate(job.data.videoBitrate)
      .saveToFile(job.data.outputFile)
      .on('progress', (progress: { percent: number }) => {
        if (progress.percent) {
          job.updateProgress(progress.percent * 0.8)
        }
      })
      .on('end', async () => {
        await uploadToR2(jobId, job, outputQueue)
      })
      .on('error', (error: Error) => {
        throw error
      })
  } catch (error) {
    if (error instanceof Error) {
      job.moveToFailed({ message: error.message, name: error.name }, jobId)
    } else {
      job.moveToFailed(
        { message: 'Unknown error', name: 'UnknownError' },
        jobId
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

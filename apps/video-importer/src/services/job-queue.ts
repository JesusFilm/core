import { Queue } from 'bullmq'

const connection = {
  host: process.env.REDIS_URL ?? 'redis',
  port: process.env.REDIS_PORT != null ? Number(process.env.REDIS_PORT) : 6379
}

const videoUploadsQueue = new Queue('api-media-process-video-uploads', {
  connection
})

export interface VideoUploadJobData {
  videoId: string
  edition: string
  languageId: string
  version: number
  muxVideoId: string
  metadata: {
    durationMs: number
    duration: number
    width: number
    height: number
  }
  originalFilename: string
}

export async function triggerVideoUploadJob(
  data: VideoUploadJobData
): Promise<void> {
  try {
    const job = await videoUploadsQueue.add('process-video-upload', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: 10,
      removeOnFail: 50
    })

    console.log(`Queued job ${job.id} for ${data.originalFilename}`)
  } catch (error) {
    console.error(`Failed to queue job for ${data.originalFilename}:`, error)
    throw error
  }
}

export async function closeJobQueue(): Promise<void> {
  await videoUploadsQueue.close()
}

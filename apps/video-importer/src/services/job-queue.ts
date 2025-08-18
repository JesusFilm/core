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
    const job = await videoUploadsQueue.add('process-video-upload', data)
    console.log(`[Job Queue] Triggered video upload job with ID: ${job.id}`)
    console.log(`   - Video ID: ${data.videoId}`)
    console.log(`   - Mux Video ID: ${data.muxVideoId}`)
    console.log(`   - Edition: ${data.edition}`)
    console.log(`   - Language: ${data.languageId}`)
  } catch (error) {
    console.error('[Job Queue] Failed to trigger video upload job:', error)
    throw error
  }
}

export async function closeJobQueue(): Promise<void> {
  await videoUploadsQueue.close()
}

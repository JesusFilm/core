import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

export interface TranscodeVideoJobData {
  videoId?: string
  inputUrl: string
  format: string
  resolution: string
  bitrate?: number
  outputBucket?: string
  outputKey?: string
  taskArn?: string
}

export async function service(logger?: Logger): Promise<void> {
  // This service function is a placeholder for any background processing
  // The actual transcoding is handled by the media-transcoder project
  // when jobs are added to the queue
  logger?.info('Video transcode service running')
}

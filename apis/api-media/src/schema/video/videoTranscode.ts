import { Job, Queue } from 'bullmq'

import { prisma } from '../../lib/prisma'
import { connection } from '../../workers/lib/connection'
import { addTranscodeVideoJob } from '../../workers/videoTranscode/queue'
import { builder } from '../builder'

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
  transcodeVideo: t.withAuth({ isPublisher: true }).field({
    type: 'String',
    args: {
      input: t.arg({ type: TranscodeVideoInput, required: true })
    },
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

      try {
        // Add a job to the BullMQ queue
        await addTranscodeVideoJob({
          inputUrl: input.inputUrl,
          resolution: input.resolution,
          bitrate: input.bitrate ?? undefined,
          outputBucket: input.outputBucket ?? undefined,
          outputKey: input.outputKey ?? undefined
        })

        return job.id
      } catch (error) {
        console.error('Error in transcodeVideo mutation:', error)
        throw new Error(
          `Failed to queue transcoding task: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }
  })
}))

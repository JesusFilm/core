import { Job, Queue } from 'bullmq'

import { connection } from '../../lib/redisConnection'
import { builder } from '../builder'

const queueName = 'jfp-ai-translate-journey'
const queue = new Queue(queueName, { connection })

interface AiTranslateJourneyJob {
  userId: string
  journeyId: string
  name: string
  textLanguageId: string
  videoLanguageId: string
}

builder.mutationField('aiTranslateJourneyCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).fieldWithInput({
    input: {
      journeyId: t.input.id({ required: true }),
      name: t.input.string({ required: true }),
      textLanguageId: t.input.id({ required: true }),
      videoLanguageId: t.input.id({ required: false })
    },
    type: 'ID',
    nullable: false,
    resolve: async (_root, { input }, { user }) => {
      const job = (await queue.add('api-media-transcode-video', {
        userId: user.id,
        journeyId: input.journeyId,
        name: input.name,
        textLanguageId: input.textLanguageId,
        videoLanguageId: input.videoLanguageId
      })) as Job<AiTranslateJourneyJob>

      if (!job.id) throw new Error('Failed to create job')
      return job.id
    }
  })
)

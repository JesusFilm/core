import { Job, Queue } from 'bullmq'

import { connection } from '../../lib/redisConnection'
import { builder } from '../builder'

const queueName = 'jfp-ai-translate-journey'
const queue = new Queue(queueName, { connection })

interface AiTranslateJourneyJob {
  userId: string
  journeyId: string
  name: string
  textLanguage: string
  videoLanguage: string
}

builder.mutationField('aiTranslateJourneyCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).fieldWithInput({
    input: {
      journeyId: t.arg({ type: 'ID', required: true }),
      name: t.arg({ type: 'String', required: true }),
      textLanguage: t.arg({ type: 'String', required: true }),
      videoLanguage: t.arg({ type: 'String', required: false })
    },
    type: 'ID',
    nullable: false,
    resolve: async (_root, { input }, { user }) => {
      const job = (await queue.add('api-media-transcode-video', {
        userId: user.id,
        journeyId: input.journeyId,
        name: input.name,
        textLanguage: input.textLanguage,
        videoLanguage: input.videoLanguage
      })) as Job<AiTranslateJourneyJob>

      if (!job.id) throw new Error('Failed to create job')
      return job.id
    }
  })
)

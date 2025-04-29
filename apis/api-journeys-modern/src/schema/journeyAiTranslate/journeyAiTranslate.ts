import { Job, Queue } from 'bullmq'

import { connection } from '../../lib/redisConnection'
import { queueName } from '../../workers/journeyAiTranslate'
import { AiTranslateJourneyJob } from '../../workers/journeyAiTranslate/service'
import { builder } from '../builder'

const queue = new Queue(queueName, { connection })

builder.mutationField('journeyAiTranslateCreate', (t) =>
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
      const job = (await queue.add(
        `${user.id}-${input.journeyId}`,
        {
          userId: user.id,
          journeyId: input.journeyId,
          name: input.name,
          textLanguageId: input.textLanguageId,
          videoLanguageId: input.videoLanguageId
        },
        {
          jobId: `${user.id}-${input.journeyId}`,
          removeOnComplete: {
            age: 1000 * 60 * 60 * 24 * 5 // 5 days
          },
          removeOnFail: {
            age: 1000 * 60 * 60 * 24 * 5 // 5 days
          }
        }
      )) as Job<AiTranslateJourneyJob>

      if (!job.id) throw new Error('Failed to create job')
      return job.id
    }
  })
)

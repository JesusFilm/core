import { Job } from 'bullmq'

import { AiTranslateJourneyJob } from '../../workers/userQueue/service'
import { builder } from '../builder'

class JourneyAiTranslateStatusShape {
  id: string
  status: string
  progress: number
  constructor(id: string, status: string, progress: number) {
    this.id = id
    this.status = status
    this.progress = progress
  }
}

const JourneyAiTranslateStatusRef = builder
  .objectRef<JourneyAiTranslateStatusShape>('JourneyAiTranslateStatus')
  .implement({
    // subscribe: (subscriptions, root, context) => {
    //   if (context.type !== 'authenticated') return
    //   subscriptions.register(`${context.user.id}`)
    // }
    // fields: (t) => ({
    //   id: t.exposeString('id', { nullable: false }),
    //   status: t.exposeString('status', { nullable: false }),
    //   progress: t.exposeInt('progress', { nullable: false })
    // })
  })

const JourneyAiTranslateStatus = builder.objectType(
  JourneyAiTranslateStatusRef,
  {
    name: 'JourneyAiTranslateStatus',
    // subscribe: (subscriptions, root, context) => {
    //   if (context.type !== 'authenticated') return
    //   subscriptions.register(`${context.user.id}`)
    // },
    fields: (t) => ({
      id: t.exposeString('id', { nullable: false }),
      status: t.exposeString('status', { nullable: false }),
      progress: t.exposeInt('progress', { nullable: false })
    })
  }
)

// Define query field
builder.queryField('journeyAiTranslateStatus', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    args: {
      journeyId: t.arg({ type: 'ID', required: true })
    },
    // smartSubscription: true,
    type: JourneyAiTranslateStatus,
    nullable: true,
    subscribe: (subscriptions, root, args, context) => {
      if (context.type !== 'authenticated') return
      subscriptions.register(`${context.user.id}`)
    },
    resolve: async (_root, { journeyId }, { queue }) => {
      const job = (await queue?.getJob(journeyId)) as Job<AiTranslateJourneyJob>
      if (!job) return null
      let status = 'pending'
      if (await job.isActive()) status = 'processing'
      if (await job.isCompleted()) status = 'completed'
      if (await job.isFailed()) status = 'failed'
      return {
        id: journeyId,
        status,
        progress: ((await job.progress) as number) ?? 0
      }
    }
  })
)

// Create a dummy subscription to satisfy the schema requirement
// builder.subscriptionField('dummySubscription', (t) =>
//   t.field({
//     type: 'Boolean',
//     nullable: true,
//     subscribe: () => {
//       // Create an empty async generator that never yields any values
//       return (async function* () {
//         // Never yield anything
//       })()
//     },
//     resolve: () => null
//   })
// )

builder.mutationFields((t) => ({
  journeyAiTranslateCreate: t
    .withAuth({ isAuthenticated: true })
    .fieldWithInput({
      input: {
        journeyId: t.input.id({ required: true }),
        name: t.input.string({ required: true }),
        textLanguageId: t.input.id({ required: true }),
        videoLanguageId: t.input.id({ required: false })
      },
      type: 'ID',
      nullable: false,
      resolve: async (_root, { input }, { user, queue }) => {
        const job = (await queue?.add(
          `${input.journeyId}`,
          {
            userId: user.id,
            type: 'journeyAiTranslate',
            journeyId: input.journeyId,
            name: input.name,
            textLanguageId: input.textLanguageId,
            videoLanguageId: input.videoLanguageId
          },
          {
            jobId: `${user.id}-${input.journeyId}`,
            removeOnComplete: {
              age: 1000 * 60 * 60 * 24 * 5, // 5 days
              count: 100
            },
            removeOnFail: {
              age: 1000 * 60 * 60 * 24 * 5, // 5 days
              count: 100
            }
          }
        )) as Job<AiTranslateJourneyJob>

        if (!job.id) throw new Error('Failed to create job')
        return job.id
      }
    })
}))

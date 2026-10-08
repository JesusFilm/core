import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { env } from '../../env'
import { logger } from '../../logger'
import { builder } from '../builder'

import { getGatewayModel } from './gateway'
import { choosePhotos } from './images/choosePhotos'
import {
  searchUnsplashPhotos,
  triggerUnsplashDownload
} from './images/unsplash'
import { journeySchema } from './journeySchema'
import type { BuilderEvent } from './pipeline/events'
import { runPipeline } from './pipeline/pipeline'
import { planSchema } from './stages/stageSchemas'

/** The guide and planner read this many recent messages word for word. */
const RECENT_MESSAGE_COUNT = 10

const JourneyAiBuilderEventRef = builder.objectRef<BuilderEvent>(
  'JourneyAiBuilderEvent'
)

builder.objectType(JourneyAiBuilderEventRef, {
  description:
    'One event of an AI journey builder run. Prototype (ENG-3768): fields are loose on purpose; read `type` first.',
  fields: (t) => ({
    type: t.string({
      nullable: false,
      description: 'progress, message, content, summary, error or done',
      resolve: (event) => event.type
    }),
    stage: t.string({
      nullable: true,
      description: 'For progress: guide, planner, builder, repair or images',
      resolve: (event) => (event.type === 'progress' ? event.stage : null)
    }),
    status: t.string({
      nullable: true,
      description: 'For progress: started, streaming or done',
      resolve: (event) => (event.type === 'progress' ? event.status : null)
    }),
    text: t.string({
      nullable: true,
      resolve: (event) =>
        'text' in event && event.text != null ? event.text : null
    }),
    kind: t.string({
      nullable: true,
      description: 'For content: journey or plan',
      resolve: (event) => (event.type === 'content' ? event.kind : null)
    }),
    payload: t.field({
      type: 'Json',
      nullable: true,
      description: 'For content: the journey (with preview blocks) or the plan',
      resolve: (event) => (event.type === 'content' ? event.payload : null)
    })
  })
})

const JourneyAiBuilderMessageInput = builder.inputType(
  'JourneyAiBuilderMessageInput',
  {
    fields: (t) => ({
      role: t.string({ required: true, description: 'user or assistant' }),
      content: t.string({ required: true })
    })
  }
)

const JourneyAiBuilderInput = builder.inputType('JourneyAiBuilderInput', {
  fields: (t) => ({
    message: t.string({
      required: true,
      description: "The user's new message"
    }),
    summary: t.string({
      required: false,
      description: 'Running summary of older messages'
    }),
    messages: t.field({
      type: [JourneyAiBuilderMessageInput],
      required: false,
      description: 'Recent messages before this one, oldest first'
    }),
    toSummarise: t.field({
      type: [JourneyAiBuilderMessageInput],
      required: false,
      description:
        'Messages that fell out of the recent window and should be folded into the summary'
    }),
    journey: t.field({
      type: 'Json',
      required: false,
      description: 'The current journey JSON, if there is one'
    }),
    pendingPlan: t.field({
      type: 'Json',
      required: false,
      description: 'A plan waiting for confirmation, if there is one'
    })
  })
})

const messagesSchema = z
  .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
  .nullish()
  .transform((messages) => messages ?? [])

builder.subscriptionField('journeyAiBuilderSubscription', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyAiBuilderEventRef,
    nullable: false,
    description:
      'Runs one AI journey builder chat message. Prototype (ENG-3768): stateless, the browser keeps the chat and journey.',
    args: {
      input: t.arg({ type: JourneyAiBuilderInput, required: true })
    },
    subscribe: async function* (_root, { input }) {
      const model = getGatewayModel()
      if (model == null)
        throw new GraphQLError('The AI journey builder is not set up', {
          extensions: { code: 'NOT_IMPLEMENTED' }
        })

      // The browser stores the journey and plan, so check them like any input.
      const journey = journeySchema.nullish().safeParse(input.journey)
      const pendingPlan = planSchema.nullish().safeParse(input.pendingPlan)
      const messages = messagesSchema.safeParse(input.messages)
      const toSummarise = messagesSchema.safeParse(input.toSummarise)
      if (
        !journey.success ||
        !pendingPlan.success ||
        !messages.success ||
        !toSummarise.success
      )
        throw new GraphQLError('Invalid builder input', {
          extensions: { code: 'BAD_USER_INPUT' }
        })

      // Ends the model call on stop, a closed tab or the whole-run time limit.
      const stop = new AbortController()
      const abortSignal = AbortSignal.any([
        stop.signal,
        AbortSignal.timeout(env.AI_JOURNEY_BUILDER_TIMEOUT_MS)
      ])

      try {
        yield* runPipeline(
          {
            message: input.message,
            summary: input.summary ?? '',
            messages: messages.data.slice(-RECENT_MESSAGE_COUNT),
            toSummarise: toSummarise.data,
            journey: journey.data ?? null,
            pendingPlan: pendingPlan.data ?? null
          },
          {
            model,
            abortSignal,
            images: {
              searchPhotos: searchUnsplashPhotos,
              choosePhotos: async (needs) =>
                await choosePhotos(model, abortSignal, needs),
              triggerDownload: triggerUnsplashDownload
            }
          }
        )
      } catch (error) {
        if (stop.signal.aborted) return
        const timedOut = abortSignal.aborted
        logger.error({ error, timedOut }, 'AI journey builder run failed')
        yield {
          type: 'error' as const,
          text: timedOut
            ? 'Sorry, that took too long. Your journey is unchanged.'
            : 'Sorry, something went wrong. Your journey is unchanged.'
        }
        yield { type: 'done' as const }
      } finally {
        // Runs when the client unsubscribes too: the generator is returned early.
        stop.abort()
      }
    },
    resolve: (event) => event
  })
)

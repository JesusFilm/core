import { google } from '@ai-sdk/google'
import { generateObject, ModelMessage, NoObjectGeneratedError } from 'ai'
import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { prisma } from '@core/prisma/journeys/client'
import { hardenPrompt } from '@core/shared/ai/prompts'
import {
  JourneySimple,
  journeySimpleSchemaUpdate
} from '@core/shared/ai/journeySimpleTypes'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { getSimpleJourney } from '../journey/simple/getSimpleJourney'

import { buildSystemPrompt } from './prompts'

// Return type for the mutation
interface JourneyAiEditResult {
  reply: string
  proposedJourney: JourneySimple | null
}

const JourneyAiEditResultRef =
  builder.objectRef<JourneyAiEditResult>('JourneyAiEditResult')

builder.objectType(JourneyAiEditResultRef, {
  fields: (t) => ({
    reply: t.string({
      resolve: (parent) => parent.reply
    }),
    proposedJourney: t.field({
      type: 'Json',
      nullable: true,
      resolve: (parent) => parent.proposedJourney
    })
  })
})

const MessageHistoryItem = builder.inputType('MessageHistoryItem', {
  fields: (t) => ({
    role: t.string({ required: true }),
    content: t.string({ required: true })
  })
})

// Input type
const JourneyAiEditInput = builder.inputType('JourneyAiEditInput', {
  fields: (t) => ({
    journeyId: t.id({ required: true }),
    message: t.string({ required: true }),
    history: t.field({ type: [MessageHistoryItem], required: false }),
    selectedCardId: t.string({ required: false })
  })
})

// Discriminated union schema for AI response
const journeyAiEditSchema = z.discriminatedUnion('hasChanges', [
  z.object({
    hasChanges: z.literal(true),
    reply: z
      .string()
      .describe('Plain language explanation of what was changed and why'),
    journey: journeySimpleSchemaUpdate.describe(
      'Full updated journey with all changes applied'
    )
  }),
  z.object({
    hasChanges: z.literal(false),
    reply: z.string().describe('Plain language suggestions or answer')
  })
])

builder.mutationField('journeyAiEdit', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyAiEditResultRef,
    nullable: false,
    args: {
      input: t.arg({
        type: JourneyAiEditInput,
        required: true
      })
    },
    resolve: async (_parent, { input }, context) => {
      // 1. Validate message length
      if (input.message.length > 2000) {
        throw new GraphQLError(
          'Message exceeds maximum length of 2000 characters',
          {
            extensions: { code: 'BAD_USER_INPUT' }
          }
        )
      }

      // 2. Fetch journey and validate ACL
      const dbJourney = await prisma.journey.findUnique({
        where: { id: input.journeyId },
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })

      if (!dbJourney) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!ability(Action.Update, subject('Journey', dbJourney), context.user)) {
        throw new GraphQLError(
          'user does not have permission to update journey',
          { extensions: { code: 'FORBIDDEN' } }
        )
      }

      // 3. Fetch simple journey representation
      let currentJourney: JourneySimple
      try {
        currentJourney = await getSimpleJourney(input.journeyId)
      } catch (error) {
        if (error instanceof GraphQLError) throw error
        console.error('journeyAiEdit: failed to load journey', error)
        throw new GraphQLError('Failed to load journey data. Please try again.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
      }

      // 4. Prune history to last 10 turns
      const prunedHistory = (input.history ?? [])
        .slice(-10)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      // 5. Harden user message
      const hardenedMessage = hardenPrompt(input.message)

      // 6. Build system prompt
      const systemPrompt = buildSystemPrompt(
        currentJourney,
        input.selectedCardId ?? undefined
      )

      // 7. Call generateObject
      let aiResult: z.infer<typeof journeyAiEditSchema>
      try {
        const { object } = await generateObject({
          model: google('gemini-2.5-flash-preview-04-17'),
          system: systemPrompt,
          messages: [
            ...prunedHistory,
            { role: 'user', content: hardenedMessage }
          ] as ModelMessage[],
          schema: journeyAiEditSchema,
          maxRetries: 2,
          abortSignal: AbortSignal.timeout(30_000)
        })
        aiResult = object
      } catch (error) {
        if (error instanceof NoObjectGeneratedError) {
          console.error('journeyAiEdit: NoObjectGeneratedError', {
            journeyId: input.journeyId,
            rawOutput: error.text
          })
          return {
            reply:
              'Something went wrong generating a response. Please try rephrasing your request.',
            proposedJourney: null
          }
        }
        console.error('journeyAiEdit: generateObject error', error)
        return {
          reply: 'Something went wrong. Please try again.',
          proposedJourney: null
        }
      }

      // 8. Audit log
      console.log('journeyAiEdit audit', {
        userId: context.user.id,
        journeyId: input.journeyId,
        timestamp: new Date().toISOString(),
        hadProposal: aiResult.hasChanges
      })

      // 9. Return result
      if (aiResult.hasChanges) {
        return {
          reply: aiResult.reply,
          proposedJourney: aiResult.journey as JourneySimple
        }
      }

      return {
        reply: aiResult.reply,
        proposedJourney: null
      }
    }
  })
)

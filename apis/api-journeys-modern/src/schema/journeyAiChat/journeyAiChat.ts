import { createAnthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { stepCountIs, streamText, tool } from 'ai'
import { randomUUID } from 'crypto'
import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'
import {
  planOperationArraySchema,
  type PlanOperation
} from '@core/shared/ai/agentJourneyTypes'
import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'

import { env } from '../../env'
import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { getSimpleJourney, updateSimpleJourney } from '../journey/simple'

import { executeOperation, sanitizeErrorMessage } from './executeOperation'
import { getAgentJourney } from './getAgentJourney'
import {
  deleteSnapshot,
  getSnapshot,
  saveSnapshot,
  updateSnapshotPlan
} from './snapshotStore'
import { systemPrompt } from './systemPrompt'
import { searchImagesTool } from './tools/searchImages'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HistoryMessage {
  role: string
  content: string
}

type JourneyAiChatMessageType =
  | 'text'
  | 'tool_call'
  | 'tool_result'
  | 'plan'
  | 'plan_progress'
  | 'done'
  | 'warning'
  | 'error'

interface JourneyAiChatMessage {
  type: JourneyAiChatMessageType
  text: string | null
  operations: string | null
  operationId: string | null
  status: string | null
  turnId: string | null
  journeyUpdated: boolean | null
  requiresConfirmation: boolean | null
  name: string | null
  args: string | null
  summary: string | null
  cardId: string | null
  error: string | null
  validation: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countBlocks(agentJourney: { cards: Array<{ content: unknown[] }> }): number {
  return agentJourney.cards.reduce((sum, c) => sum + c.content.length, 0)
}

function summarizeToolResult(result: unknown): string {
  if (result == null) return ''
  if (typeof result === 'string') return result.slice(0, 200)
  try {
    const json = JSON.stringify(result)
    return json.length > 200 ? json.slice(0, 200) + '...' : json
  } catch {
    return String(result)
  }
}

/** Truncate history to the last 20 messages, keeping system context */
function condenseHistory(
  history: HistoryMessage[]
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const MAX_MESSAGES = 20
  const mapped = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))

  if (mapped.length <= MAX_MESSAGES) return mapped
  return mapped.slice(mapped.length - MAX_MESSAGES)
}

/** Simple post-execution validation — checks every card has at least one nav path */
async function validateJourney(
  journeyId: string
): Promise<string | null> {
  try {
    const agentJourney = await getAgentJourney(journeyId)
    const warnings: string[] = []

    for (const card of agentJourney.cards) {
      const hasVideo = card.content.some((b) => b.type === 'video')
      if (hasVideo) continue

      const hasButton = card.content.some((b) => b.type === 'button')
      const hasPoll = card.content.some((b) => b.type === 'poll')
      const hasDefaultNext = card.defaultNextCard != null

      if (!hasButton && !hasPoll && !hasDefaultNext) {
        warnings.push(
          `Card "${card.heading ?? card.simpleId}" has no navigation path.`
        )
      }
    }

    return warnings.length > 0 ? warnings.join(' ') : null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Pothos: Message object type
// ---------------------------------------------------------------------------

const JourneyAiChatMessageRef =
  builder.objectRef<JourneyAiChatMessage>('JourneyAiChatMessage')

builder.objectType(JourneyAiChatMessageRef, {
  fields: (t) => ({
    type: t.string({ resolve: (p) => p.type }),
    text: t.string({ nullable: true, resolve: (p) => p.text }),
    operations: t.string({ nullable: true, resolve: (p) => p.operations }),
    operationId: t.string({ nullable: true, resolve: (p) => p.operationId }),
    status: t.string({ nullable: true, resolve: (p) => p.status }),
    turnId: t.string({ nullable: true, resolve: (p) => p.turnId }),
    journeyUpdated: t.boolean({
      nullable: true,
      resolve: (p) => p.journeyUpdated
    }),
    requiresConfirmation: t.boolean({
      nullable: true,
      resolve: (p) => p.requiresConfirmation
    }),
    name: t.string({ nullable: true, resolve: (p) => p.name }),
    args: t.string({ nullable: true, resolve: (p) => p.args }),
    summary: t.string({ nullable: true, resolve: (p) => p.summary }),
    cardId: t.string({ nullable: true, resolve: (p) => p.cardId }),
    error: t.string({ nullable: true, resolve: (p) => p.error }),
    validation: t.string({ nullable: true, resolve: (p) => p.validation })
  })
})

// ---------------------------------------------------------------------------
// Pothos: Input types
// ---------------------------------------------------------------------------

const HistoryMessageInput = builder.inputType('JourneyAiChatHistoryMessage', {
  fields: (t) => ({
    role: t.string({ required: true }),
    content: t.string({ required: true })
  })
})

const PreferredTierEnum = builder.enumType('JourneyAiChatPreferredTier', {
  values: ['free', 'premium'] as const
})

const JourneyAiChatInput = builder.inputType('JourneyAiChatInput', {
  fields: (t) => ({
    journeyId: t.id({ required: true }),
    message: t.string({ required: true }),
    history: t.field({
      type: [HistoryMessageInput],
      required: true
    }),
    turnId: t.string({ required: false }),
    contextCardId: t.string({ required: false }),
    preferredTier: t.field({ type: PreferredTierEnum, required: false })
  })
})

// ---------------------------------------------------------------------------
// Helper: build a message payload with all fields defaulting to null
// ---------------------------------------------------------------------------

function msg(
  overrides: Partial<JourneyAiChatMessage> & { type: JourneyAiChatMessageType }
): JourneyAiChatMessage {
  return {
    text: null,
    operations: null,
    operationId: null,
    status: null,
    turnId: null,
    journeyUpdated: null,
    requiresConfirmation: null,
    name: null,
    args: null,
    summary: null,
    cardId: null,
    error: null,
    validation: null,
    ...overrides
  }
}

// ---------------------------------------------------------------------------
// Subscription: journeyAiChatCreateSubscription
// ---------------------------------------------------------------------------

builder.subscriptionField('journeyAiChatCreateSubscription', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyAiChatMessageRef,
    nullable: false,
    args: {
      input: t.arg({ type: JourneyAiChatInput, required: true })
    },
    subscribe: async function* (_root, { input }, context) {
      // --- Auth ---
      const journey = await prisma.journey.findUnique({
        where: { id: input.journeyId },
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })

      if (journey == null) {
        throw new GraphQLError('journey not found')
      }

      if (
        !ability(Action.Update, subject('Journey', journey), context.user)
      ) {
        throw new GraphQLError(
          'user does not have permission to update journey'
        )
      }

      // --- Published journey warning ---
      if (journey.status === 'published') {
        yield msg({
          type: 'warning',
          text: 'This journey is published and live. Changes will be visible to users immediately.'
        })
      }

      // --- Abort controller ---
      const abort = new AbortController()
      // The request signal may not be present in all Yoga transports, guard it
      const requestSignal = (context as unknown as { request?: { signal?: AbortSignal } }).request?.signal
      if (requestSignal) {
        requestSignal.addEventListener('abort', () => abort.abort())
      }

      // --- Snapshot for undo ---
      const turnId = input.turnId ?? randomUUID()
      const snapshot = await getSimpleJourney(input.journeyId)
      await saveSnapshot(turnId, {
        snapshot,
        userId: context.user.id,
        journeyId: input.journeyId,
        plan: null
      })

      // --- Tiered model selection ---
      const preferFree = input.preferredTier === 'free'
      const anthropicKey = env.ANTHROPIC_API_KEY
      const model = (
        anthropicKey && !preferFree
          ? createAnthropic({ apiKey: anthropicKey })('claude-sonnet-4-6')
          : google('gemini-2.5-flash')
      ) as Parameters<typeof streamText>[0]['model']

      // --- System prompt with journey state ---
      const agentJourney = await getAgentJourney(input.journeyId)

      const contextCard = input.contextCardId
        ? agentJourney.cards.find((c) => c.simpleId === input.contextCardId)
        : null

      const contextSuffix = contextCard
        ? `\n\nThe user is referring to: "${contextCard.heading ?? 'Untitled'}" card (blockId: ${contextCard.blockId}) — contains ${contextCard.content.length} blocks.`
        : ''

      const fullSystemPrompt = `${preSystemPrompt}\n\n${systemPrompt}\n\n## Current Journey State\n${hardenPrompt(JSON.stringify(agentJourney))}\n\nSummary: ${agentJourney.cards.length} cards, ${countBlocks(agentJourney)} blocks.${contextSuffix}`

      // --- History ---
      const condensedHistory = condenseHistory(
        (input.history ?? []) as HistoryMessage[]
      )

      // --- Phase 1: Plan (streamText with tools) ---
      const result = streamText({
        model,
        system: fullSystemPrompt,
        messages: [
          ...condensedHistory,
          { role: 'user' as const, content: input.message }
        ],
        tools: {
          search_images: searchImagesTool,
          submit_plan: tool({
            description: 'Submit your execution plan as a list of operations.',
            inputSchema: planOperationArraySchema,
            execute: async (args: { operations: PlanOperation[] }) => args
          })
        },
        stopWhen: stepCountIs(5),
        abortSignal: abort.signal
      })

      // --- Stream events to client ---
      let plan: PlanOperation[] | null = null

      for await (const event of result.fullStream) {
        if (abort.signal.aborted) break

        switch (event.type) {
          case 'text-delta':
            yield msg({ type: 'text', text: event.text })
            break

          case 'tool-call':
            if (event.toolName === 'submit_plan') {
              plan = (event.input as { operations: PlanOperation[] }).operations
            }
            yield msg({
              type: 'tool_call',
              name: event.toolName,
              args: JSON.stringify(event.input)
            })
            break

          case 'tool-result':
            yield msg({
              type: 'tool_result',
              name: event.toolName,
              summary: summarizeToolResult(event.output)
            })
            break
        }
      }

      // --- No plan — conversational response ---
      if (plan == null) {
        yield msg({ type: 'done', journeyUpdated: false, turnId })
        return
      }

      // --- Server-derived confirmation ---
      const requiresConfirmation =
        plan.some((o) => o.tool === 'generate_journey') ||
        plan.filter((o) => o.tool === 'delete_card').length > 3

      yield msg({
        type: 'plan',
        operations: JSON.stringify(plan),
        turnId,
        requiresConfirmation
      })

      if (requiresConfirmation) {
        await updateSnapshotPlan(turnId, plan)
        yield msg({ type: 'done', journeyUpdated: false, turnId })
        return
      }

      // --- Phase 2: Server-driven execution ---
      let journeyUpdated = false

      for (const op of plan) {
        if (abort.signal.aborted) break

        yield msg({
          type: 'plan_progress',
          operationId: op.id,
          status: 'running',
          cardId: op.cardId ?? null
        })

        try {
          await executeOperation(op, input.journeyId)
          yield msg({
            type: 'plan_progress',
            operationId: op.id,
            status: 'done'
          })
          journeyUpdated = true
        } catch (err) {
          const safeMessage = sanitizeErrorMessage((err as Error).message)
          console.error('Operation failed', { operationId: op.id, error: err })

          yield msg({
            type: 'plan_progress',
            operationId: op.id,
            status: 'failed',
            error: safeMessage
          })
          yield msg({
            type: 'text',
            text: `Failed: ${safeMessage}. You can undo all changes or ask me to retry.`
          })
          break
        }
      }

      // --- Post-execution validation ---
      const validationResult = journeyUpdated
        ? await validateJourney(input.journeyId)
        : null

      yield msg({
        type: 'done',
        journeyUpdated,
        turnId,
        validation: validationResult
      })
    },
    resolve: (event) => event
  })
)

// ---------------------------------------------------------------------------
// Mutation: journeyAiChatUndo
// ---------------------------------------------------------------------------

builder.mutationField('journeyAiChatUndo', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      turnId: t.arg.string({ required: true })
    },
    resolve: async (_root, { turnId }, context) => {
      const entry = await getSnapshot(turnId)

      if (entry == null) {
        throw new GraphQLError('Undo snapshot not found or expired.')
      }

      if (entry.userId !== context.user.id) {
        throw new GraphQLError('Permission denied.')
      }

      if (entry.journeyId == null) {
        throw new GraphQLError('Invalid snapshot.')
      }

      // Verify the user still has permission on the journey
      const journey = await prisma.journey.findUnique({
        where: { id: entry.journeyId },
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })

      if (journey == null) {
        throw new GraphQLError('Journey not found.')
      }

      if (
        !ability(Action.Update, subject('Journey', journey), context.user)
      ) {
        throw new GraphQLError('Permission denied.')
      }

      await updateSimpleJourney(entry.journeyId, entry.snapshot)
      await deleteSnapshot(turnId)

      return true
    }
  })
)

// ---------------------------------------------------------------------------
// Mutation: journeyAiChatExecutePlan
// ---------------------------------------------------------------------------

builder.mutationField('journeyAiChatExecutePlan', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      turnId: t.arg.string({ required: true })
    },
    resolve: async (_root, { turnId }, context) => {
      const entry = await getSnapshot(turnId)

      if (entry == null) {
        throw new GraphQLError('Plan snapshot not found or expired.')
      }

      if (entry.userId !== context.user.id) {
        throw new GraphQLError('Permission denied.')
      }

      if (entry.plan == null || entry.plan.length === 0) {
        throw new GraphQLError('No plan to execute.')
      }

      // Verify the user still has permission
      const journey = await prisma.journey.findUnique({
        where: { id: entry.journeyId },
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })

      if (journey == null) {
        throw new GraphQLError('Journey not found.')
      }

      if (
        !ability(Action.Update, subject('Journey', journey), context.user)
      ) {
        throw new GraphQLError('Permission denied.')
      }

      // Execute all plan operations
      for (const op of entry.plan) {
        await executeOperation(op, entry.journeyId)
      }

      // Clear the plan but keep snapshot for undo
      await updateSnapshotPlan(turnId, null)

      return true
    }
  })
)

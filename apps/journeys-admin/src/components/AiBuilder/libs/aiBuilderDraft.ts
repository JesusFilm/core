import { v4 as uuidv4 } from 'uuid'

import type { BlockFields } from '../../../../__generated__/BlockFields'

/** Mirrors the server: the guide and planner read this many recent messages. */
export const RECENT_MESSAGE_COUNT = 10

export interface ChatEntry {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** plan: a plan waiting for confirmation; error: a failed run. Neither is sent back as chat history. */
  kind?: 'plan' | 'error'
  plan?: AiBuilderPlan
}

/**
 * The plan as the chat page shows it. The server owns the full shape; the
 * page only reads these fields to render it and sends the object back as is.
 */
export interface AiBuilderPlan {
  kind: 'create' | 'edit'
  title?: string
  steps?: Array<{ name: string; purpose: string }>
  changes?: Array<{ op: string; name: string; detail: string }>
  assumptions?: string[]
}

export interface AiBuilderDraft {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: ChatEntry[]
  /** Running summary of messages that fell out of the recent window. */
  summary: string
  /** How many chat-history messages the summary already covers. */
  summarisedCount: number
  /** The journey JSON, as the server sent it. The page never reads inside it. */
  journey: Record<string, unknown> | null
  blocks: BlockFields[]
  pendingPlan: AiBuilderPlan | null
  warnings: string[]
}

export type AiBuilderEvent =
  | { type: 'progress'; stage: string; status: string; text: string | null }
  | { type: 'message'; text: string }
  | { type: 'content'; kind: string; payload: unknown }
  | { type: 'summary'; text: string }
  | { type: 'error'; text: string }
  | { type: 'done' }

export interface AiBuilderRunInput {
  message: string
  summary: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  toSummarise: Array<{ role: 'user' | 'assistant'; content: string }>
  journey: Record<string, unknown> | null
  pendingPlan: AiBuilderPlan | null
}

export function createDraft(now = new Date()): AiBuilderDraft {
  return {
    id: uuidv4(),
    title: '',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    messages: [],
    summary: '',
    summarisedCount: 0,
    journey: null,
    blocks: [],
    pendingPlan: null,
    warnings: []
  }
}

export function addUserMessage(
  draft: AiBuilderDraft,
  content: string
): AiBuilderDraft {
  return {
    ...draft,
    title: draft.title === '' ? content.slice(0, 60) : draft.title,
    updatedAt: new Date().toISOString(),
    messages: [...draft.messages, { id: uuidv4(), role: 'user', content }]
  }
}

function chatHistory(draft: AiBuilderDraft): ChatEntry[] {
  return draft.messages.filter((entry) => entry.kind !== 'error')
}

/**
 * Builds the subscription input for the draft's latest user message. Returns
 * the end of the summarised range too, so a `summary` event can record it.
 */
export function buildRunInput(draft: AiBuilderDraft): {
  input: AiBuilderRunInput
  summarisedUpTo: number
} {
  const history = chatHistory(draft)
  const latest = history.at(-1)
  const earlier = history.slice(0, -1)
  const windowStart = Math.max(0, earlier.length - RECENT_MESSAGE_COUNT)
  const toText = (entry: ChatEntry): AiBuilderRunInput['messages'][number] => ({
    role: entry.role,
    content: entry.content
  })

  return {
    input: {
      message: latest?.role === 'user' ? latest.content : '',
      summary: draft.summary,
      messages: earlier.slice(windowStart).map(toText),
      toSummarise: earlier
        .slice(Math.min(draft.summarisedCount, windowStart), windowStart)
        .map(toText),
      journey: draft.journey,
      pendingPlan: draft.pendingPlan
    },
    summarisedUpTo: Math.max(draft.summarisedCount, windowStart)
  }
}

export interface RunOutcome {
  gotPlan: boolean
  gotJourney: boolean
  gotError: boolean
}

export function emptyOutcome(): RunOutcome {
  return { gotPlan: false, gotJourney: false, gotError: false }
}

interface JourneyPayload {
  journey: Record<string, unknown> & { title?: string }
  blocks: BlockFields[]
  warnings?: string[]
}

/**
 * Applies one run event to the draft. `outcome` is updated in place so the
 * caller can finish the run with `finishRun`.
 */
export function applyEvent(
  draft: AiBuilderDraft,
  event: AiBuilderEvent,
  outcome: RunOutcome,
  summarisedUpTo: number
): AiBuilderDraft {
  const updatedAt = new Date().toISOString()
  switch (event.type) {
    case 'message':
      return {
        ...draft,
        updatedAt,
        messages: [
          ...draft.messages,
          { id: uuidv4(), role: 'assistant', content: event.text }
        ]
      }
    case 'error':
      outcome.gotError = true
      return {
        ...draft,
        updatedAt,
        messages: [
          ...draft.messages,
          {
            id: uuidv4(),
            role: 'assistant',
            content: event.text,
            kind: 'error'
          }
        ]
      }
    case 'summary':
      return { ...draft, summary: event.text, summarisedCount: summarisedUpTo }
    case 'content':
      if (event.kind === 'plan') {
        outcome.gotPlan = true
        const plan = event.payload as AiBuilderPlan
        return {
          ...draft,
          updatedAt,
          pendingPlan: plan,
          messages: [
            ...draft.messages,
            {
              id: uuidv4(),
              role: 'assistant',
              content: describePlan(plan),
              kind: 'plan',
              plan
            }
          ]
        }
      }
      if (event.kind === 'journey') {
        outcome.gotJourney = true
        const payload = event.payload as JourneyPayload
        return {
          ...draft,
          updatedAt,
          title: payload.journey.title ?? draft.title,
          journey: payload.journey,
          blocks: payload.blocks,
          warnings: payload.warnings ?? [],
          pendingPlan: null
        }
      }
      // Kinds this page does not know are ignored.
      return draft
    default:
      return draft
  }
}

/**
 * A waiting plan lives for one message: a run that neither revised it nor
 * failed drops it (the user moved on). A failed run keeps it.
 */
export function finishRun(
  draft: AiBuilderDraft,
  outcome: RunOutcome
): AiBuilderDraft {
  if (outcome.gotPlan || outcome.gotError || draft.pendingPlan == null)
    return draft
  return { ...draft, pendingPlan: null }
}

/** Plain-text version of a plan, kept as the chat message content. */
export function describePlan(plan: AiBuilderPlan): string {
  const lines =
    plan.kind === 'create'
      ? (plan.steps ?? []).map(
          (step, index) => `${index + 1}. ${step.name}: ${step.purpose}`
        )
      : (plan.changes ?? []).map(
          (change) => `- ${change.op} ${change.name}: ${change.detail}`
        )
  const assumptions = (plan.assumptions ?? []).map(
    (assumption) => `Assumed: ${assumption}`
  )
  return [plan.title ?? '', ...lines, ...assumptions]
    .filter((line) => line !== '')
    .join('\n')
}

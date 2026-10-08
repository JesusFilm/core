import type { LanguageModel } from 'ai'
import type { z } from 'zod'

import { logger } from '../../../logger'
import { checkJourney } from '../checkJourney'
import { type GenerateJsonResult, generateJson } from '../generateJson'
import { type ImageDeps, resolveImages } from '../images/resolveImages'
import { type Journey, journeySchema } from '../journeySchema'
import { journeyToBlocks } from '../journeyToBlocks'
import { scopeCheck } from '../scopeCheck'
import {
  BUILDER_INSTRUCTIONS,
  type ChatMessage,
  GUIDE_INSTRUCTIONS,
  PLANNER_INSTRUCTIONS,
  SUMMARY_INSTRUCTIONS,
  type StageContext,
  builderPrompt,
  guidePrompt,
  plannerPrompt,
  repairPrompt,
  summaryPrompt
} from '../stages/prompts'
import {
  type GuideOutput,
  type Plan,
  guideOutputSchema,
  plannerOutputSchema,
  summaryOutputSchema
} from '../stages/stageSchemas'

import type { BuilderEvent, Stage } from './events'

export interface PipelineInput extends StageContext {
  message: string
  /** Messages that fell out of the last-10 window and should join the summary. */
  toSummarise: ChatMessage[]
}

export interface PipelineDeps {
  model: LanguageModel
  abortSignal: AbortSignal
  images: ImageDeps
  /** Defaults to `generateJson`; injectable for tests. */
  generate?: typeof generateJson
}

/** A plan is big, and waits for the user's confirmation, if it creates a journey or touches 3+ cards. */
export const BIG_PLAN_CARD_COUNT = 3

export function isBigPlan(plan: Plan): boolean {
  if (plan.kind === 'create') return true
  const cards = new Set(plan.changes.map((change) => change.step))
  return cards.size >= BIG_PLAN_CARD_COUNT
}

const STREAM_PROGRESS_INTERVAL_MS = 1000

/**
 * Runs one chat message through guide → planner → builder (ENG-3767
 * "Pipeline design") and yields events for the chat page. Stateless: the
 * browser sends the chat, summary, journey and any waiting plan each time.
 */
export async function* runPipeline(
  input: PipelineInput,
  deps: PipelineDeps
): AsyncGenerator<BuilderEvent> {
  const generate = deps.generate ?? generateJson
  const context: StageContext = {
    summary: input.summary,
    messages: input.messages,
    journey: input.journey,
    pendingPlan: input.pendingPlan
  }

  function call<T>(
    stage: Stage,
    instructions: string,
    prompt: string,
    schema: z.ZodType<T>
  ): AsyncGenerator<BuilderEvent, GenerateJsonResult<T>> {
    return withStreamProgress(stage, (onDelta) =>
      generate({
        model: deps.model,
        abortSignal: deps.abortSignal,
        instructions,
        prompt,
        schema,
        onDelta
      })
    )
  }

  // Guide and planner outputs are small, so a bad one is simply retried once.
  async function* callWithRetry<T>(
    stage: Stage,
    instructions: string,
    prompt: string,
    schema: z.ZodType<T>
  ): AsyncGenerator<BuilderEvent, T | null> {
    yield { type: 'progress', stage, status: 'started' }
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = yield* call(stage, instructions, prompt, schema)
      if (result.ok) {
        yield { type: 'progress', stage, status: 'done' }
        return result.value
      }
    }
    return null
  }

  const guide: GuideOutput | null = yield* callWithRetry(
    'guide',
    GUIDE_INSTRUCTIONS,
    guidePrompt(context, input.message),
    guideOutputSchema
  )
  if (guide == null) {
    yield {
      type: 'error',
      text: "Sorry, I couldn't understand that. Please try again."
    }
    yield { type: 'done' }
    return
  }

  let plan: Plan | null = null
  switch (guide.route) {
    case 'reply':
    case 'unsupported':
      yield { type: 'message', text: guide.reply }
      break
    case 'ask':
      yield {
        type: 'message',
        text: [guide.reply, ...(guide.questions ?? [])].join('\n')
      }
      break
    case 'build':
      if (input.pendingPlan == null) {
        yield {
          type: 'message',
          text: "There's no plan waiting. Tell me what you'd like to build."
        }
        break
      }
      plan = input.pendingPlan
      break
    case 'change': {
      yield { type: 'message', text: guide.reply }
      const kind = input.journey == null ? 'create' : (guide.kind ?? 'edit')
      const planner = yield* callWithRetry(
        'planner',
        PLANNER_INSTRUCTIONS,
        plannerPrompt(
          context,
          // The gateway's schema hold makes Qwen write optional strings as
          // "" rather than leave them out, so a blank brief means no brief.
          guide.brief?.trim() || input.message,
          input.message,
          kind
        ),
        plannerOutputSchema
      )
      if (planner == null) {
        yield { type: 'error', text: "Sorry, I couldn't plan that change." }
        break
      }
      if (planner.plan == null) {
        yield {
          type: 'message',
          text: planner.question?.trim() || 'Could you tell me a bit more?'
        }
        break
      }
      if (isBigPlan(planner.plan)) {
        yield { type: 'content', kind: 'plan', payload: planner.plan }
        yield { type: 'message', text: "Here's the plan. Shall I build it?" }
        break
      }
      plan = planner.plan
      break
    }
  }

  if (plan != null) yield* build(plan)

  if (input.toSummarise.length > 0) {
    const summary = await generate({
      model: deps.model,
      abortSignal: deps.abortSignal,
      instructions: SUMMARY_INSTRUCTIONS,
      prompt: summaryPrompt(input.summary, input.toSummarise),
      schema: summaryOutputSchema
    })
    if (summary.ok) yield { type: 'summary', text: summary.value.summary }
  }

  yield { type: 'done' }

  async function* build(plan: Plan): AsyncGenerator<BuilderEvent> {
    yield { type: 'progress', stage: 'builder', status: 'started' }
    const first = yield* call(
      'builder',
      BUILDER_INSTRUCTIONS,
      builderPrompt(context, plan),
      journeySchema
    )
    let checked = checkOutput(first)

    if (checked.errors.length > 0) {
      logBuildFailure('builder', first, checked.errors)
      yield { type: 'progress', stage: 'repair', status: 'started' }
      const second = yield* call(
        'repair',
        BUILDER_INSTRUCTIONS,
        repairPrompt(context, plan, first.text, checked.errors),
        journeySchema
      )
      checked = checkOutput(second)
      if (checked.errors.length > 0)
        logBuildFailure('repair', second, checked.errors)
    }
    if (checked.journey == null || checked.errors.length > 0) {
      yield {
        type: 'error',
        text: "Sorry, I couldn't build a valid journey. Your journey is unchanged."
      }
      return
    }
    yield { type: 'progress', stage: 'builder', status: 'done' }

    const journey = checked.journey
    yield { type: 'progress', stage: 'images', status: 'started' }
    const imageWarnings = await resolveImages(
      journey,
      input.journey,
      deps.images
    )
    yield { type: 'progress', stage: 'images', status: 'done' }

    const outOfScope =
      plan.kind === 'edit' && input.journey != null
        ? scopeCheck(input.journey, journey, plan.keep)
        : []

    yield {
      type: 'content',
      kind: 'journey',
      payload: {
        journey,
        blocks: journeyToBlocks(journey),
        warnings: [...checked.warnings, ...imageWarnings],
        outOfScope
      }
    }
    if (outOfScope.length > 0)
      yield {
        type: 'message',
        text: `I also changed ${outOfScope.map((name) => `\`${name}\``).join(', ')}.`
      }
  }
}

function logBuildFailure(
  stage: 'builder' | 'repair',
  result: GenerateJsonResult<Journey>,
  errors: string[]
): void {
  logger.warn(
    {
      stage,
      errors,
      outputLength: result.text.length,
      outputEnd: result.text.slice(-300)
    },
    'AI journey builder produced an invalid journey'
  )
}

function checkOutput(result: GenerateJsonResult<Journey>): {
  journey: Journey | null
  errors: string[]
  warnings: string[]
} {
  if (!result.ok) return { journey: null, errors: [result.error], warnings: [] }
  const { errors, warnings } = checkJourney(result.value)
  return { journey: result.value, errors, warnings }
}

/**
 * Runs a streamed call and yields a throttled `streaming` progress event while
 * it runs. Besides showing life in the chat page, the events keep the SSE
 * connection busy past the load balancer's 60s idle cut-off.
 */
async function* withStreamProgress<T>(
  stage: Stage,
  run: (onDelta: (delta: string) => void) => Promise<T>
): AsyncGenerator<BuilderEvent, T> {
  let characters = 0
  const promise = run((delta) => {
    characters += delta.length
  })
  let finished = false
  const settled = promise.then(
    () => {
      finished = true
    },
    () => {
      finished = true
    }
  )

  let reported = 0
  while (!finished) {
    const tick = delay(STREAM_PROGRESS_INTERVAL_MS)
    await Promise.race([settled, tick.promise])
    tick.cancel()
    if (!finished && characters > reported) {
      reported = characters
      yield {
        type: 'progress',
        stage,
        status: 'streaming',
        text: `${characters} characters`
      }
    }
  }
  return await promise
}

function delay(ms: number): { promise: Promise<void>; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined
  const promise = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, ms)
  })
  return { promise, cancel: () => clearTimeout(timer) }
}

import type { LanguageModel } from 'ai'
import { ZodError, type z } from 'zod'

import { logger } from '../../../logger'
import { checkJourney } from '../checkJourney'
import { type GenerateJsonResult, generateJson } from '../generateJson'
import { type ImageDeps, resolveImages } from '../images/resolveImages'
import { type Journey, journeyInputSchema } from '../journeySchema'
import { journeyToBlocks } from '../journeyToBlocks'
import { resolveLibraryVideos } from '../libraryVideos/resolveLibraryVideos'
import { restoreKeptSteps, scopeCheck } from '../scopeCheck'
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
import { checkPlanScope, checkStepStructure } from './planScope'

export interface PipelineInput extends StageContext {
  message: string
  /** Messages that fell out of the last-10 window and should join the summary. */
  toSummarise: ChatMessage[]
}

export interface PipelineDeps {
  model: LanguageModel
  abortSignal: AbortSignal
  images: ImageDeps
  userId?: string
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

/** A changed card must never be restored from the planner's conflicting keep list. */
function preparePlan(plan: Plan, journey: Journey | null): Plan {
  if (plan.kind !== 'edit' || journey == null) return plan
  const owners = new Map<string, string>()
  for (const step of journey.steps) {
    owners.set(step.name, step.name)
    owners.set(step.card.name, step.name)
    for (const item of step.card.content) {
      owners.set(item.name, step.name)
      if (item.type === 'poll' || item.type === 'multiselect')
        item.options.forEach((option) => owners.set(option.name, step.name))
      if (item.type === 'video')
        item.triggers?.forEach((trigger) => owners.set(trigger.name, step.name))
    }
  }
  const changes = plan.changes.map((change) => ({
    ...change,
    step: owners.get(change.step) ?? owners.get(change.name) ?? change.step
  }))
  const changedSteps = new Set(changes.map((change) => change.step))
  return {
    ...plan,
    changes,
    keep: journey.steps
      .filter((step) => !changedSteps.has(step.name))
      .map((step) => step.name)
  }
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
    schema: z.ZodType<T>,
    validate?: (value: T) => string[]
  ): AsyncGenerator<BuilderEvent, T | null> {
    yield { type: 'progress', stage, status: 'started' }
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = yield* call(stage, instructions, prompt, schema)
      const errors = result.ok
        ? (validate?.(result.value) ?? [])
        : [result.error]
      if (result.ok && errors.length === 0) {
        yield { type: 'progress', stage, status: 'done' }
        return result.value
      }
      if (errors.length > 0)
        prompt += `\n\nCorrect the previous response:\n${errors.join('\n')}`
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
  // "Build" with nothing waiting is usually an answer to a question we asked
  // (e.g. the planner's). Plan from it rather than dead-ending the chat.
  const route =
    guide.route === 'build' && input.pendingPlan == null
      ? 'change'
      : guide.route

  switch (route) {
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
      plan = input.pendingPlan
      break
    case 'change': {
      yield { type: 'message', text: guide.reply }
      const kind = input.journey == null ? 'create' : (guide.kind ?? 'edit')
      const allowStepChanges = guide.allowStepChanges ?? false
      function scopePlan(plan: Plan): Plan {
        return preparePlan(
          plan.kind === 'edit' ? { ...plan, allowStepChanges } : plan,
          input.journey
        )
      }
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
        plannerOutputSchema,
        (output) =>
          output.plan == null
            ? []
            : checkPlanScope(scopePlan(output.plan), input.journey)
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
      const preparedPlan = scopePlan(planner.plan)
      if (isBigPlan(preparedPlan)) {
        yield { type: 'content', kind: 'plan', payload: preparedPlan }
        yield { type: 'message', text: "Here's the plan. Shall I build it?" }
        break
      }
      plan = preparedPlan
      break
    }
  }

  if (plan != null) yield* build(plan)

  if (input.toSummarise.length > 0) {
    // Optional housekeeping: if it fails, the browser keeps the old summary
    // and the same messages get folded in on the next run.
    try {
      const summary = await generate({
        model: deps.model,
        abortSignal: deps.abortSignal,
        instructions: SUMMARY_INSTRUCTIONS,
        prompt: summaryPrompt(input.summary, input.toSummarise),
        schema: summaryOutputSchema
      })
      if (summary.ok) yield { type: 'summary', text: summary.value.summary }
    } catch (error) {
      if (deps.abortSignal.aborted) throw error
      logger.warn({ error }, 'AI journey builder summary failed')
    }
  }

  yield { type: 'done' }

  async function* build(plan: Plan): AsyncGenerator<BuilderEvent> {
    plan = preparePlan(plan, input.journey)
    if (checkPlanScope(plan, input.journey).length > 0) {
      yield {
        type: 'error',
        text: 'That plan changes the card structure without a request to add, remove or reorder cards. Please describe the edit again; your journey is unchanged.'
      }
      return
    }
    // The plan may abbreviate exact colors, fonts and other native settings.
    // Include the latest request even for an edit that builds immediately.
    const buildContext: StageContext = {
      ...context,
      messages: [
        ...context.messages.slice(-9),
        { role: 'user', content: input.message }
      ]
    }
    const previous = plan.kind === 'edit' ? input.journey : null
    const keep = plan.kind === 'edit' ? plan.keep : []
    // Kept steps come from the previous journey, not the model's copy of them.
    // If putting them back breaks the journey (a kept step links to a removed
    // one), the model's own version is used and scopeCheck flags the step.
    function checkOutput(result: GenerateJsonResult<Journey>): CheckedOutput {
      if (!result.ok)
        return { journey: null, errors: [result.error], warnings: [] }
      function validate(journey: Journey): CheckedOutput {
        const checked = checkJourney(journey)
        return {
          journey,
          ...checked,
          errors: [
            ...checked.errors,
            ...(previous != null && plan.kind === 'edit'
              ? checkStepStructure(previous, journey, plan)
              : [])
          ]
        }
      }
      if (previous != null) {
        const restored = restoreKeptSteps(result.value, previous, keep)
        const restoredCheck = validate(restored)
        if (restoredCheck.errors.length === 0) return restoredCheck
      }
      return validate(result.value)
    }

    yield { type: 'progress', stage: 'builder', status: 'started' }
    const first = yield* call(
      'builder',
      BUILDER_INSTRUCTIONS,
      builderPrompt(buildContext, plan),
      journeyInputSchema
    )
    let checked = checkOutput(first)

    if (checked.errors.length > 0) {
      logBuildFailure('builder', first, checked.errors)
      yield { type: 'progress', stage: 'repair', status: 'started' }
      const second = yield* call(
        'repair',
        BUILDER_INSTRUCTIONS,
        repairPrompt(buildContext, plan, first.text, checked.errors),
        journeyInputSchema
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

    // The model wrote only search and alt for each image. This copies the
    // photo across for images the previous journey already had, and finds one
    // for the rest.
    const journey = checked.journey
    yield { type: 'progress', stage: 'images', status: 'started' }
    const imageWarnings = await resolveImages(
      journey,
      input.journey,
      deps.images
    )
    yield { type: 'progress', stage: 'images', status: 'done' }

    const outOfScope =
      previous != null ? scopeCheck(previous, journey, keep) : []

    let libraryVideos: Awaited<ReturnType<typeof resolveLibraryVideos>>
    try {
      libraryVideos = await resolveLibraryVideos(
        journey,
        deps.abortSignal,
        deps.userId
      )
    } catch (error) {
      if (deps.abortSignal.aborted) throw error
      yield {
        type: 'error',
        text:
          error instanceof Error && !(error instanceof ZodError)
            ? `${error.message} Your journey is unchanged.`
            : 'The selected video or language is unavailable. Choose a different asset. Your journey is unchanged.'
      }
      return
    }

    yield {
      type: 'content',
      kind: 'journey',
      payload: {
        journey,
        blocks: journeyToBlocks(journey, libraryVideos),
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

interface CheckedOutput {
  journey: Journey | null
  errors: string[]
  warnings: string[]
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

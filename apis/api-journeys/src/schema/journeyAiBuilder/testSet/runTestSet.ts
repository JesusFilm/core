/* eslint-disable no-console -- a command-line script */
/**
 * Runs the AI journey builder test set (ENG-3768) against the real gateway
 * and records, per case: validity, whether a repair round was needed, time,
 * the guide route, and for edits which kept steps changed anyway.
 *
 * Big plans (every create, big edits) are confirmed automatically with "Yes,
 * build it", as a user would type.
 *
 * Needs the api-journeys env (AI_GATEWAY_*, and GATEWAY_URL + INTEROP_TOKEN
 * for images). From the repo root, with the env loaded, e.g.:
 *
 *   doppler run -p api-journeys -c dev -- pnpm exec tsx \
 *     --tsconfig apis/api-journeys/tsconfig.app.json -r tsconfig-paths/register \
 *     apis/api-journeys/src/schema/journeyAiBuilder/testSet/runTestSet.ts
 *
 * Options: --only create-01,edit-03   --no-images (skip Unsplash)
 *          --message "..." (run one ad-hoc create instead of the test set)
 *
 * Writes to testSet/results/<timestamp>/ (gitignored):
 * - results.json: everything, including each final journey
 * - scores.csv: one row per case with blank score and notes columns for scoring 1–5
 * - drafts.json: the results as AI Builder drafts. Paste into the chat page's
 *   localStorage key `journeys-admin:ai-builder-drafts` to look at each one in
 *   the preview.
 */
import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { env } from '../../../env'
import { getGatewayModel } from '../gateway'
import { choosePhotos } from '../images/choosePhotos'
import type { ImageDeps } from '../images/resolveImages'
import {
  searchUnsplashPhotos,
  triggerUnsplashDownload
} from '../images/unsplash'
import type { Journey } from '../journeySchema'
import {
  mediaJourney,
  shortJourney,
  typicalJourney
} from '../journeySchema/examples'
import type { BuilderEvent } from '../pipeline/events'
import { type PipelineInput, runPipeline } from '../pipeline/pipeline'
import type { ChatMessage } from '../stages/prompts'
import type { Plan } from '../stages/stageSchemas'

interface TestCase {
  id: string
  message: string
  base?: 'short' | 'typical' | 'media'
  expectRoute?: string
}

interface CaseResult {
  id: string
  kind: 'create' | 'edit'
  message: string
  /** A case with expectRoute checks the guide's route rather than a build. */
  behaviourCheck: boolean
  valid: boolean
  repaired: boolean
  confirmedPlan: boolean
  seconds: number
  routeNote: string
  outOfScope: string[]
  warnings: string[]
  errors: string[]
  replies: string[]
  /** Plans shown for confirmation, in order. */
  plans: Plan[]
  journey: Journey | null
  blocks: unknown[]
  base: Journey | null
}

// Run from the repo root.
const TEST_SET_DIR = join(
  process.cwd(),
  'apis/api-journeys/src/schema/journeyAiBuilder/testSet'
)

const BASES: Record<string, Journey> = {
  short: shortJourney,
  typical: typicalJourney,
  media: mediaJourney
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const only = valueOf(args, '--only')?.split(',')
  const withImages = !args.includes('--no-images')

  const model = getGatewayModel()
  if (model == null)
    throw new Error('AI_GATEWAY_URL / AI_GATEWAY_API_KEY are not set')

  const testSet = JSON.parse(
    readFileSync(join(TEST_SET_DIR, 'testSet.json'), 'utf8')
  ) as { creates: TestCase[]; edits: TestCase[] }
  const adHocMessage = valueOf(args, '--message')
  const cases = (
    adHocMessage != null
      ? [{ id: 'ad-hoc', message: adHocMessage, kind: 'create' as const }]
      : [
          ...testSet.creates.map((testCase) => ({
            ...testCase,
            kind: 'create' as const
          })),
          ...testSet.edits.map((testCase) => ({
            ...testCase,
            kind: 'edit' as const
          }))
        ]
  ).filter((testCase) => only == null || only.includes(testCase.id))

  const results: CaseResult[] = []
  for (const testCase of cases) {
    console.log(`▶ ${testCase.id}: ${testCase.message}`)
    const result = await runCase(testCase, model, withImages)
    results.push(result)
    console.log(
      `  ${result.valid ? '✓ valid' : '✗ invalid'}${result.repaired ? ' (repaired)' : ''} in ${result.seconds}s${result.outOfScope.length > 0 ? `, also changed ${result.outOfScope.join(', ')}` : ''}${result.routeNote !== '' ? `, ${result.routeNote}` : ''}`
    )
  }

  const outDir = join(
    TEST_SET_DIR,
    'results',
    new Date().toISOString().replace(/[:.]/g, '-')
  )
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'results.json'), JSON.stringify(results, null, 2))
  writeFileSync(join(outDir, 'scores.csv'), toCsv(results))
  writeFileSync(join(outDir, 'drafts.json'), JSON.stringify(toDrafts(results)))
  printSummary(results)
  console.log(`\nWrote ${outDir}`)
}

async function runCase(
  testCase: TestCase & { kind: 'create' | 'edit' },
  model: NonNullable<ReturnType<typeof getGatewayModel>>,
  withImages: boolean
): Promise<CaseResult> {
  const base =
    testCase.base != null ? structuredClone(BASES[testCase.base]) : null
  const started = Date.now()
  const abortSignal = AbortSignal.timeout(env.AI_JOURNEY_BUILDER_TIMEOUT_MS)
  const images: ImageDeps = withImages
    ? {
        searchPhotos: searchUnsplashPhotos,
        choosePhotos: async (needs) =>
          await choosePhotos(model, abortSignal, needs),
        triggerDownload: triggerUnsplashDownload
      }
    : {
        searchPhotos: async () => [],
        choosePhotos: async () => ({}),
        triggerDownload: async () => undefined
      }

  const result: CaseResult = {
    id: testCase.id,
    kind: testCase.kind,
    message: testCase.message,
    behaviourCheck: testCase.expectRoute != null,
    valid: false,
    repaired: false,
    confirmedPlan: false,
    seconds: 0,
    routeNote: '',
    outOfScope: [],
    warnings: [],
    errors: [],
    replies: [],
    plans: [],
    journey: null,
    blocks: [],
    base
  }

  const messages: ChatMessage[] = []
  // An object, so the plan set inside record() survives TypeScript's narrowing.
  const state: { pendingPlan: Plan | null } = { pendingPlan: null }

  async function send(message: string): Promise<void> {
    const input: PipelineInput = {
      message,
      summary: '',
      messages: [...messages],
      toSummarise: [],
      journey: base,
      pendingPlan: state.pendingPlan
    }
    messages.push({ role: 'user', content: message })
    state.pendingPlan = null
    try {
      for await (const event of runPipeline(input, {
        model,
        abortSignal,
        images
      }))
        record(event)
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error))
    }
  }

  function record(event: BuilderEvent): void {
    switch (event.type) {
      case 'progress':
        if (event.stage === 'repair') result.repaired = true
        return
      case 'message':
        result.replies.push(event.text)
        messages.push({ role: 'assistant', content: event.text })
        return
      case 'error':
        result.errors.push(event.text)
        return
      case 'content':
        if (event.kind === 'plan') {
          state.pendingPlan = event.payload as Plan
          result.plans.push(state.pendingPlan)
        }
        if (event.kind === 'journey') {
          const payload = event.payload as {
            journey: Journey
            blocks: unknown[]
            warnings: string[]
            outOfScope: string[]
          }
          result.valid = true
          result.journey = payload.journey
          result.blocks = payload.blocks
          result.warnings = payload.warnings
          result.outOfScope = payload.outOfScope
        }
        return
      default:
        return
    }
  }

  await send(testCase.message)
  if (state.pendingPlan != null) {
    result.confirmedPlan = true
    await send('Yes, build it')
  }

  result.seconds = Math.round((Date.now() - started) / 100) / 10
  if (testCase.expectRoute != null)
    result.routeNote =
      result.journey == null
        ? `expected ${testCase.expectRoute}: no journey built`
        : `expected ${testCase.expectRoute} but built a journey`
  return result
}

function printSummary(results: CaseResult[]): void {
  const builds = results.filter((result) => !result.behaviourCheck)
  const creates = builds.filter((result) => result.kind === 'create')
  const edits = builds.filter((result) => result.kind === 'edit')
  const rate = (
    list: CaseResult[],
    test: (result: CaseResult) => boolean
  ): string =>
    list.length === 0 ? 'n/a' : `${list.filter(test).length}/${list.length}`

  console.log('\nSummary')
  console.log(
    `  creates valid (after one fix): ${rate(creates, (result) => result.valid)}  (bar: ≥75%)`
  )
  console.log(
    `  edits valid: ${rate(edits, (result) => result.valid)}  (bar: ~2/3)`
  )
  console.log(
    `  edits in scope: ${rate(edits, (result) => result.valid && result.outOfScope.length === 0)}`
  )
  console.log(`  needed a repair: ${rate(builds, (result) => result.repaired)}`)
}

function toCsv(results: CaseResult[]): string {
  const header = [
    'id',
    'kind',
    'message',
    'valid',
    'repaired',
    'seconds',
    'out_of_scope',
    'route_note',
    'score_1_to_5',
    'notes'
  ]
  const rows = results.map((result) => [
    result.id,
    result.kind,
    result.message,
    String(result.valid),
    String(result.repaired),
    String(result.seconds),
    result.outOfScope.join(' '),
    result.routeNote,
    '',
    ''
  ])
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

function toDrafts(results: CaseResult[]): unknown[] {
  const now = new Date().toISOString()
  return results.map((result) => ({
    id: randomUUID(),
    title: `${result.id} ${result.journey?.title ?? '(no journey)'}`,
    createdAt: now,
    updatedAt: now,
    messages: [
      { id: randomUUID(), role: 'user', content: result.message },
      ...result.replies.map((reply) => ({
        id: randomUUID(),
        role: 'assistant',
        content: reply
      })),
      ...result.errors.map((error) => ({
        id: randomUUID(),
        role: 'assistant',
        content: error,
        kind: 'error'
      }))
    ],
    summary: '',
    summarisedCount: 0,
    journey: result.journey,
    blocks: result.blocks,
    pendingPlan: null,
    warnings: result.warnings
  }))
}

function valueOf(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag)
  return index >= 0 ? args[index + 1] : undefined
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})

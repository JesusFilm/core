import type { LanguageModel } from 'ai'
import { vi } from 'vitest'

import type { generateJson } from '../generateJson'
import type { ImageDeps } from '../images/resolveImages'
import { shortJourney } from '../journeySchema/examples'
import {
  BUILDER_INSTRUCTIONS,
  GUIDE_INSTRUCTIONS,
  PLANNER_INSTRUCTIONS,
  SUMMARY_INSTRUCTIONS
} from '../stages/prompts'
import type { Plan } from '../stages/stageSchemas'

import type { BuilderEvent } from './events'
import { type PipelineInput, isBigPlan, runPipeline } from './pipeline'

vi.mock('../../../logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn() }
}))

vi.mock('@core/shared/ai/prompts', () => ({
  hardenPrompt: (text: string) => `«${text}»`,
  preSystemPrompt: 'pre'
}))

type Reply = { ok: true; value: unknown } | { ok: false; error: string }

/**
 * A fake `generateJson` that answers by stage, in order. Each stage's queue
 * is consumed one reply per call.
 */
function fakeGenerate(replies: {
  guide?: Reply[]
  planner?: Reply[]
  builder?: Reply[]
  summary?: Reply[]
}): typeof generateJson & { prompts: Record<string, string[]> } {
  const prompts: Record<string, string[]> = {}
  const byInstructions: Record<string, keyof typeof replies> = {
    [GUIDE_INSTRUCTIONS]: 'guide',
    [PLANNER_INSTRUCTIONS]: 'planner',
    [BUILDER_INSTRUCTIONS]: 'builder',
    [SUMMARY_INSTRUCTIONS]: 'summary'
  }
  const generate = vi.fn(async ({ instructions, prompt }) => {
    const stage = byInstructions[instructions]
    ;(prompts[stage] ??= []).push(prompt)
    const reply = replies[stage]?.shift()
    if (reply == null) throw new Error(`unexpected ${stage} call`)
    return reply.ok
      ? { ok: true, value: reply.value, text: JSON.stringify(reply.value) }
      : { ok: false, error: reply.error, text: 'bad output' }
  })
  return Object.assign(generate, { prompts }) as never
}

const images: ImageDeps = {
  searchPhotos: vi.fn(async () => []),
  choosePhotos: vi.fn(async () => ({})),
  triggerDownload: vi.fn(async () => undefined)
}

function input(overrides: Partial<PipelineInput> = {}): PipelineInput {
  return {
    message: 'hello',
    summary: '',
    messages: [],
    journey: null,
    pendingPlan: null,
    toSummarise: [],
    ...overrides
  }
}

async function collect(
  pipelineInput: PipelineInput,
  generate: typeof generateJson
): Promise<BuilderEvent[]> {
  const events: BuilderEvent[] = []
  for await (const event of runPipeline(pipelineInput, {
    model: {} as LanguageModel,
    abortSignal: new AbortController().signal,
    images,
    generate
  }))
    events.push(event)
  return events
}

const editPlan: Plan = {
  kind: 'edit',
  changes: [
    {
      op: 'update',
      step: 'claims',
      name: 'claims-heading',
      detail: 'Change the heading to "Welcome"'
    }
  ],
  keep: ['welcome', 'close'],
  assumptions: []
}

const editedJourney = structuredClone(shortJourney)
editedJourney.steps[1].card.content[0] = {
  type: 'text',
  name: 'claims-heading',
  content: 'Welcome',
  style: 'heading'
}

describe('runPipeline', () => {
  it('stops at the guide for a reply', async () => {
    const generate = fakeGenerate({
      guide: [{ ok: true, value: { route: 'reply', reply: 'A poll asks…' } }]
    })

    const events = await collect(input({ message: "What's a poll?" }), generate)

    expect(events).toEqual([
      { type: 'progress', stage: 'guide', status: 'started' },
      { type: 'progress', stage: 'guide', status: 'done' },
      { type: 'message', text: 'A poll asks…' },
      { type: 'done' }
    ])
  })

  it('appends the questions for an ask', async () => {
    const generate = fakeGenerate({
      guide: [
        {
          ok: true,
          value: {
            route: 'ask',
            reply: 'Happy to help.',
            questions: ['What is it about?', 'Who is it for?']
          }
        }
      ]
    })

    const events = await collect(input(), generate)

    expect(events).toContainEqual({
      type: 'message',
      text: 'Happy to help.\nWhat is it about?\nWho is it for?'
    })
  })

  it('retries a bad guide output once, then reports an error', async () => {
    const generate = fakeGenerate({
      guide: [
        { ok: false, error: 'bad' },
        { ok: false, error: 'bad' }
      ]
    })

    const events = await collect(input(), generate)

    expect(events.slice(-2)).toEqual([
      {
        type: 'error',
        text: "Sorry, I couldn't understand that. Please try again."
      },
      { type: 'done' }
    ])
  })

  it('holds a create plan for confirmation', async () => {
    const createPlan: Plan = {
      kind: 'create',
      title: 'Easter',
      steps: [
        { name: 'welcome', purpose: 'Welcome', content: ['title'], links: [] }
      ],
      assumptions: ['Purpose is introducing the gospel']
    }
    const generate = fakeGenerate({
      guide: [
        {
          ok: true,
          value: {
            route: 'change',
            reply: 'Planning an Easter journey.',
            brief: 'An Easter journey for teens',
            kind: 'create'
          }
        }
      ],
      planner: [{ ok: true, value: { plan: createPlan } }]
    })

    const events = await collect(input(), generate)

    expect(events).toContainEqual({
      type: 'content',
      kind: 'plan',
      payload: createPlan
    })
    expect(events).toContainEqual({
      type: 'message',
      text: "Here's the plan. Shall I build it?"
    })
    expect(
      events.some(
        (event) => event.type === 'progress' && event.stage === 'builder'
      )
    ).toBe(false)
  })

  it('plans from the user message when the guide leaves the brief blank', async () => {
    const generate = fakeGenerate({
      guide: [
        {
          ok: true,
          value: {
            route: 'change',
            reply: 'Creating it.',
            brief: '',
            kind: 'create'
          }
        }
      ],
      planner: [{ ok: true, value: { question: 'What audience?' } }]
    })

    await collect(
      input({ message: 'Introduce Jesus to students in 4 cards' }),
      generate
    )

    expect(generate.prompts.planner[0]).toContain(
      'Brief (create): «Introduce Jesus to students in 4 cards»'
    )
    expect(generate.prompts.planner[0]).toContain(
      'Latest user message: «Introduce Jesus to students in 4 cards»'
    )
  })

  it('builds a small edit straight away and sends the journey with its blocks', async () => {
    const generate = fakeGenerate({
      guide: [
        {
          ok: true,
          value: {
            route: 'change',
            reply: 'Changing the heading.',
            brief: 'Change the heading on `claims` to "Welcome"',
            kind: 'edit'
          }
        }
      ],
      planner: [{ ok: true, value: { plan: editPlan } }],
      builder: [{ ok: true, value: editedJourney }]
    })

    const events = await collect(input({ journey: shortJourney }), generate)
    const content = events.find((event) => event.type === 'content')

    expect(content).toMatchObject({
      type: 'content',
      kind: 'journey',
      payload: { journey: editedJourney, outOfScope: [], warnings: [] }
    })
    expect(
      (content as { payload: { blocks: unknown[] } }).payload.blocks.length
    ).toBeGreaterThan(0)
    expect(events.at(-1)).toEqual({ type: 'done' })
  })

  it('builds the waiting plan on a build route without re-planning', async () => {
    const generate = fakeGenerate({
      guide: [{ ok: true, value: { route: 'build', reply: 'Building it.' } }],
      builder: [{ ok: true, value: editedJourney }]
    })

    const events = await collect(
      input({ journey: shortJourney, pendingPlan: editPlan }),
      generate
    )

    expect(generate.prompts.planner).toBeUndefined()
    expect(generate.prompts.builder[0]).toContain('Change the heading')
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'content', kind: 'journey' })
    )
  })

  it('plans, instead of dead-ending, when the guide says build but no plan is waiting', async () => {
    const generate = fakeGenerate({
      guide: [{ ok: true, value: { route: 'build', reply: 'Got it.' } }],
      planner: [{ ok: true, value: { question: 'Who is it for?' } }]
    })

    const events = await collect(
      input({ message: 'just acknowledge it with a thank-you card' }),
      generate
    )

    expect(generate.prompts.planner[0]).toContain(
      'Latest user message: «just acknowledge it with a thank-you card»'
    )
    expect(events).toContainEqual({ type: 'message', text: 'Who is it for?' })
  })

  it('runs one repair round with the checker errors', async () => {
    const broken = structuredClone(editedJourney)
    broken.steps[1].card.content[2] = {
      type: 'button',
      name: 'claims-next',
      label: 'Next',
      style: 'primary',
      action: { goTo: 'amen' }
    }
    const generate = fakeGenerate({
      guide: [{ ok: true, value: { route: 'build', reply: 'Building.' } }],
      builder: [
        { ok: true, value: broken },
        { ok: true, value: editedJourney }
      ]
    })

    const events = await collect(
      input({ journey: shortJourney, pendingPlan: editPlan }),
      generate
    )

    expect(generate.prompts.builder[1]).toContain("goTo `amen` doesn't exist")
    expect(events).toContainEqual({
      type: 'progress',
      stage: 'repair',
      status: 'started'
    })
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'content', kind: 'journey' })
    )
  })

  it('leaves the journey unchanged when the repair also fails', async () => {
    const generate = fakeGenerate({
      guide: [{ ok: true, value: { route: 'build', reply: 'Building.' } }],
      builder: [
        { ok: false, error: 'not JSON' },
        { ok: false, error: 'not JSON' }
      ]
    })

    const events = await collect(
      input({ journey: shortJourney, pendingPlan: editPlan }),
      generate
    )

    expect(events.some((event) => event.type === 'content')).toBe(false)
    expect(events).toContainEqual({
      type: 'error',
      text: "Sorry, I couldn't build a valid journey. Your journey is unchanged."
    })
  })

  it('flags kept steps the builder changed', async () => {
    const outOfScope = structuredClone(editedJourney)
    outOfScope.steps[0].card.theme = 'light'
    const generate = fakeGenerate({
      guide: [{ ok: true, value: { route: 'build', reply: 'Building.' } }],
      builder: [{ ok: true, value: outOfScope }]
    })

    const events = await collect(
      input({ journey: shortJourney, pendingPlan: editPlan }),
      generate
    )

    expect(events).toContainEqual({
      type: 'message',
      text: 'I also changed `welcome`.'
    })
  })

  it('folds overflow messages into the summary after the reply', async () => {
    const generate = fakeGenerate({
      guide: [{ ok: true, value: { route: 'reply', reply: 'Sure.' } }],
      summary: [{ ok: true, value: { summary: 'Teen audience.' } }]
    })

    const events = await collect(
      input({
        toSummarise: [{ role: 'user', content: 'It is for teens' }]
      }),
      generate
    )

    expect(events.slice(-2)).toEqual([
      { type: 'summary', text: 'Teen audience.' },
      { type: 'done' }
    ])
  })
})

describe('isBigPlan', () => {
  it('treats creates and edits touching 3+ cards as big', () => {
    expect(isBigPlan(editPlan)).toBe(false)
    expect(
      isBigPlan({
        ...editPlan,
        changes: ['a', 'b', 'c'].map((step) => ({
          op: 'remove' as const,
          step,
          name: step,
          detail: 'remove'
        }))
      })
    ).toBe(true)
  })
})

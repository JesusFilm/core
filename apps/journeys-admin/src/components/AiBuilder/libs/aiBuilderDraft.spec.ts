import {
  type AiBuilderDraft,
  type AiBuilderPlan,
  type ChatEntry,
  addUserMessage,
  applyEvent,
  buildRunInput,
  createDraft,
  emptyOutcome,
  finishRun
} from './aiBuilderDraft'

function entry(n: number, role: ChatEntry['role'] = 'user'): ChatEntry {
  return { id: `m${n}`, role, content: `message ${n}` }
}

function draftWith(overrides: Partial<AiBuilderDraft>): AiBuilderDraft {
  return { ...createDraft(new Date('2026-10-09T00:00:00Z')), ...overrides }
}

const plan: AiBuilderPlan = {
  kind: 'create',
  title: 'Easter',
  steps: [
    { name: 'welcome', purpose: 'Say hello' },
    { name: 'story', purpose: 'Tell the story' }
  ],
  assumptions: ['For teens']
}

describe('addUserMessage', () => {
  it('appends the message and titles an untitled draft with it', () => {
    const draft = addUserMessage(draftWith({}), 'An Easter journey')

    expect(draft.title).toBe('An Easter journey')
    expect(draft.messages).toEqual([
      expect.objectContaining({ role: 'user', content: 'An Easter journey' })
    ])
  })
})

describe('buildRunInput', () => {
  it('sends the latest message, and earlier ones as history', () => {
    const draft = draftWith({
      messages: [entry(1), entry(2, 'assistant'), entry(3)]
    })

    expect(buildRunInput(draft)).toEqual({
      input: {
        message: 'message 3',
        summary: '',
        messages: [
          { role: 'user', content: 'message 1' },
          { role: 'assistant', content: 'message 2' }
        ],
        toSummarise: [],
        journey: null,
        pendingPlan: null
      },
      summarisedUpTo: 0
    })
  })

  it('keeps the last 10 as history and sends older unsummarised ones to fold in', () => {
    const messages = Array.from({ length: 14 }, (_, n) => entry(n + 1))
    const draft = draftWith({ messages, summarisedCount: 1 })

    const { input, summarisedUpTo } = buildRunInput(draft)

    expect(input.message).toBe('message 14')
    expect(input.messages.map((message) => message.content)).toEqual(
      Array.from({ length: 10 }, (_, n) => `message ${n + 4}`)
    )
    expect(input.toSummarise.map((message) => message.content)).toEqual([
      'message 2',
      'message 3'
    ])
    expect(summarisedUpTo).toBe(3)
  })

  it('leaves error messages out of the history', () => {
    const draft = draftWith({
      messages: [
        entry(1),
        { id: 'e', role: 'assistant', content: 'failed', kind: 'error' },
        entry(2)
      ]
    })

    expect(buildRunInput(draft).input.messages).toEqual([
      { role: 'user', content: 'message 1' }
    ])
  })
})

describe('applyEvent', () => {
  it('adds assistant messages and errors to the chat', () => {
    const outcome = emptyOutcome()
    let draft = applyEvent(
      draftWith({}),
      { type: 'message', text: 'Hi' },
      outcome,
      0
    )
    draft = applyEvent(draft, { type: 'error', text: 'Failed' }, outcome, 0)

    expect(draft.messages).toEqual([
      expect.objectContaining({ role: 'assistant', content: 'Hi' }),
      expect.objectContaining({ content: 'Failed', kind: 'error' })
    ])
    expect(outcome.gotError).toBe(true)
  })

  it('stores a plan as waiting and shows it in the chat', () => {
    const outcome = emptyOutcome()
    const draft = applyEvent(
      draftWith({}),
      { type: 'content', kind: 'plan', payload: plan },
      outcome,
      0
    )

    expect(draft.pendingPlan).toEqual(plan)
    expect(draft.messages[0]).toMatchObject({
      kind: 'plan',
      content:
        'Easter\n1. welcome: Say hello\n2. story: Tell the story\nAssumed: For teens'
    })
    expect(outcome.gotPlan).toBe(true)
  })

  it('stores a journey with its blocks and clears the waiting plan', () => {
    const draft = applyEvent(
      draftWith({ pendingPlan: plan }),
      {
        type: 'content',
        kind: 'journey',
        payload: {
          journey: { title: 'Easter journey' },
          blocks: [{ __typename: 'StepBlock', id: 'welcome' }],
          warnings: ['step `story`: nothing links to it.']
        }
      },
      emptyOutcome(),
      0
    )

    expect(draft).toMatchObject({
      title: 'Easter journey',
      journey: { title: 'Easter journey' },
      blocks: [{ id: 'welcome' }],
      warnings: ['step `story`: nothing links to it.'],
      pendingPlan: null
    })
  })

  it('records the summary and how far it reaches', () => {
    const draft = applyEvent(
      draftWith({}),
      { type: 'summary', text: 'Teen audience.' },
      emptyOutcome(),
      5
    )

    expect(draft).toMatchObject({
      summary: 'Teen audience.',
      summarisedCount: 5
    })
  })

  it('ignores content kinds it does not know', () => {
    const draft = draftWith({})

    expect(
      applyEvent(
        draft,
        { type: 'content', kind: 'theme', payload: {} },
        emptyOutcome(),
        0
      )
    ).toBe(draft)
  })
})

describe('finishRun', () => {
  it('drops a waiting plan the run did not revise', () => {
    expect(
      finishRun(draftWith({ pendingPlan: plan }), emptyOutcome()).pendingPlan
    ).toBeNull()
  })

  it('keeps a waiting plan when the run failed', () => {
    expect(
      finishRun(draftWith({ pendingPlan: plan }), {
        ...emptyOutcome(),
        gotError: true
      }).pendingPlan
    ).toEqual(plan)
  })
})

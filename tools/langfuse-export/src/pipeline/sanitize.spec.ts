import { regexScrub, sanitize } from './sanitize'
import type { Conversation, ConversationTurn, SanitisedConversation } from '../types'

function turn(overrides: Partial<ConversationTurn> = {}): ConversationTurn {
  return {
    observationId: 'o1',
    traceId: 't1',
    startTime: '2026-05-19T00:00:00.000Z',
    userMessage: '',
    assistantReply: '',
    model: 'm',
    latencySeconds: 1,
    inputTokens: 1,
    outputTokens: 1,
    totalTokens: 2,
    costUsd: 0.001,
    ...overrides
  }
}

function conversation(turns: ConversationTurn[]): Conversation {
  return { sessionId: 's1', synthetic: false, tags: [], turns }
}

describe('regexScrub', () => {
  it('redacts email, intl phone, and url in one message', () => {
    const input = 'reach me at jo@example.com or +44 20 7946 0958 see https://x.io/p'
    const out = regexScrub(input)
    expect(out).toContain('[redacted-email]')
    expect(out).toContain('[redacted-phone]')
    expect(out).toContain('[redacted-url]')
    expect(out).not.toContain('jo@example.com')
    expect(out).not.toContain('7946')
  })

  it('redacts a declared name but preserves the lead-in', () => {
    expect(regexScrub('Hi, my name is Sarah and I have a question')).toBe(
      'Hi, my name is [redacted-name] and I have a question'
    )
  })

  it('redacts a national-format (leading-zero) phone number', () => {
    const out = regexScrub('call me on 021 555 1234 tomorrow')
    expect(out).toContain('[redacted-phone]')
    expect(out).not.toContain('555 1234')
  })

  it('redacts hyphen- and dot-separated phone numbers', () => {
    expect(regexScrub('+1-800-555-1234')).toContain('[redacted-phone]')
    expect(regexScrub('reach 021.555.1234')).toContain('[redacted-phone]')
  })

  it('redacts "I\'m X" and "I am X" name declarations', () => {
    expect(regexScrub("I'm John, nice to meet you")).toBe(
      "I'm [redacted-name], nice to meet you"
    )
    expect(regexScrub('I am John from work')).toContain('I am [redacted-name]')
  })

  it('redacts a declared location', () => {
    expect(regexScrub('I live in Auckland by the sea')).toBe(
      'I live in [redacted-location] by the sea'
    )
  })

  it('redacts "I\'m from X" and "I am from X" location declarations', () => {
    expect(regexScrub("I'm from Auckland originally")).toContain(
      "I'm from [redacted-location]"
    )
    expect(regexScrub('I am from Lagos')).toContain('I am from [redacted-location]')
  })

  it('redacts all matches of the same type in one message', () => {
    const out = regexScrub('a@b.com and c@d.org')
    expect(out).toBe('[redacted-email] and [redacted-email]')
  })

  it('returns text with no PII byte-identical', () => {
    const clean = 'what is the meaning of salvation?'
    expect(regexScrub(clean)).toBe(clean)
  })
})

describe('sanitize', () => {
  it('scrubs user messages but leaves assistant replies untouched', async () => {
    const result = await sanitize([
      conversation([
        turn({
          userMessage: 'email me at user@test.com',
          assistantReply: 'You can reach support at help@test.com'
        })
      ])
    ])
    expect(result[0].turns[0].userMessage).toBe('email me at [redacted-email]')
    // Assistant reply is model output, not PII — passed through verbatim.
    expect(result[0].turns[0].assistantReply).toBe(
      'You can reach support at help@test.com'
    )
  })

  it('does not call llmScrub on a default run, and calls it once per user turn when injected', async () => {
    const calls: string[] = []
    const llmScrub = async (text: string): Promise<string> => {
      calls.push(text)
      return `${text} [llm-scrubbed]`
    }

    const convs = [conversation([turn({ userMessage: 'one' }), turn({ userMessage: 'two' })])]

    const withoutLlm = await sanitize(convs)
    expect(calls).toEqual([])
    expect(withoutLlm[0].turns[0].userMessage).toBe('one')

    const withLlm = await sanitize(convs, llmScrub)
    expect(calls).toEqual(['one', 'two'])
    expect(withLlm[0].turns[0].userMessage).toContain('[llm-scrubbed]')
  })

  it('does not call llmScrub on an empty user message (saves tokens)', async () => {
    const calls: string[] = []
    const llmScrub = async (text: string): Promise<string> => {
      calls.push(text)
      return text
    }
    const result = await sanitize([conversation([turn({ userMessage: '' })])], llmScrub)
    expect(calls).toEqual([])
    expect(result[0].turns[0].userMessage).toBe('')
  })
})

// Type-level guarantee: only sanitize.ts can mint SanitisedConversation.
// `tsc -p tools/langfuse-export/tsconfig.json` enforces the @ts-expect-error;
// if a raw Conversation[] ever satisfies the sanitised signature, this fails.
function consumesSanitised(_conversations: SanitisedConversation[]): void {}
// @ts-expect-error a raw Conversation[] must not satisfy SanitisedConversation[]
consumesSanitised([] as Conversation[])

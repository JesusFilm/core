import { describe, expect, it, vi } from 'vitest'

import {
  createStubModel,
  createStubSession,
  systemPromptsSentTo,
  userPromptsSentTo
} from '@core/shared/ai/testModel'

import { translateJourneyMetadata } from './translateJourneyMetadata'

vi.mock('../../../logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn() }
}))

/**
 * The sibling `translateJourneyMetadata.spec.ts` mocks the whole `ai` module,
 * so it never exercises the SDK's own prompt validation or structured-output
 * parsing. This spec runs the real `generateText` against a stub model
 * instead, because that is where AI SDK v7 changed behaviour: `messages` may
 * no longer carry a `role: 'system'` entry — the system prompt has to be
 * passed via `instructions` — and a violation throws at runtime, not at
 * compile time.
 *
 * Asserting on what the model was called with, and on how the SDK's parse
 * failures are handled, pins the behaviour that actually matters.
 */
describe('translateJourneyMetadata prompt contract', () => {
  const titleOnlyInput = {
    sourceLanguageName: 'English',
    targetLanguageName: 'Spanish',
    journeyTitle: 'Title',
    journeyDisplayTitle: null,
    journeyDescription: null,
    seoTitle: null,
    seoDescription: null,
    cardBlocksContent: ['Card one']
  }

  it('sends the translation system prompt to the model', async () => {
    const model = createStubModel({
      text: JSON.stringify({ analysis: 'ANALYSIS', translation: 'TRANSLATED' })
    })

    await translateJourneyMetadata({
      ...titleOnlyInput,
      session: createStubSession(model)
    })

    const systemPrompts = systemPromptsSentTo(model)
    expect(systemPrompts.length).toBeGreaterThan(0)
    expect(systemPrompts[0]).toContain('professional translator')
  })

  it('tells the model the exact JSON object each call must return', async () => {
    const model = createStubModel({
      text: JSON.stringify({ analysis: 'ANALYSIS', translation: 'TRANSLATED' })
    })

    await translateJourneyMetadata({
      ...titleOnlyInput,
      session: createStubSession(model)
    })

    const [analysisPrompt, titlePrompt] = userPromptsSentTo(model)
    expect(analysisPrompt).toContain('{"analysis": "<your analysis>"}')
    expect(titlePrompt).toContain(
      '{"translation": "<the translated journey title>"}'
    )
  })

  it('recovers when the model answers a field call with bare text before JSON', async () => {
    // The production failure behind QA-578: the model returned the translated
    // title as plain text, the SDK could not parse it as the requested object,
    // and the whole translation was abandoned. A second attempt should land.
    const model = createStubModel({
      text: [
        JSON.stringify({ analysis: 'ANALYSIS' }),
        'जब गेंद खेल में हो...',
        JSON.stringify({ translation: 'जब गेंद खेल में हो...' })
      ]
    })

    const result = await translateJourneyMetadata({
      ...titleOnlyInput,
      session: createStubSession(model)
    })

    expect(result.title).toBe('जब गेंद खेल में हो...')
    expect(model.doGenerateCalls).toHaveLength(3)
  })
})

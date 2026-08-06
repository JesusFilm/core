import { describe, expect, it } from 'vitest'

import {
  createStubModel,
  createStubSession,
  systemPromptsSentTo
} from '@core/shared/ai/testModel'

import { translateJourneyMetadata } from './translateJourneyMetadata'

/**
 * The sibling `translateJourneyMetadata.spec.ts` mocks the whole `ai` module,
 * so it never exercises the SDK's own prompt validation. This spec runs the
 * real `generateText` against a stub model instead, because that validation is
 * where AI SDK v7 changed behaviour: `messages` may no longer carry a
 * `role: 'system'` entry — the system prompt has to be passed via
 * `instructions` — and a violation throws at runtime, not at compile time.
 *
 * Asserting on what the model was called with pins the behaviour that actually
 * matters: however we pass it, the model must still receive the system prompt.
 */
describe('translateJourneyMetadata prompt contract', () => {
  it('sends the translation system prompt to the model', async () => {
    const model = createStubModel({
      text: JSON.stringify({ analysis: 'ANALYSIS', translation: 'TRANSLATED' })
    })

    await translateJourneyMetadata({
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish',
      journeyTitle: 'Title',
      journeyDisplayTitle: null,
      journeyDescription: null,
      seoTitle: null,
      seoDescription: null,
      cardBlocksContent: ['Card one'],
      session: createStubSession(model)
    })

    const systemPrompts = systemPromptsSentTo(model)
    expect(systemPrompts.length).toBeGreaterThan(0)
    expect(systemPrompts[0]).toContain('professional translator')
  })
})

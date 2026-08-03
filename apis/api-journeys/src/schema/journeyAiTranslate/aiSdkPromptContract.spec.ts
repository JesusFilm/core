import { MockLanguageModelV4 } from 'ai/test'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type OpenrouterFallbackSession,
  withOpenrouterFallback
} from '@core/shared/ai/openrouterModel'

import { translateCustomizationDescription } from './translateCustomizationFields/translateCustomizationFields'
import { translateJourneyMetadata } from './translateJourneyMetadata/translateJourneyMetadata'

/**
 * Every other spec in this folder mocks the whole `ai` module, so none of them
 * exercise the SDK's own prompt validation. These tests deliberately run the
 * real `generateText` against a mock language model, because that validation is
 * where AI SDK v7 changed behaviour: `messages` may no longer carry a
 * `role: 'system'` entry — the system prompt has to be passed via
 * `instructions` — and a violation throws at runtime, not at compile time.
 *
 * Asserting on `doGenerateCalls[].prompt` pins the behaviour that actually
 * matters: however we pass it, the model must still receive the system prompt.
 */

// Only the model-resolution seam is mocked — `ai` itself stays real.
vi.mock('@core/shared/ai/openrouterModel', () => ({
  withOpenrouterFallback: vi.fn()
}))

/** A model that answers every structured-output call with `json`. */
function createModel(json: unknown): MockLanguageModelV4 {
  return new MockLanguageModelV4({
    doGenerate: async () => ({
      content: [{ type: 'text', text: JSON.stringify(json) }],
      finishReason: { unified: 'stop', raw: 'stop' },
      usage: {
        inputTokens: {
          total: 1,
          noCache: 1,
          cacheRead: undefined,
          cacheWrite: undefined
        },
        outputTokens: { total: 1, text: 1, reasoning: undefined }
      },
      warnings: []
    })
  })
}

/** Runs the operation with `model`, exactly like the real fallback session. */
function createSession(model: MockLanguageModelV4): OpenrouterFallbackSession {
  return {
    execute: (operation: (model: unknown, signal: AbortSignal) => unknown) =>
      operation(model, new AbortController().signal)
  } as unknown as OpenrouterFallbackSession
}

function systemPromptsSentToModel(model: MockLanguageModelV4): string[] {
  return model.doGenerateCalls.flatMap((call) =>
    call.prompt
      .filter((message) => message.role === 'system')
      .map((message) => String(message.content))
  )
}

describe('AI SDK prompt contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends the translation system prompt to the model', async () => {
    const model = createModel({
      analysis: 'ANALYSIS',
      translation: 'TRANSLATED'
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
      session: createSession(model)
    })

    const systemPrompts = systemPromptsSentToModel(model)
    expect(systemPrompts.length).toBeGreaterThan(0)
    expect(systemPrompts[0]).toContain('professional translator')
  })

  it('sends the customization system prompt to the model', async () => {
    const model = createModel({ translatedDescription: 'TRADUCIDO' })
    vi.mocked(withOpenrouterFallback).mockImplementation((operation) =>
      operation(model as never, new AbortController().signal)
    )

    await translateCustomizationDescription({
      description: 'A description',
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish'
    })

    const systemPrompts = systemPromptsSentToModel(model)
    expect(systemPrompts.length).toBeGreaterThan(0)
    expect(systemPrompts[0]).toContain('professional translation engine')
  })
})

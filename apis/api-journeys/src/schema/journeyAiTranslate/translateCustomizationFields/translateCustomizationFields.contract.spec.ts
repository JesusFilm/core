import { beforeEach, describe, expect, it, vi } from 'vitest'

import { withOpenrouterFallback } from '@core/shared/ai/openrouterModel'
import { createStubModel, systemPromptsSentTo } from '@core/shared/ai/testModel'

import { translateCustomizationDescription } from './translateCustomizationFields'

/**
 * The sibling `translateCustomizationFields.spec.ts` mocks the whole `ai`
 * module, so it never exercises the SDK's own prompt validation. This spec runs
 * the real `generateText` against a stub model instead, because that validation
 * is where AI SDK v7 changed behaviour: `messages` may no longer carry a
 * `role: 'system'` entry — the system prompt has to be passed via
 * `instructions` — and a violation throws at runtime, not at compile time.
 */

// Only the model-resolution seam is mocked — `ai` itself stays real.
vi.mock('@core/shared/ai/openrouterModel', () => ({
  withOpenrouterFallback: vi.fn()
}))

describe('translateCustomizationFields prompt contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends the customization system prompt to the model', async () => {
    const model = createStubModel({
      text: JSON.stringify({ translatedDescription: 'TRADUCIDO' })
    })
    vi.mocked(withOpenrouterFallback).mockImplementation((operation) =>
      operation(model as never, new AbortController().signal)
    )

    await translateCustomizationDescription({
      description: 'A description',
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish'
    })

    const systemPrompts = systemPromptsSentTo(model)
    expect(systemPrompts.length).toBeGreaterThan(0)
    expect(systemPrompts[0]).toContain('professional translation engine')
  })
})

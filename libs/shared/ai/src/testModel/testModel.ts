import { MockLanguageModelV4 } from 'ai/test'

import type { OpenrouterFallbackSession } from '../openrouterModel'

/**
 * Test-only helpers for driving the real AI SDK against a stub model.
 *
 * Specs that mock the whole `ai` module never exercise the SDK's own prompt
 * handling — validation, content-part normalisation, structured-output
 * parsing. Those are exactly where a major SDK upgrade breaks us, and they
 * break at runtime rather than at compile time. Building a `MockLanguageModelV4`
 * here keeps the SDK's provider-level result shape (which is versioned and has
 * changed between majors) in one place, so the next upgrade is one edit.
 */

interface CreateStubModelOptions {
  /** Text the model returns. Pass a JSON string for structured-output calls. */
  text: string
  /**
   * URL patterns the model accepts by media type. Real vision providers
   * declare these; without them the SDK downloads the asset itself.
   */
  supportedUrls?: Record<string, RegExp[]>
}

/** A language model that answers every call with `text`. */
export function createStubModel({
  text,
  supportedUrls = {}
}: CreateStubModelOptions): MockLanguageModelV4 {
  return new MockLanguageModelV4({
    supportedUrls,
    doGenerate: async () => ({
      content: [{ type: 'text', text }],
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

/**
 * A fallback session that always resolves to `model`, mirroring how the real
 * session hands a model and abort signal to the operation.
 */
export function createStubSession(
  model: MockLanguageModelV4
): OpenrouterFallbackSession {
  return {
    execute: (operation) =>
      operation(model as never, new AbortController().signal)
  }
}

/** The system instructions `model` was called with, one entry per call. */
export function systemPromptsSentTo(model: MockLanguageModelV4): string[] {
  return model.doGenerateCalls.flatMap((call) =>
    call.prompt
      .filter((message) => message.role === 'system')
      .map((message) => String(message.content))
  )
}

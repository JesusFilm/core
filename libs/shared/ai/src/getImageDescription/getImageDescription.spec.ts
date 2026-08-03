import { MockLanguageModelV4 } from 'ai/test'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { withOpenrouterFallback } from '../openrouterModel'

import { getImageDescription } from './getImageDescription'

/**
 * Runs the real `generateText` against a mock language model rather than
 * mocking the `ai` module, so the SDK's own prompt handling actually executes.
 * That matters because the image reaching the model is the whole point of this
 * function, and the SDK normalises the content part we hand it — a breakage
 * there surfaces as a runtime throw or a silently dropped image, never as a
 * type error.
 */

// Only the model-resolution seam is mocked — `ai` itself stays real.
vi.mock('../openrouterModel', () => ({
  withOpenrouterFallback: vi.fn()
}))

function createModel(text: string): MockLanguageModelV4 {
  return new MockLanguageModelV4({
    // Real vision providers declare the URL schemes they accept; without this
    // the SDK downloads the image itself and the test would hit the network.
    supportedUrls: { 'image/*': [/^https?:\/\//] },
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

describe('getImageDescription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends the image and prompt to the model and returns the description', async () => {
    const model = createModel('A person standing on a hill')
    vi.mocked(withOpenrouterFallback).mockImplementation((operation) =>
      operation(model as never, new AbortController().signal)
    )

    const description = await getImageDescription({
      imageUrl: 'https://example.com/image.jpg',
      prompt: 'Describe this image',
      modelNames: ['some/model']
    })

    expect(description).toBe('A person standing on a hill')

    // The SDK resolves our string `data` to a URL reference rather than
    // inlining it as base64 — the image must reach the model as a link.
    const [call] = model.doGenerateCalls
    expect(call.prompt).toHaveLength(1)
    expect(call.prompt[0].role).toBe('user')

    const content = call.prompt[0].content as unknown as Array<
      Record<string, unknown>
    >
    expect(content).toHaveLength(2)
    expect(content[0]).toMatchObject({
      type: 'text',
      text: 'Describe this image'
    })
    expect(content[1]).toMatchObject({ type: 'file', mediaType: 'image' })
    expect(String((content[1].data as { url: unknown }).url)).toBe(
      'https://example.com/image.jpg'
    )
  })

  it('throws when no model names are provided or configured', async () => {
    delete process.env.IMAGE_DESCRIPTION_AI_MODELS

    await expect(
      getImageDescription({ imageUrl: 'https://example.com/image.jpg' })
    ).rejects.toThrow('No model names provided')
  })

  it('returns null when the model call fails', async () => {
    vi.mocked(withOpenrouterFallback).mockRejectedValue(new Error('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const description = await getImageDescription({
      imageUrl: 'https://example.com/image.jpg',
      modelNames: ['some/model']
    })

    expect(description).toBeNull()
  })
})

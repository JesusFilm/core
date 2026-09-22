import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { withOpenrouterFallback } from '../openrouterModel'
import { createStubModel } from '../testModel'

import { getImageDescription } from './getImageDescription'

/**
 * Runs the real `generateText` against a stub model rather than mocking the
 * `ai` module, so the SDK's own prompt handling actually executes. That matters
 * because the image reaching the model is the whole point of this function, and
 * the SDK normalises the content part we hand it — a breakage there surfaces as
 * a runtime throw or a silently dropped image, never as a type error.
 */

// Only the model-resolution seam is mocked — `ai` itself stays real.
vi.mock('../openrouterModel', () => ({
  withOpenrouterFallback: vi.fn()
}))

const IMAGE_URL = 'https://example.com/image.jpg'

describe('getImageDescription', () => {
  const originalModels = process.env.IMAGE_DESCRIPTION_AI_MODELS

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (originalModels == null) {
      delete process.env.IMAGE_DESCRIPTION_AI_MODELS
    } else {
      process.env.IMAGE_DESCRIPTION_AI_MODELS = originalModels
    }
  })

  it('sends the image and prompt to the model and returns the description', async () => {
    const model = createStubModel({
      text: 'A person standing on a hill',
      // Real vision providers declare the URL schemes they accept; without
      // this the SDK downloads the image itself and the test hits the network.
      supportedUrls: { 'image/*': [/^https?:\/\//] }
    })
    vi.mocked(withOpenrouterFallback).mockImplementation((operation) =>
      operation(model as never, new AbortController().signal)
    )

    const description = await getImageDescription({
      imageUrl: IMAGE_URL,
      prompt: 'Describe this image',
      modelNames: ['some/model']
    })

    expect(description).toBe('A person standing on a hill')

    // The SDK resolves our string `data` to a URL reference rather than
    // inlining it as base64 — the image must reach the model as a link.
    const [call] = model.doGenerateCalls
    expect(call.prompt).toHaveLength(1)
    expect(call.prompt[0].role).toBe('user')

    const content = call.prompt[0].content as Array<{
      type: string
      text?: string
      mediaType?: string
      data?: { url?: URL }
    }>
    expect(content).toHaveLength(2)
    expect(content[0]).toMatchObject({
      type: 'text',
      text: 'Describe this image'
    })
    expect(content[1]).toMatchObject({ type: 'file', mediaType: 'image' })
    expect(String(content[1].data?.url)).toBe(IMAGE_URL)
  })

  it('throws when no model names are provided or configured', async () => {
    delete process.env.IMAGE_DESCRIPTION_AI_MODELS

    await expect(getImageDescription({ imageUrl: IMAGE_URL })).rejects.toThrow(
      'No model names provided'
    )
  })

  it('returns null when the model call fails', async () => {
    vi.mocked(withOpenrouterFallback).mockRejectedValue(new Error('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const description = await getImageDescription({
      imageUrl: IMAGE_URL,
      modelNames: ['some/model']
    })

    expect(description).toBeNull()
  })
})

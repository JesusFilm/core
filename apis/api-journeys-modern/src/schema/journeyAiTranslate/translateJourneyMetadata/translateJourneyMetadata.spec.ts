import { generateText } from 'ai'
import { type MockedFunction, vi } from 'vitest'

import type { OpenrouterFallbackSession } from '@core/shared/ai/openrouterModel'

import { translateJourneyMetadata } from './translateJourneyMetadata'

vi.mock('ai', () => ({
  Output: {
    object: vi.fn((config) => ({ type: 'object', ...config }))
  },
  generateText: vi.fn()
}))

vi.mock('@core/shared/ai/prompts', () => ({
  hardenPrompt: vi.fn((text: string) => `<hardened>${text}</hardened>`),
  preSystemPrompt: 'mocked system prompt'
}))

const mockGenerateText = generateText as MockedFunction<typeof generateText>

// A session that simply runs the operation with a placeholder model. The
// generateText mock ignores the model, so its concrete value is irrelevant.
const session = {
  execute: vi.fn((operation: (model: unknown) => Promise<unknown>) =>
    operation('mocked-model')
  )
} as unknown as OpenrouterFallbackSession

function promptOf(call: unknown): string {
  const [options] = call as [{ messages: Array<{ content: Array<{ text: string }> }> }]
  return options.messages[1].content[0].text
}

function aiResult(output: unknown): unknown {
  return {
    output,
    usage: { totalTokens: 0, inputTokens: 0, outputTokens: 0 },
    finishReason: 'stop',
    warnings: [],
    request: {},
    response: {},
    id: 'mock-id',
    createdAt: new Date()
  }
}

// Routes each AI call to a deterministic result based on the prompt, so the
// analysis call and each single-field call return predictable values.
function defaultImplementation(): void {
  mockGenerateText.mockImplementation((async (options: unknown) => {
    const text = promptOf([options])
    if (text.includes('produce only the analysis')) {
      return aiResult({ analysis: 'ANALYSIS CONTEXT' })
    }
    if (text.includes('Translate the journey title below')) {
      return aiResult({ translation: 'Título traducido' })
    }
    if (text.includes('Translate the journey description below')) {
      return aiResult({ translation: 'Descripción traducida' })
    }
    if (text.includes('Translate the SEO title below')) {
      return aiResult({ translation: 'Título SEO traducido' })
    }
    if (text.includes('Translate the SEO description below')) {
      return aiResult({ translation: 'Descripción SEO traducida' })
    }
    throw new Error(`Unexpected prompt: ${text}`)
  }) as never)
}

const baseInput = {
  sourceLanguageName: 'English',
  targetLanguageName: 'Spanish',
  journeyTitle: 'My Journey Title',
  journeyDescription: 'My journey description',
  seoTitle: 'My SEO Title',
  seoDescription: 'My SEO Description',
  cardBlocksContent: ['Card content'],
  session
}

describe('translateJourneyMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    defaultImplementation()
  })

  it('translates each metadata field into its own field value', async () => {
    const result = await translateJourneyMetadata(baseInput)

    expect(result).toEqual({
      analysis: 'ANALYSIS CONTEXT',
      title: 'Título traducido',
      description: 'Descripción traducida',
      seoTitle: 'Título SEO traducido',
      seoDescription: 'Descripción SEO traducida'
    })
  })

  it('isolates each field in its own call so title and description cannot swap', async () => {
    await translateJourneyMetadata(baseInput)

    const titleCall = mockGenerateText.mock.calls.find((call) =>
      promptOf(call).includes('Translate the journey title below')
    )
    const descriptionCall = mockGenerateText.mock.calls.find((call) =>
      promptOf(call).includes('Translate the journey description below')
    )

    expect(titleCall).toBeDefined()
    expect(descriptionCall).toBeDefined()

    // The title call only ever sees the title value, never the description —
    // so the model has nothing to swap it with (and vice versa).
    const titlePrompt = promptOf(titleCall as unknown)
    expect(titlePrompt).toContain('<hardened>My Journey Title</hardened>')
    expect(titlePrompt).not.toContain('My journey description')

    const descriptionPrompt = promptOf(descriptionCall as unknown)
    expect(descriptionPrompt).toContain(
      '<hardened>My journey description</hardened>'
    )
    expect(descriptionPrompt).not.toContain('My Journey Title')
  })

  it('reuses the analysis as context for every field translation', async () => {
    await translateJourneyMetadata(baseInput)

    const fieldCalls = mockGenerateText.mock.calls.filter(
      (call) => !promptOf(call).includes('produce only the analysis')
    )

    expect(fieldCalls).toHaveLength(4)
    for (const call of fieldCalls) {
      expect(promptOf(call)).toContain('<hardened>ANALYSIS CONTEXT</hardened>')
    }
  })

  it('returns empty strings for absent fields without making AI calls for them', async () => {
    const result = await translateJourneyMetadata({
      ...baseInput,
      journeyDescription: null,
      seoTitle: null,
      seoDescription: '   '
    })

    expect(result.title).toBe('Título traducido')
    expect(result.description).toBe('')
    expect(result.seoTitle).toBe('')
    expect(result.seoDescription).toBe('')

    // Only the analysis call and the title call should run.
    expect(mockGenerateText).toHaveBeenCalledTimes(2)
  })

  it('strips field-label prefixes and surrounding quotes from translated values', async () => {
    mockGenerateText.mockImplementation((async (options: unknown) => {
      const text = promptOf([options])
      if (text.includes('produce only the analysis')) {
        return aiResult({ analysis: 'ANALYSIS CONTEXT' })
      }
      if (text.includes('Translate the journey title below')) {
        return aiResult({ translation: 'Journey Title: "Título limpio"' })
      }
      return aiResult({ translation: 'Descripción traducida' })
    }) as never)

    const result = await translateJourneyMetadata({
      ...baseInput,
      seoTitle: null,
      seoDescription: null
    })

    expect(result.title).toBe('Título limpio')
  })
})

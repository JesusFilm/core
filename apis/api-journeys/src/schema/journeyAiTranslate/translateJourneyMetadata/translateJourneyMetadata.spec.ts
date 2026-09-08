import { generateText } from 'ai'
import { type MockedFunction, vi } from 'vitest'

import {
  AiRequestTimeoutError,
  type OpenrouterFallbackSession
} from '@core/shared/ai/openrouterModel'

import { promptOf } from '../../../../test/promptOf'
import { logger } from '../../../logger'

import {
  MAX_METADATA_ATTEMPTS,
  translateJourneyMetadata
} from './translateJourneyMetadata'

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

vi.mock('../../../logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn() }
}))

const mockGenerateText = generateText as MockedFunction<typeof generateText>

// A session that simply runs the operation with a placeholder model. The
// generateText mock ignores the model, so its concrete value is irrelevant.
const execute = vi.fn((operation: (model: unknown) => Promise<unknown>) =>
  operation('mocked-model')
)
const session = { execute } as unknown as OpenrouterFallbackSession

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
    const text = promptOf(options)
    if (text.includes('Analyze this journey')) {
      return aiResult({ analysis: 'ANALYSIS CONTEXT' })
    }
    if (text.includes('Translate the journey display title below')) {
      return aiResult({ translation: 'Título visible traducido' })
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

// Like defaultImplementation, but the title call is scripted by the test so it
// can fail on demand. Every other call succeeds.
function implementationWithTitle(onTitleCall: () => unknown): void {
  mockGenerateText.mockImplementation((async (options: unknown) => {
    const text = promptOf(options)
    if (text.includes('Analyze this journey')) {
      return aiResult({ analysis: 'ANALYSIS CONTEXT' })
    }
    if (text.includes('Translate the journey title below')) {
      return onTitleCall()
    }
    return aiResult({ translation: 'Descripción traducida' })
  }) as never)
}

function titleCallCount(): number {
  return mockGenerateText.mock.calls.filter((call) =>
    promptOf(call[0]).includes('Translate the journey title below')
  ).length
}

const baseInput = {
  sourceLanguageName: 'English',
  targetLanguageName: 'Spanish',
  journeyTitle: 'My Journey Title',
  journeyDisplayTitle: 'My Display Title',
  journeyDescription: 'My journey description',
  seoTitle: 'My SEO Title',
  seoDescription: 'My SEO Description',
  cardBlocksContent: ['Card content'],
  session
}

// Only the analysis call and the title call run for this input.
const titleOnlyInput = {
  ...baseInput,
  journeyDisplayTitle: null,
  journeyDescription: null,
  seoTitle: null,
  seoDescription: null
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
      displayTitle: 'Título visible traducido',
      description: 'Descripción traducida',
      seoTitle: 'Título SEO traducido',
      seoDescription: 'Descripción SEO traducida'
    })
  })

  it('isolates each field in its own call so title and description cannot swap', async () => {
    await translateJourneyMetadata(baseInput)

    const titleCall = mockGenerateText.mock.calls.find((call) =>
      promptOf(call[0]).includes('Translate the journey title below')
    )
    const descriptionCall = mockGenerateText.mock.calls.find((call) =>
      promptOf(call[0]).includes('Translate the journey description below')
    )

    expect(titleCall).toBeDefined()
    expect(descriptionCall).toBeDefined()

    // The title call only ever sees the title value, never the description —
    // so the model has nothing to swap it with (and vice versa).
    const titlePrompt = promptOf(titleCall?.[0])
    expect(titlePrompt).toContain('<hardened>My Journey Title</hardened>')
    expect(titlePrompt).not.toContain('My journey description')

    const descriptionPrompt = promptOf(descriptionCall?.[0])
    expect(descriptionPrompt).toContain(
      '<hardened>My journey description</hardened>'
    )
    expect(descriptionPrompt).not.toContain('My Journey Title')
  })

  it('reuses the analysis as context for every field translation', async () => {
    await translateJourneyMetadata(baseInput)

    const fieldCalls = mockGenerateText.mock.calls.filter(
      (call) => !promptOf(call[0]).includes('Analyze this journey')
    )

    expect(fieldCalls).toHaveLength(5)
    for (const call of fieldCalls) {
      expect(promptOf(call[0])).toContain(
        '<hardened>ANALYSIS CONTEXT</hardened>'
      )
    }
  })

  it('spells out the JSON object each call must return, in the schema field names', async () => {
    await translateJourneyMetadata(titleOnlyInput)

    const analysisCall = mockGenerateText.mock.calls.find((call) =>
      promptOf(call[0]).includes('Analyze this journey')
    )
    const titleCall = mockGenerateText.mock.calls.find((call) =>
      promptOf(call[0]).includes('Translate the journey title below')
    )

    // The SDK only sends the schema as request metadata, so the prompt text
    // itself has to name the field — otherwise a host that does not enforce
    // the schema returns bare text.
    expect(promptOf(analysisCall?.[0])).toContain(
      '{"analysis": "<your analysis>"}'
    )
    const titlePrompt = promptOf(titleCall?.[0])
    expect(titlePrompt).toContain(
      '{"translation": "<the translated journey title>"}'
    )
    expect(titlePrompt).toContain(
      'The "translation" value must contain only the translated text'
    )
    expect(titlePrompt).not.toContain('Return only the translated text')
  })

  it('reads the structured output inside the fallback session', async () => {
    await translateJourneyMetadata(titleOnlyInput)

    // The SDK's `output` getter throws when the model produced nothing. The
    // operation must return the output itself so that throw happens inside
    // the session (and inside the retry loop), not after it has resolved.
    const outputs = await Promise.all(
      execute.mock.results.map((result) => result.value)
    )
    expect(outputs).toEqual([
      { analysis: 'ANALYSIS CONTEXT' },
      { translation: 'Título traducido' }
    ])
  })

  it('returns empty strings for absent fields without making AI calls for them', async () => {
    const result = await translateJourneyMetadata({
      ...baseInput,
      journeyDisplayTitle: null,
      journeyDescription: null,
      seoTitle: null,
      seoDescription: '   '
    })

    expect(result.title).toBe('Título traducido')
    expect(result.displayTitle).toBe('')
    expect(result.description).toBe('')
    expect(result.seoTitle).toBe('')
    expect(result.seoDescription).toBe('')

    // Only the analysis call and the title call should run.
    expect(mockGenerateText).toHaveBeenCalledTimes(2)
  })

  it('strips field-label prefixes and surrounding quotes from translated values', async () => {
    implementationWithTitle(() =>
      aiResult({ translation: 'Journey Title: "Título limpio"' })
    )

    const result = await translateJourneyMetadata({
      ...baseInput,
      journeyDisplayTitle: null,
      seoTitle: null,
      seoDescription: null
    })

    expect(result.title).toBe('Título limpio')
  })

  describe('retries', () => {
    it('retries a call whose answer could not be parsed and uses the next answer', async () => {
      const parseError = new Error(
        'No object generated: could not parse the response.'
      )
      let attempts = 0
      implementationWithTitle(() => {
        attempts += 1
        if (attempts === 1) throw parseError
        return aiResult({ translation: 'Título traducido' })
      })

      const result = await translateJourneyMetadata(titleOnlyInput)

      expect(result.title).toBe('Título traducido')
      expect(titleCallCount()).toBe(2)
      expect(logger.warn).toHaveBeenCalledWith(
        {
          error: parseError,
          label: 'journey title',
          attempt: 1,
          maxAttempts: MAX_METADATA_ATTEMPTS
        },
        'Journey metadata AI call failed'
      )
    })

    it('retries the analysis call as well', async () => {
      let attempts = 0
      mockGenerateText.mockImplementation((async (options: unknown) => {
        const text = promptOf(options)
        if (text.includes('Analyze this journey')) {
          attempts += 1
          if (attempts === 1) throw new Error('No output generated.')
          return aiResult({ analysis: 'ANALYSIS CONTEXT' })
        }
        return aiResult({ translation: 'Título traducido' })
      }) as never)

      const result = await translateJourneyMetadata(titleOnlyInput)

      expect(result.analysis).toBe('ANALYSIS CONTEXT')
      expect(attempts).toBe(2)
    })

    it('gives up after the attempt cap and rethrows the last error', async () => {
      const parseError = new Error(
        'No object generated: could not parse the response.'
      )
      implementationWithTitle(() => {
        throw parseError
      })

      await expect(translateJourneyMetadata(titleOnlyInput)).rejects.toBe(
        parseError
      )
      expect(titleCallCount()).toBe(MAX_METADATA_ATTEMPTS)
    })

    it('does not retry a timeout, since the session has already exhausted its models', async () => {
      const timeout = new AiRequestTimeoutError(60_000)
      implementationWithTitle(() => {
        throw timeout
      })

      await expect(translateJourneyMetadata(titleOnlyInput)).rejects.toBe(
        timeout
      )
      expect(titleCallCount()).toBe(1)
      expect(logger.warn).not.toHaveBeenCalled()
    })
  })
})

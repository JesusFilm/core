import { type LanguageModel, streamText } from 'ai'
import { type MockedFunction, vi } from 'vitest'
import { z } from 'zod'

import { extractJson, generateJson, parseJson } from './generateJson'

vi.mock('ai', () => ({
  Output: { object: vi.fn((config) => ({ type: 'object', ...config })) },
  jsonSchema: vi.fn((schema) => ({ jsonSchema: schema })),
  streamText: vi.fn()
}))

const mockStreamText = streamText as MockedFunction<typeof streamText>

const schema = z.object({ route: z.enum(['reply', 'change']) })

function streamOf(chunks: string[]): ReturnType<typeof streamText> {
  return {
    textStream: (async function* () {
      yield* chunks
    })()
  } as unknown as ReturnType<typeof streamText>
}

describe('generateJson', () => {
  it('streams deltas and returns the parsed value', async () => {
    mockStreamText.mockReturnValue(streamOf(['{"route":', '"reply"}']))
    const onDelta = vi.fn()

    const result = await generateJson({
      model: {} as LanguageModel,
      abortSignal: new AbortController().signal,
      instructions: 'system',
      prompt: 'hello',
      schema,
      onDelta
    })

    expect(result).toEqual({
      ok: true,
      value: { route: 'reply' },
      text: '{"route":"reply"}'
    })
    expect(onDelta).toHaveBeenCalledTimes(2)
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        instructions: 'system',
        maxRetries: 0,
        output: expect.objectContaining({
          schema: expect.objectContaining({
            jsonSchema: expect.objectContaining({
              properties: expect.objectContaining({ route: expect.any(Object) })
            })
          })
        })
      })
    )
  })

  it('keeps unsupported regex lookarounds out of the provider schema while validating returned emails fully', async () => {
    const emailSchema = z.object({
      options: z.array(
        z.union([
          z.object({ email: z.email() }),
          z.object({ name: z.string().regex(/^[a-z-]+$/) })
        ])
      )
    })
    mockStreamText.mockReturnValue(
      streamOf(['{"options":[{"email":".person@example.com"}]}'])
    )
    const result = await generateJson({
      model: {} as LanguageModel,
      abortSignal: new AbortController().signal,
      instructions: 'system',
      prompt: 'hello',
      schema: emailSchema
    })
    const call = mockStreamText.mock.lastCall?.[0]
    const output = call?.output as unknown as {
      schema: { jsonSchema: unknown }
    }
    const providerSchema = output.schema.jsonSchema
    expect(providerSchema).toBeDefined()
    expect(JSON.stringify(providerSchema)).not.toContain('(?!')
    expect(JSON.stringify(providerSchema)).toContain('^[a-z-]+$')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('email')
  })
})

describe('generateJson errors', () => {
  it('rethrows a failed request instead of reporting an empty answer', async () => {
    const outage = new Error('HTTP 500')
    mockStreamText.mockImplementation(((options: {
      onError: (event: { error: unknown }) => void
    }) => {
      options.onError({ error: outage })
      return streamOf([])
    }) as never)

    await expect(
      generateJson({
        model: {} as LanguageModel,
        abortSignal: new AbortController().signal,
        instructions: 'system',
        prompt: 'hello',
        schema
      })
    ).rejects.toBe(outage)
  })
})

describe('parseJson', () => {
  it('reports invalid JSON', () => {
    expect(parseJson('not json', schema)).toEqual({
      ok: false,
      error: 'The output was not valid JSON.',
      text: 'not json'
    })
  })

  it('reports a shape error', () => {
    const result = parseJson('{"route":"build"}', schema)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('route')
  })
})

describe('extractJson', () => {
  it('drops a think block and code fences', () => {
    expect(extractJson('<think>hmm</think>\n```json\n{"a":1}\n```')).toBe(
      '{"a":1}'
    )
  })
})

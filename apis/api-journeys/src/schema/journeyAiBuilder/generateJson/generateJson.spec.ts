import { type LanguageModel, streamText } from 'ai'
import { type MockedFunction, vi } from 'vitest'
import { z } from 'zod'

import { extractJson, generateJson, parseJson } from './generateJson'

vi.mock('ai', () => ({
  Output: { object: vi.fn((config) => ({ type: 'object', ...config })) },
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
        output: expect.objectContaining({ schema })
      })
    )
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

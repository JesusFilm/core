import { openrouter } from '@openrouter/ai-sdk-provider'

import {
  createGeminiFallbackSession,
  getGeminiFallbackModel,
  getGeminiMaxRetries,
  getGeminiModel,
  isRateLimitError,
  withGeminiFallback
} from './geminiModel'

jest.mock('@openrouter/ai-sdk-provider', () => ({
  openrouter: Object.assign(
    jest.fn((modelId: string) => ({
      modelId,
      provider: 'openrouter'
    })),
    {
      chat: jest.fn((modelId: string) => ({
        modelId,
        provider: 'openrouter'
      }))
    }
  )
}))

const mockedOpenrouter = jest.mocked(openrouter)

describe('geminiModel', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.OPENROUTER_MODEL
    delete process.env.OPENROUTER_FALLBACK_MODEL
    delete process.env.GEMINI_MAX_RETRIES
    mockedOpenrouter.chat.mockClear()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('getGeminiModel', () => {
    it('should use google/gemma-4-26b-a4b-it via openrouter by default', () => {
      getGeminiModel()
      expect(mockedOpenrouter.chat).toHaveBeenCalledWith(
        'google/gemma-4-26b-a4b-it'
      )
    })

    it('should use OPENROUTER_MODEL env var when set', () => {
      process.env.OPENROUTER_MODEL = 'anthropic/claude-3.5-sonnet'
      getGeminiModel()
      expect(mockedOpenrouter.chat).toHaveBeenCalledWith(
        'anthropic/claude-3.5-sonnet'
      )
    })

    it('should fall back to default for empty string', () => {
      process.env.OPENROUTER_MODEL = ''
      getGeminiModel()
      expect(mockedOpenrouter.chat).toHaveBeenCalledWith(
        'google/gemma-4-26b-a4b-it'
      )
    })

    it('should fall back to default for whitespace-only string', () => {
      process.env.OPENROUTER_MODEL = '   '
      getGeminiModel()
      expect(mockedOpenrouter.chat).toHaveBeenCalledWith(
        'google/gemma-4-26b-a4b-it'
      )
    })
  })

  describe('getGeminiFallbackModel', () => {
    it('should use google/gemini-2.5-flash via openrouter by default', () => {
      getGeminiFallbackModel()
      expect(mockedOpenrouter.chat).toHaveBeenCalledWith('google/gemini-2.5-flash')
    })

    it('should use OPENROUTER_FALLBACK_MODEL env var when set', () => {
      process.env.OPENROUTER_FALLBACK_MODEL = 'google/gemini-2.0-flash'
      getGeminiFallbackModel()
      expect(mockedOpenrouter.chat).toHaveBeenCalledWith('google/gemini-2.0-flash')
    })
  })

  describe('getGeminiMaxRetries', () => {
    it('should return default when GEMINI_MAX_RETRIES is not set', () => {
      expect(getGeminiMaxRetries()).toBe(3)
    })

    it('should respect GEMINI_MAX_RETRIES env var', () => {
      process.env.GEMINI_MAX_RETRIES = '5'
      expect(getGeminiMaxRetries()).toBe(5)
    })

    it('should handle GEMINI_MAX_RETRIES=0', () => {
      process.env.GEMINI_MAX_RETRIES = '0'
      expect(getGeminiMaxRetries()).toBe(0)
    })

    it('should return default for non-numeric values', () => {
      process.env.GEMINI_MAX_RETRIES = 'abc'
      expect(getGeminiMaxRetries()).toBe(3)
    })

    it('should return default for empty string', () => {
      process.env.GEMINI_MAX_RETRIES = ''
      expect(getGeminiMaxRetries()).toBe(3)
    })

    it('should return default for negative values', () => {
      process.env.GEMINI_MAX_RETRIES = '-1'
      expect(getGeminiMaxRetries()).toBe(3)
    })

    it('should return default for fractional values', () => {
      process.env.GEMINI_MAX_RETRIES = '1.5'
      expect(getGeminiMaxRetries()).toBe(3)
    })

    it('should return default for Infinity', () => {
      process.env.GEMINI_MAX_RETRIES = 'Infinity'
      expect(getGeminiMaxRetries()).toBe(3)
    })
  })

  describe('isRateLimitError', () => {
    it('should return true for direct 429 error', () => {
      const error = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      expect(isRateLimitError(error)).toBe(true)
    })

    it('should return true for RetryError with 429 lastError', () => {
      const error = Object.assign(new Error('retry failed'), {
        lastError: { statusCode: 429 }
      })
      expect(isRateLimitError(error)).toBe(true)
    })

    it('should return false for non-429 error', () => {
      const error = Object.assign(new Error('server error'), {
        statusCode: 500
      })
      expect(isRateLimitError(error)).toBe(false)
    })

    it('should return false for non-Error values', () => {
      expect(isRateLimitError('string')).toBe(false)
      expect(isRateLimitError(null)).toBe(false)
    })
  })

  describe('withGeminiFallback', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return result on success with primary model', async () => {
      const operation = jest.fn().mockResolvedValue('ok')
      const result = await withGeminiFallback(operation)
      expect(result).toBe('ok')
      expect(operation).toHaveBeenCalledTimes(1)
      expect(operation).toHaveBeenCalledWith(
        expect.objectContaining({ modelId: 'google/gemma-4-26b-a4b-it' })
      )
    })

    it('should retry primary model with exponential backoff on 429', async () => {
      process.env.GEMINI_MAX_RETRIES = '2'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const operation = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('retry-ok')

      const promise = withGeminiFallback(operation)
      // Attempt 1 delay: 1000ms (2^0 * BACKOFF_BASE_MS)
      await jest.advanceTimersByTimeAsync(1000)
      // Attempt 2 delay: 2000ms (2^1 * BACKOFF_BASE_MS)
      await jest.advanceTimersByTimeAsync(2000)
      const result = await promise

      expect(result).toBe('retry-ok')
      expect(operation).toHaveBeenCalledTimes(3)
      for (const call of operation.mock.calls) {
        expect(call[0]).toEqual(
          expect.objectContaining({ modelId: 'google/gemma-4-26b-a4b-it' })
        )
      }
    })

    it('should fall back to secondary model after exhausting primary retries', async () => {
      process.env.GEMINI_MAX_RETRIES = '1'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const operation = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('fallback-ok')

      const promise = withGeminiFallback(operation)
      // Only one retry delay: 1000ms (2^0 * BACKOFF_BASE_MS)
      await jest.advanceTimersByTimeAsync(1000)
      const result = await promise

      expect(result).toBe('fallback-ok')
      expect(operation).toHaveBeenCalledTimes(3)
      expect(operation.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemma-4-26b-a4b-it' })
      )
      expect(operation.mock.calls[1][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemma-4-26b-a4b-it' })
      )
      expect(operation.mock.calls[2][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemini-2.5-flash' })
      )
    })

    it('should fall back immediately when maxRetries is 0', async () => {
      process.env.GEMINI_MAX_RETRIES = '0'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const operation = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('fallback-ok')

      const result = await withGeminiFallback(operation)

      expect(result).toBe('fallback-ok')
      expect(operation).toHaveBeenCalledTimes(2)
      expect(operation.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemma-4-26b-a4b-it' })
      )
      expect(operation.mock.calls[1][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemini-2.5-flash' })
      )
    })

    it('should fall back after exhausting retries on RetryError with 429 lastError', async () => {
      process.env.GEMINI_MAX_RETRIES = '1'
      const retryError = Object.assign(new Error('retry exhausted'), {
        lastError: { statusCode: 429 }
      })
      const operation = jest
        .fn()
        .mockRejectedValueOnce(retryError)
        .mockRejectedValueOnce(retryError)
        .mockResolvedValueOnce('recovered')

      const promise = withGeminiFallback(operation)
      await jest.advanceTimersByTimeAsync(1000)
      const result = await promise

      expect(result).toBe('recovered')
      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('should throw immediately on non-429 error', async () => {
      const error = new Error('bad request')
      const operation = jest.fn().mockRejectedValue(error)

      await expect(withGeminiFallback(operation)).rejects.toThrow('bad request')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should throw if fallback also fails', async () => {
      process.env.GEMINI_MAX_RETRIES = '0'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const operation = jest.fn().mockRejectedValue(rateLimitError)

      await expect(withGeminiFallback(operation)).rejects.toThrow(
        'rate limited'
      )
      expect(operation).toHaveBeenCalledTimes(2)
    })
  })

  describe('createGeminiFallbackSession', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should use primary model when no 429 occurs', async () => {
      const session = createGeminiFallbackSession()
      const operation = jest.fn().mockResolvedValue('ok')
      const result = await session.execute(operation)

      expect(result).toBe('ok')
      expect(operation).toHaveBeenCalledTimes(1)
      expect(operation).toHaveBeenCalledWith(
        expect.objectContaining({ modelId: 'google/gemma-4-26b-a4b-it' })
      )
    })

    it('should keep using primary across multiple successful calls', async () => {
      const session = createGeminiFallbackSession()

      const op1 = jest.fn().mockResolvedValue('first')
      const op2 = jest.fn().mockResolvedValue('second')

      expect(await session.execute(op1)).toBe('first')
      expect(await session.execute(op2)).toBe('second')

      expect(op1.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemma-4-26b-a4b-it' })
      )
      expect(op2.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemma-4-26b-a4b-it' })
      )
    })

    it('should retry primary with exponential backoff on 429', async () => {
      process.env.GEMINI_MAX_RETRIES = '2'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const operation = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('ok')

      const session = createGeminiFallbackSession()
      const promise = session.execute(operation)
      await jest.advanceTimersByTimeAsync(1000)
      await jest.advanceTimersByTimeAsync(2000)
      const result = await promise

      expect(result).toBe('ok')
      expect(operation).toHaveBeenCalledTimes(3)
      for (const call of operation.mock.calls) {
        expect(call[0]).toEqual(
          expect.objectContaining({ modelId: 'google/gemma-4-26b-a4b-it' })
        )
      }
    })

    it('should switch to fallback after primary retries are exhausted', async () => {
      process.env.GEMINI_MAX_RETRIES = '1'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const operation = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('fallback-ok')

      const session = createGeminiFallbackSession()
      const promise = session.execute(operation)
      await jest.advanceTimersByTimeAsync(1000)
      const result = await promise

      expect(result).toBe('fallback-ok')
      expect(operation).toHaveBeenCalledTimes(3)
      expect(operation.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemma-4-26b-a4b-it' })
      )
      expect(operation.mock.calls[1][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemma-4-26b-a4b-it' })
      )
      expect(operation.mock.calls[2][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemini-2.5-flash' })
      )
    })

    it('should skip primary and use fallback directly on all subsequent calls after primary exhaustion', async () => {
      process.env.GEMINI_MAX_RETRIES = '0'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const session = createGeminiFallbackSession()

      // First call: primary 429 → useFallback flips → fallback succeeds
      const op1 = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('first-fallback')
      const result1 = await session.execute(op1)

      expect(result1).toBe('first-fallback')
      expect(op1.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemma-4-26b-a4b-it' })
      )
      expect(op1.mock.calls[1][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemini-2.5-flash' })
      )

      // Second call: goes straight to fallback, primary never called
      const op2 = jest.fn().mockResolvedValue('second-fallback')
      const result2 = await session.execute(op2)

      expect(result2).toBe('second-fallback')
      expect(op2).toHaveBeenCalledTimes(1)
      expect(op2.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemini-2.5-flash' })
      )

      // Third call: still fallback
      const op3 = jest.fn().mockResolvedValue('third-fallback')
      await session.execute(op3)
      expect(op3.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemini-2.5-flash' })
      )
    })

    it('should apply exponential backoff to fallback when useFallback is true', async () => {
      process.env.GEMINI_MAX_RETRIES = '1'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const session = createGeminiFallbackSession()

      // First call: exhaust primary (2 attempts) → useFallback flips → fallback succeeds
      const op1 = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('fallback-first')

      const p1 = session.execute(op1)
      await jest.advanceTimersByTimeAsync(1000)
      await p1

      // Second call: fallback with its own backoff (429 then success)
      const op2 = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('fallback-retry-ok')

      const p2 = session.execute(op2)
      await jest.advanceTimersByTimeAsync(1000)
      const result2 = await p2

      expect(result2).toBe('fallback-retry-ok')
      expect(op2).toHaveBeenCalledTimes(2)
      expect(op2.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemini-2.5-flash' })
      )
      expect(op2.mock.calls[1][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemini-2.5-flash' })
      )
    })

    it('should throw immediately on non-429 error', async () => {
      const session = createGeminiFallbackSession()
      const error = new Error('bad request')
      const operation = jest.fn().mockRejectedValue(error)

      await expect(session.execute(operation)).rejects.toThrow('bad request')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should throw if both primary retries and fallback fail', async () => {
      process.env.GEMINI_MAX_RETRIES = '0'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const session = createGeminiFallbackSession()
      const operation = jest.fn().mockRejectedValue(rateLimitError)

      await expect(session.execute(operation)).rejects.toThrow('rate limited')
      expect(operation).toHaveBeenCalledTimes(2)
    })

    it('should throw when fallback exhausts its own retries after useFallback is set', async () => {
      process.env.GEMINI_MAX_RETRIES = '1'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const session = createGeminiFallbackSession()

      // First call: exhaust primary (2 attempts) → useFallback flips → fallback succeeds
      const op1 = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError) // primary 0
        .mockRejectedValueOnce(rateLimitError) // primary 1
        .mockResolvedValueOnce('ok') // fallback 0

      const p1 = session.execute(op1)
      await jest.advanceTimersByTimeAsync(1000)
      await p1

      // Second call: useFallback=true, fallback 429s on both attempts → throws.
      // Attach the rejection handler BEFORE advancing timers to avoid an unhandled
      // rejection between timer advancement and the assertion.
      const op2 = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError) // fallback 0
        .mockRejectedValueOnce(rateLimitError) // fallback 1

      const rejectExpectation = expect(session.execute(op2)).rejects.toThrow(
        'rate limited'
      )
      await jest.advanceTimersByTimeAsync(1000) // fallback retry delay
      await rejectExpectation

      expect(op2).toHaveBeenCalledTimes(2)
      for (const call of op2.mock.calls) {
        expect(call[0]).toEqual(
          expect.objectContaining({ modelId: 'google/gemini-2.5-flash' })
        )
      }
    })

    it('should throw immediately on non-429 error from fallback when useFallback is true', async () => {
      process.env.GEMINI_MAX_RETRIES = '0'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const session = createGeminiFallbackSession()

      // First call: exhaust primary (0 retries) → fallback succeeds → useFallback=true
      const op1 = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('ok')
      await session.execute(op1)

      // Second call: useFallback=true, fallback throws a non-429 error immediately
      const nonRateLimitError = new Error('bad request')
      const op2 = jest.fn().mockRejectedValue(nonRateLimitError)

      await expect(session.execute(op2)).rejects.toThrow('bad request')
      expect(op2).toHaveBeenCalledTimes(1)
      expect(op2.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemini-2.5-flash' })
      )
    })

    it('should bail out of primary retries when a concurrent call already flipped useFallback', async () => {
      process.env.GEMINI_MAX_RETRIES = '1'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const session = createGeminiFallbackSession()

      // opA exhausts primary on both retries then succeeds on fallback.
      // A registers its 1s retry timer first, so its timer fires first.
      const opA = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError) // primary 0
        .mockRejectedValueOnce(rateLimitError) // primary 1 (A exhausts, sets useFallback=true)
        .mockResolvedValueOnce('A-fallback') // fallback 0

      // opB fails on primary 0 and then should bail — it must NOT make a primary 1 attempt
      // because A will have set useFallback=true by the time B wakes from its 1s sleep.
      const opB = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError) // primary 0
        .mockResolvedValueOnce('B-fallback') // fallback 0 (after bail-out)

      // Start both concurrently. A registers its sleep timer before B does.
      const promiseA = session.execute(opA)
      const promiseB = session.execute(opB)

      // Advancing 1s fires A's timer first (earlier registration). A wakes, exhausts
      // primary, sets useFallback=true, calls fallback and resolves — all before B's
      // timer fires. B then wakes, sees shouldAbort()=true, bails without a second
      // primary attempt, and goes straight to fallback.
      await jest.advanceTimersByTimeAsync(1000)

      const [resultA, resultB] = await Promise.all([promiseA, promiseB])

      expect(resultA).toBe('A-fallback')
      expect(resultB).toBe('B-fallback')

      // A: primary 0, primary 1, fallback 0 = 3 calls
      expect(opA).toHaveBeenCalledTimes(3)
      // B: primary 0, fallback 0 = 2 calls — primary 1 was skipped due to bail-out
      expect(opB).toHaveBeenCalledTimes(2)
      expect(opB.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemma-4-26b-a4b-it' })
      )
      expect(opB.mock.calls[1][0]).toEqual(
        expect.objectContaining({ modelId: 'google/gemini-2.5-flash' })
      )
    })
  })
})

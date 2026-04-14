import { google } from '@ai-sdk/google'

import {
  getGeminiFallbackModel,
  getGeminiMaxRetries,
  getGeminiModel,
  isRateLimitError,
  withGeminiFallback
} from './geminiModel'

jest.mock('@ai-sdk/google', () => ({
  google: jest.fn((modelId: string) => ({ modelId }))
}))

const mockedGoogle = jest.mocked(google)

describe('geminiModel', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.GEMINI_MODEL
    delete process.env.GEMINI_FALLBACK_MODEL
    delete process.env.GEMINI_MAX_RETRIES
    mockedGoogle.mockClear()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('getGeminiModel', () => {
    it('should use gemini-2.5-flash by default', () => {
      getGeminiModel()
      expect(mockedGoogle).toHaveBeenCalledWith('gemini-2.5-flash')
    })

    it('should use GEMINI_MODEL env var when set', () => {
      process.env.GEMINI_MODEL = 'gemini-2.0-flash'
      getGeminiModel()
      expect(mockedGoogle).toHaveBeenCalledWith('gemini-2.0-flash')
    })

    it('should fall back to default for empty string', () => {
      process.env.GEMINI_MODEL = ''
      getGeminiModel()
      expect(mockedGoogle).toHaveBeenCalledWith('gemini-2.5-flash')
    })

    it('should fall back to default for whitespace-only string', () => {
      process.env.GEMINI_MODEL = '   '
      getGeminiModel()
      expect(mockedGoogle).toHaveBeenCalledWith('gemini-2.5-flash')
    })
  })

  describe('getGeminiFallbackModel', () => {
    it('should use gemini-2.0-flash by default', () => {
      getGeminiFallbackModel()
      expect(mockedGoogle).toHaveBeenCalledWith('gemini-2.0-flash')
    })

    it('should use GEMINI_FALLBACK_MODEL env var when set', () => {
      process.env.GEMINI_FALLBACK_MODEL = 'gemini-2.5-flash-lite'
      getGeminiFallbackModel()
      expect(mockedGoogle).toHaveBeenCalledWith('gemini-2.5-flash-lite')
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
        expect.objectContaining({ modelId: 'gemini-2.5-flash' })
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
          expect.objectContaining({ modelId: 'gemini-2.5-flash' })
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
        expect.objectContaining({ modelId: 'gemini-2.5-flash' })
      )
      expect(operation.mock.calls[1][0]).toEqual(
        expect.objectContaining({ modelId: 'gemini-2.5-flash' })
      )
      expect(operation.mock.calls[2][0]).toEqual(
        expect.objectContaining({ modelId: 'gemini-2.0-flash' })
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
        expect.objectContaining({ modelId: 'gemini-2.5-flash' })
      )
      expect(operation.mock.calls[1][0]).toEqual(
        expect.objectContaining({ modelId: 'gemini-2.0-flash' })
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
})

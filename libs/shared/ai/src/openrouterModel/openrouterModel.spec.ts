import { openrouter } from '@openrouter/ai-sdk-provider'

import {
  createOpenrouterFallbackSession,
  withOpenrouterFallback
} from './openrouterModel'

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

const TEST_MODELS = [
  'custom/free-model',
  'custom/primary-model',
  'custom/fallback-model'
]

const mockedOpenrouter = jest.mocked(openrouter)

describe('openrouterModel', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.GEMINI_MAX_RETRIES
    mockedOpenrouter.chat.mockClear()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('createOpenrouterFallbackSession', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should use first model on success', async () => {
      const session = createOpenrouterFallbackSession(TEST_MODELS)
      const operation = jest.fn().mockResolvedValue('ok')
      const result = await session.execute(operation)

      expect(result).toBe('ok')
      expect(operation).toHaveBeenCalledTimes(1)
      expect(operation).toHaveBeenCalledWith(
        expect.objectContaining({ modelId: 'custom/free-model' })
      )
    })

    it('should fall to second model on 429', async () => {
      process.env.GEMINI_MAX_RETRIES = '0'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const session = createOpenrouterFallbackSession(TEST_MODELS)
      const operation = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('second-ok')

      const result = await session.execute(operation)

      expect(result).toBe('second-ok')
      expect(operation.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'custom/free-model' })
      )
      expect(operation.mock.calls[1][0]).toEqual(
        expect.objectContaining({ modelId: 'custom/primary-model' })
      )
    })

    it('should fall to second model on 403 key limit', async () => {
      process.env.GEMINI_MAX_RETRIES = '0'
      const keyLimitError = Object.assign(
        new Error('Key limit exceeded (total limit)'),
        { statusCode: 403 }
      )
      const session = createOpenrouterFallbackSession(TEST_MODELS)
      const operation = jest
        .fn()
        .mockRejectedValueOnce(keyLimitError)
        .mockResolvedValueOnce('paid-ok')

      const result = await session.execute(operation)

      expect(result).toBe('paid-ok')
      expect(operation.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'custom/free-model' })
      )
      expect(operation.mock.calls[1][0]).toEqual(
        expect.objectContaining({ modelId: 'custom/primary-model' })
      )
    })

    it('should chain through all 3 models on repeated 429s', async () => {
      process.env.GEMINI_MAX_RETRIES = '0'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const session = createOpenrouterFallbackSession(TEST_MODELS)
      const operation = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('third-ok')

      const result = await session.execute(operation)

      expect(result).toBe('third-ok')
      expect(operation).toHaveBeenCalledTimes(3)
      expect(operation.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'custom/free-model' })
      )
      expect(operation.mock.calls[1][0]).toEqual(
        expect.objectContaining({ modelId: 'custom/primary-model' })
      )
      expect(operation.mock.calls[2][0]).toEqual(
        expect.objectContaining({ modelId: 'custom/fallback-model' })
      )
    })

    it('should chain through 403 then 429 across models', async () => {
      process.env.GEMINI_MAX_RETRIES = '0'
      const keyLimitError = Object.assign(new Error('Key limit exceeded'), {
        statusCode: 403
      })
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const session = createOpenrouterFallbackSession(TEST_MODELS)
      const operation = jest
        .fn()
        .mockRejectedValueOnce(keyLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('final-ok')

      const result = await session.execute(operation)

      expect(result).toBe('final-ok')
      expect(operation.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'custom/free-model' })
      )
      expect(operation.mock.calls[1][0]).toEqual(
        expect.objectContaining({ modelId: 'custom/primary-model' })
      )
      expect(operation.mock.calls[2][0]).toEqual(
        expect.objectContaining({ modelId: 'custom/fallback-model' })
      )
    })

    it('should stick to active model for subsequent calls after fallback', async () => {
      process.env.GEMINI_MAX_RETRIES = '0'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const session = createOpenrouterFallbackSession(TEST_MODELS)

      const op1 = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('first-fallback')
      await session.execute(op1)

      const op2 = jest.fn().mockResolvedValue('second-call')
      const result2 = await session.execute(op2)

      expect(result2).toBe('second-call')
      expect(op2).toHaveBeenCalledTimes(1)
      expect(op2.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'custom/primary-model' })
      )
    })

    it('should retry with backoff before falling to next model', async () => {
      process.env.GEMINI_MAX_RETRIES = '2'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const operation = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('retry-ok')

      const session = createOpenrouterFallbackSession(TEST_MODELS)
      const promise = session.execute(operation)
      await jest.advanceTimersByTimeAsync(1000)
      await jest.advanceTimersByTimeAsync(2000)
      const result = await promise

      expect(result).toBe('retry-ok')
      expect(operation).toHaveBeenCalledTimes(3)
      for (const call of operation.mock.calls) {
        expect(call[0]).toEqual(
          expect.objectContaining({ modelId: 'custom/free-model' })
        )
      }
    })

    it('should throw immediately on non-429/403 error', async () => {
      const session = createOpenrouterFallbackSession(TEST_MODELS)
      const error = new Error('bad request')
      const operation = jest.fn().mockRejectedValue(error)

      await expect(session.execute(operation)).rejects.toThrow('bad request')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should throw if all models are exhausted', async () => {
      process.env.GEMINI_MAX_RETRIES = '0'
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const session = createOpenrouterFallbackSession(TEST_MODELS)
      const operation = jest.fn().mockRejectedValue(rateLimitError)

      await expect(session.execute(operation)).rejects.toThrow('rate limited')
      expect(operation).toHaveBeenCalledTimes(3)
    })
  })

  describe('withOpenrouterFallback', () => {
    it('should use first model on success', async () => {
      const operation = jest.fn().mockResolvedValue('ok')
      const result = await withOpenrouterFallback(operation, TEST_MODELS)

      expect(result).toBe('ok')
      expect(operation).toHaveBeenCalledWith(
        expect.objectContaining({ modelId: 'custom/free-model' })
      )
    })

    it('should chain through models on 403 then 429', async () => {
      process.env.GEMINI_MAX_RETRIES = '0'
      const keyLimitError = Object.assign(new Error('Key limit exceeded'), {
        statusCode: 403
      })
      const rateLimitError = Object.assign(new Error('rate limited'), {
        statusCode: 429
      })
      const operation = jest
        .fn()
        .mockRejectedValueOnce(keyLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('final-ok')

      const result = await withOpenrouterFallback(operation, TEST_MODELS)

      expect(result).toBe('final-ok')
      expect(operation.mock.calls[0][0]).toEqual(
        expect.objectContaining({ modelId: 'custom/free-model' })
      )
      expect(operation.mock.calls[1][0]).toEqual(
        expect.objectContaining({ modelId: 'custom/primary-model' })
      )
      expect(operation.mock.calls[2][0]).toEqual(
        expect.objectContaining({ modelId: 'custom/fallback-model' })
      )
    })
  })
})

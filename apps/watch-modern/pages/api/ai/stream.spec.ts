import { createMocks } from 'node-mocks-http'
import { NextApiRequest, NextApiResponse } from 'next'
import handler, { toStructuredError } from './stream'

// Mock the AI SDK
jest.mock('@ai-sdk/openai', () => ({
  createOpenAI: jest.fn(() => ({
    responses: jest.fn(() => ({
      // Mock model response
    }))
  }))
}))

jest.mock('ai', () => ({
  streamObject: jest.fn(),
  streamText: jest.fn()
}))

// Mock crypto.randomUUID
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'test-session-id')
}))

describe('/api/ai/stream', () => {
  let mockReq: NextApiRequest
  let mockRes: NextApiResponse

  beforeEach(() => {
    const mocks = createMocks({
      method: 'POST',
      body: {
        messages: [{ role: 'user', content: 'Test message' }],
        provider: 'openrouter'
      }
    })
    mockReq = mocks.req
    mockRes = mocks.res
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('toStructuredError', () => {
    it('should map insufficient credits error', () => {
      const error = { statusCode: 402, message: 'Insufficient credits' }
      const result = toStructuredError(error, 'openrouter')

      expect(result).toEqual({
        code: 'INSUFFICIENT_CREDITS',
        message: 'OpenRouter credits exhausted. Please add credits to your OpenRouter account.',
        provider: 'openrouter',
        isRetryable: false,
        actionUrl: 'https://openrouter.ai/settings/credits'
      })
    })

    it('should map rate limit error', () => {
      const error = { statusCode: 429, message: 'Rate limit exceeded' }
      const result = toStructuredError(error, 'openrouter')

      expect(result).toEqual({
        code: 'RATE_LIMIT',
        message: 'Rate limit exceeded. Please try again in a moment.',
        provider: 'openrouter',
        isRetryable: true
      })
    })

    it('should map model unavailable error', () => {
      const error = { statusCode: 404, message: 'Model not found' }
      const result = toStructuredError(error, 'openrouter')

      expect(result).toEqual({
        code: 'MODEL_UNAVAILABLE',
        message: 'AI model temporarily unavailable. Please try again later.',
        provider: 'openrouter',
        isRetryable: true
      })
    })

    it('should map network timeout error', () => {
      const error = { message: 'Request timeout', name: 'AbortError' }
      const result = toStructuredError(error, 'openrouter')

      expect(result).toEqual({
        code: 'NETWORK_TIMEOUT',
        message: 'Request timed out. Please check your connection and try again.',
        provider: 'openrouter',
        isRetryable: true
      })
    })

    it('should map network error', () => {
      const error = { message: 'ECONNREFUSED connection error' }
      const result = toStructuredError(error, 'openrouter')

      expect(result).toEqual({
        code: 'NETWORK',
        message: 'Network error. Please check your connection and try again.',
        provider: 'openrouter',
        isRetryable: true
      })
    })

    it('should map authentication error', () => {
      const error = { message: 'Invalid API key' }
      const result = toStructuredError(error, 'openrouter')

      expect(result).toEqual({
        code: 'AUTHENTICATION',
        message: 'Authentication error. Please check your API key.',
        provider: 'openrouter',
        isRetryable: false
      })
    })

    it('should handle unknown errors gracefully', () => {
      const error = { message: 'Some unknown error' }
      const result = toStructuredError(error, 'openrouter')

      expect(result).toEqual({
        message: 'Some unknown error',
        provider: 'openrouter',
        isRetryable: false
      })
    })

    it('should handle non-object errors', () => {
      const error = 'String error message'
      const result = toStructuredError(error, 'openrouter')

      expect(result).toEqual({
        message: 'AI streaming failed',
        provider: 'openrouter',
        isRetryable: false
      })
    })

    it('should preserve original message when no specific mapping applies', () => {
      const error = { message: 'Custom error from provider' }
      const result = toStructuredError(error, 'openrouter')

      expect(result.message).toBe('Custom error from provider')
      expect(result.provider).toBe('openrouter')
      expect(result.isRetryable).toBe(false)
    })
  })

  describe('POST /api/ai/stream', () => {
    it('should create streaming session successfully', async () => {
      // Mock environment variables
      process.env.OPENROUTER_API_KEY = 'test-api-key'

      await handler(mockReq, mockRes)

      expect(mockRes._getStatusCode()).toBe(201)
      const response = JSON.parse(mockRes._getData())
      expect(response.id).toBe('test-session-id')
    })

    it('should return 500 when OPENROUTER_API_KEY is not configured', async () => {
      // Remove environment variable
      delete process.env.OPENROUTER_API_KEY

      await handler(mockReq, mockRes)

      expect(mockRes._getStatusCode()).toBe(500)
      const response = JSON.parse(mockRes._getData())
      expect(response.error).toContain('OPENROUTER_API_KEY is not configured')
    })

    it('should validate messages payload', async () => {
      process.env.OPENROUTER_API_KEY = 'test-api-key'

      const mocks = createMocks({
        method: 'POST',
        body: {
          messages: 'invalid-messages', // Should be an array
          provider: 'openrouter'
        }
      })
      mockReq = mocks.req
      mockRes = mocks.res

      await handler(mockReq, mockRes)

      expect(mockRes._getStatusCode()).toBe(400)
      const response = JSON.parse(mockRes._getData())
      expect(response.error).toContain('Invalid messages payload')
    })

    it('should require messages or input', async () => {
      process.env.OPENROUTER_API_KEY = 'test-api-key'

      const mocks = createMocks({
        method: 'POST',
        body: {
          provider: 'openrouter'
          // No messages or input
        }
      })
      mockReq = mocks.req
      mockRes = mocks.res

      await handler(mockReq, mockRes)

      expect(mockRes._getStatusCode()).toBe(400)
      const response = JSON.parse(mockRes._getData())
      expect(response.error).toContain('Request body must include messages or input')
    })
  })

  describe('GET /api/ai/stream', () => {
    it('should require session ID', async () => {
      const mocks = createMocks({
        method: 'GET',
        query: {} // No id parameter
      })
      mockReq = mocks.req
      mockRes = mocks.res

      await handler(mockReq, mockRes)

      expect(mockRes._getStatusCode()).toBe(400)
      const response = JSON.parse(mockRes._getData())
      expect(response.error).toBe('Session ID is required')
    })

    it('should return 404 for non-existent session', async () => {
      const mocks = createMocks({
        method: 'GET',
        query: { id: 'non-existent-session' }
      })
      mockReq = mocks.req
      mockRes = mocks.res

      await handler(mockReq, mockRes)

      expect(mockRes._getStatusCode()).toBe(404)
      const response = JSON.parse(mockRes._getData())
      expect(response.error).toBe('Session not found or expired')
    })
  })

  describe('Unsupported methods', () => {
    it('should return 405 for unsupported methods', async () => {
      const mocks = createMocks({
        method: 'PUT'
      })
      mockReq = mocks.req
      mockRes = mocks.res

      await handler(mockReq, mockRes)

      expect(mockRes._getStatusCode()).toBe(405)
      const response = JSON.parse(mockRes._getData())
      expect(response.error).toBe('Method Not Allowed')
    })
  })
})

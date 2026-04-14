import { google } from '@ai-sdk/google'

import { getGeminiMaxRetries, getGeminiModel } from './geminiModel'

jest.mock('@ai-sdk/google', () => ({
  google: jest.fn((modelId: string) => ({ modelId }))
}))

const mockedGoogle = jest.mocked(google)

describe('geminiModel', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.GEMINI_MODEL
    delete process.env.GEMINI_MAX_RETRIES
    mockedGoogle.mockClear()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('getGeminiModel', () => {
    it('should use default model when GEMINI_MODEL is not set', () => {
      getGeminiModel()
      expect(mockedGoogle).toHaveBeenCalledWith('gemini-2.0-flash')
    })

    it('should use GEMINI_MODEL env var when set', () => {
      process.env.GEMINI_MODEL = 'gemini-2.0-flash'
      getGeminiModel()
      expect(mockedGoogle).toHaveBeenCalledWith('gemini-2.0-flash')
    })

    it('should use GEMINI_MODEL env var for arbitrary model ids', () => {
      process.env.GEMINI_MODEL = 'gemini-2.5-flash-lite'
      getGeminiModel()
      expect(mockedGoogle).toHaveBeenCalledWith('gemini-2.5-flash-lite')
    })
  })

  describe('getGeminiMaxRetries', () => {
    it('should return default when GEMINI_MAX_RETRIES is not set', () => {
      expect(getGeminiMaxRetries()).toBe(4)
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
      expect(getGeminiMaxRetries()).toBe(4)
    })

    it('should return default for empty string', () => {
      process.env.GEMINI_MAX_RETRIES = ''
      expect(getGeminiMaxRetries()).toBe(4)
    })
  })
})

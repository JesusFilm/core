import { generateText } from 'ai'

import { langfuse } from '../../../langfuse/server'

import { agentWebSearch } from './webSearch'

jest.mock('ai', () => ({
  ...jest.requireActual('ai'),
  generateText: jest.fn()
}))

jest.mock('../../../langfuse/server', () => ({
  langfuse: {
    getPrompt: jest.fn()
  },
  langfuseEnvironment: 'test'
}))

const mockedGenerateText = generateText as jest.Mock
const mockedGetPrompt = langfuse.getPrompt as jest.Mock

describe('agentWebSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return a web search result', async () => {
    const prompt = 'search for churches in new york'
    const url = 'example.com'
    const mockSystemPrompt = 'You are a web search assistant.'
    const mockCompiledPrompt = { compile: () => mockSystemPrompt }
    const mockResponse = {
      text: 'Found 100 churches.'
    }

    mockedGetPrompt.mockResolvedValue(mockCompiledPrompt)
    mockedGenerateText.mockResolvedValue(mockResponse)

    const tool = agentWebSearch()
    const result = await tool.execute(
      { prompt, url },
      { toolCallId: '123', messages: [] }
    )

    expect(mockedGetPrompt).toHaveBeenCalledWith(
      'system/ai/tools/agent/webSearch',
      undefined,
      expect.any(Object)
    )
    expect(mockedGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: mockSystemPrompt,
        prompt: `\n\nSCOPED_URL: ${url} ${prompt}`
      })
    )
    expect(result).toEqual(mockResponse.text)
  })

  describe('Error Handling', () => {
    it('should handle Langfuse prompt retrieval failure', async () => {
      const mockError = new Error('Langfuse API error')

      const mockSystemPrompt = 'You are a web search assistant.'
      const mockCompiledPrompt = { compile: () => mockSystemPrompt }

      mockedGetPrompt.mockResolvedValue(mockCompiledPrompt)
      mockedGenerateText.mockRejectedValue(new Error('AI error'))

      expect(result).toBe(`Error performing web search: ${mockError}`)
    })

    it('should handle generateText failure', async () => {
      const mockError = new Error('OpenAI API error')

      ;(generateText as jest.Mock).mockRejectedValue(mockError)

      const tool = agentWebSearch(mockClient, mockToolOptions)
      const result = await tool.execute(
        { prompt: 'test query' },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(result).toBe(`Error performing web search: ${mockError}`)
    })

    it('should handle system prompt toJSON failure gracefully', async () => {
      const mockError = new Error('toJSON failed')

      const mockSystemPromptWithBrokenToJSON = {
        prompt: 'System prompt text',
        toJSON: jest.fn().mockImplementation(() => {
          throw mockError
        })
      }
      ;(langfuse.getPrompt as jest.Mock).mockResolvedValue(
        mockSystemPromptWithBrokenToJSON
      )

      const tool = agentWebSearch(mockClient, mockToolOptions)
      const result = await tool.execute(
        { prompt: 'test query' },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(result).toBe(`Error performing web search: ${mockError}`)
    })
  })

  describe('Langfuse Integration', () => {
    it('should use correct Langfuse environment', async () => {
      const tool = agentWebSearch(mockClient, mockToolOptions)

      await tool.execute(
        { prompt: 'test query' },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(langfuse.getPrompt).toHaveBeenCalledWith(
        'ai-tools-agent-web-search-system-prompt',
        undefined,
        expect.objectContaining({
          label: langfuseEnvironment
        })
      )
    })

    it('should handle different cache TTL based on environment', async () => {
      const environments = [
        { env: 'preview', expectedTtl: 0 },
        { env: 'development', expectedTtl: 60 },
        { env: 'production', expectedTtl: 60 }
      ]

      for (const { env, expectedTtl } of environments) {
        jest.clearAllMocks()
        process.env.VERCEL_ENV = env

        const tool = agentWebSearch(mockClient, mockToolOptions)

        await tool.execute(
          { prompt: 'test query' },
          { toolCallId: 'test-call-id', messages: [] }
        )

        expect(langfuse.getPrompt).toHaveBeenCalledWith(
          'ai-tools-agent-web-search-system-prompt',
          undefined,
          expect.objectContaining({
            cacheTtlSeconds: expectedTtl
          })
        )
      }
    })

    it('should pass langfuseTraceId through telemetry metadata', async () => {
      const customTraceId = 'custom-trace-id-456'
      const customToolOptions = { langfuseTraceId: customTraceId }

      const tool = agentWebSearch(mockClient, customToolOptions)

      await tool.execute(
        { prompt: 'test query' },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          experimental_telemetry: expect.objectContaining({
            metadata: expect.objectContaining({
              langfuseTraceId: customTraceId
            })
          })
        })
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty search prompt', async () => {
      const tool = agentWebSearch(mockClient, mockToolOptions)

      const result = await tool.execute(
        { prompt: '' },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: ' ' // Just the space prefix
        })
      )

      expect(result).toBe(mockGenerateTextResult.text)
    })

    it('should handle very long search prompts', async () => {
      const longPrompt = 'a'.repeat(10000)
      const tool = agentWebSearch(mockClient, mockToolOptions)

      const result = await tool.execute(
        { prompt: longPrompt },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: ` ${longPrompt}`
        })
      )

      expect(result).toBe(mockGenerateTextResult.text)
    })

    it('should handle URL with special characters', async () => {
      const urlWithSpecialChars =
        'https://example.com/search?q=test%20query&sort=date'
      const tool = agentWebSearch(mockClient, mockToolOptions)

      const result = await tool.execute(
        { prompt: 'search query', url: urlWithSpecialChars },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: `\n\nSCOPED_URL: ${urlWithSpecialChars} search query`
        })
      )

      expect(result).toBe(mockGenerateTextResult.text)
    })
  })
})

import { openai } from '@ai-sdk/openai'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { generateText } from 'ai'
import { z } from 'zod'

import { langfuse, langfuseEnvironment } from '../../../langfuse/server'

import { agentWebSearch } from './webSearch'

jest.mock('@ai-sdk/openai', () => ({
  openai: {
    responses: jest.fn(),
    tools: {
      webSearchPreview: jest.fn()
    }
  }
}))

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

describe('agentWebSearch', () => {
  let mockClient: ApolloClient<NormalizedCacheObject>
  const mockLangfuseTraceId = 'test-trace-id-123'
  const mockToolOptions = { langfuseTraceId: mockLangfuseTraceId }
  const originalEnv = process.env

  const mockOpenaiModel = 'mocked-gpt-4o-mini-model'
  const mockWebSearchTool = { searchContextSize: 'high' }
  const mockSystemPrompt = {
    prompt: 'You are a helpful web search assistant.',
    toJSON: jest
      .fn()
      .mockReturnValue({ id: 'prompt-123', content: 'system prompt' })
  }
  const mockGenerateTextResult = {
    text: 'Here are the search results for your query...'
  }

  beforeEach(() => {
    process.env = { ...originalEnv }

    mockClient = {
      query: jest.fn(),
      mutate: jest.fn()
    } as unknown as ApolloClient<NormalizedCacheObject>
    ;(openai.responses as jest.Mock).mockReturnValue(mockOpenaiModel)
    ;(openai.tools.webSearchPreview as jest.Mock).mockReturnValue(
      mockWebSearchTool
    )
    ;(langfuse.getPrompt as jest.Mock).mockResolvedValue(mockSystemPrompt)
    ;(generateText as jest.Mock).mockResolvedValue(mockGenerateTextResult)

    process.env.VERCEL_ENV = 'development'
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    process.env = originalEnv
  })

  describe('Tool Structure', () => {
    it('should return a tool with correct parameters schema', () => {
      const tool = agentWebSearch(mockClient, mockToolOptions)

      expect(tool.parameters).toBeInstanceOf(z.ZodObject)

      const parametersShape = tool.parameters.shape as {
        prompt: z.ZodTypeAny
        url: z.ZodTypeAny
      }

      expect(parametersShape.prompt).toBeInstanceOf(z.ZodString)
      expect(parametersShape.prompt.description).toBe(
        'The query to search the web for.'
      )

      expect(parametersShape.url).toBeInstanceOf(z.ZodOptional)
      expect(parametersShape.url.description).toBe(
        'The URL to scope your results to.'
      )
    })

    it('should validate parameters correctly', () => {
      const tool = agentWebSearch(mockClient, mockToolOptions)

      expect(() =>
        tool.parameters.parse({
          prompt: 'search query',
          url: 'https://example.com'
        })
      ).not.toThrow()

      expect(() =>
        tool.parameters.parse({
          prompt: 'search query'
        })
      ).not.toThrow()

      expect(() =>
        tool.parameters.parse({
          url: 'https://example.com' // missing required prompt
        })
      ).toThrow()

      expect(() =>
        tool.parameters.parse({
          prompt: 123 // invalid type
        })
      ).toThrow()
    })
  })

  describe('Successful Execution', () => {
    it('should execute web search without URL scoping', async () => {
      const tool = agentWebSearch(mockClient, mockToolOptions)
      const searchPrompt = 'What is artificial intelligence?'

      const result = await tool.execute!(
        { prompt: searchPrompt },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(langfuse.getPrompt).toHaveBeenCalledWith(
        'ai-tools-agent-web-search-system-prompt',
        undefined,
        {
          label: langfuseEnvironment,
          cacheTtlSeconds: 60
        }
      )

      expect(openai.responses).toHaveBeenCalledWith('gpt-4o-mini')
      expect(openai.tools.webSearchPreview).toHaveBeenCalledWith({
        searchContextSize: 'high'
      })

      expect(generateText).toHaveBeenCalledWith({
        model: mockOpenaiModel,
        system: mockSystemPrompt.prompt,
        prompt: ` ${searchPrompt}`,
        tools: {
          web_search_preview: mockWebSearchTool
        },
        toolChoice: { type: 'tool', toolName: 'web_search_preview' },
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'agent-web-search',
          metadata: {
            langfuseTraceId: mockLangfuseTraceId,
            langfusePrompt: mockSystemPrompt.toJSON(),
            langfuseUpdateParent: false
          }
        }
      })

      expect(result).toBe(mockGenerateTextResult.text)
    })

    it('should execute web search with URL scoping', async () => {
      const tool = agentWebSearch(mockClient, mockToolOptions)
      const searchPrompt = 'pricing information'
      const scopedUrl = 'https://openai.com'

      const result = await tool.execute!(
        { prompt: searchPrompt, url: scopedUrl },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: `\n\nSCOPED_URL: ${scopedUrl} ${searchPrompt}`
        })
      )

      expect(result).toBe(mockGenerateTextResult.text)
    })

    it('should handle preview environment with zero cache TTL', async () => {
      process.env.VERCEL_ENV = 'preview'

      const tool = agentWebSearch(mockClient, mockToolOptions)

      await tool.execute!(
        { prompt: 'test query' },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(langfuse.getPrompt).toHaveBeenCalledWith(
        'ai-tools-agent-web-search-system-prompt',
        undefined,
        {
          label: langfuseEnvironment,
          cacheTtlSeconds: 0
        }
      )
    })

    it('should include correct telemetry metadata', async () => {
      const tool = agentWebSearch(mockClient, mockToolOptions)

      await tool.execute!(
        { prompt: 'test query' },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'agent-web-search',
            metadata: {
              langfuseTraceId: mockLangfuseTraceId,
              langfusePrompt: mockSystemPrompt.toJSON(),
              langfuseUpdateParent: false
            }
          }
        })
      )

      expect(mockSystemPrompt.toJSON).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle Langfuse prompt retrieval failure', async () => {
      const mockError = new Error('Langfuse API error')
      ;(langfuse.getPrompt as jest.Mock).mockRejectedValue(mockError)

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(jest.fn())

      const tool = agentWebSearch(mockClient, mockToolOptions)

      await expect(
        tool.execute!(
          { prompt: 'test query' },
          { toolCallId: 'test-call-id', messages: [] }
        )
      ).rejects.toThrow('Langfuse API error')

      consoleErrorSpy.mockRestore()
    })

    it('should handle generateText failure', async () => {
      const mockError = new Error('OpenAI API error')
      ;(generateText as jest.Mock).mockRejectedValue(mockError)

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(jest.fn())

      const tool = agentWebSearch(mockClient, mockToolOptions)

      await expect(
        tool.execute!(
          { prompt: 'test query' },
          { toolCallId: 'test-call-id', messages: [] }
        )
      ).rejects.toThrow('OpenAI API error')

      consoleErrorSpy.mockRestore()
    })

    it('should handle system prompt toJSON failure gracefully', async () => {
      const mockSystemPromptWithBrokenToJSON = {
        prompt: 'System prompt text',
        toJSON: jest.fn().mockImplementation(() => {
          throw new Error('toJSON failed')
        })
      }
      ;(langfuse.getPrompt as jest.Mock).mockResolvedValue(
        mockSystemPromptWithBrokenToJSON
      )

      const tool = agentWebSearch(mockClient, mockToolOptions)

      await expect(
        tool.execute!(
          { prompt: 'test query' },
          { toolCallId: 'test-call-id', messages: [] }
        )
      ).rejects.toThrow('toJSON failed')
    })
  })

  describe('Langfuse Integration', () => {
    it('should use correct Langfuse environment', async () => {
      const tool = agentWebSearch(mockClient, mockToolOptions)

      await tool.execute!(
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

        await tool.execute!(
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

      await tool.execute!(
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

      const result = await tool.execute!(
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

      const result = await tool.execute!(
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

      const result = await tool.execute!(
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

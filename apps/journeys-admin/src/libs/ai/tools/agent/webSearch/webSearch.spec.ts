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

  it('should return an error object when generateText fails', async () => {
    const prompt = 'search for something'

    const mockSystemPrompt = 'You are a web search assistant.'
    const mockCompiledPrompt = { compile: () => mockSystemPrompt }

    mockedGetPrompt.mockResolvedValue(mockCompiledPrompt)
    mockedGenerateText.mockRejectedValue(new Error('AI error'))

    const tool = agentWebSearch()
    const result = await tool.execute(
      { prompt },
      { toolCallId: '123', messages: [] }
    )

    expect(result).toEqual({ error: 'Failed to search web' })
  })
})

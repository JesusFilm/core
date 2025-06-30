import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { generateObject } from 'ai'

import { langfuse } from '../../../langfuse/server'

import { agentGetPersonalizationQuestions } from './getPersonalizationQuestions'

jest.mock('ai', () => ({
  ...jest.requireActual('ai'),
  generateObject: jest.fn()
}))

jest.mock('../../../langfuse/server', () => ({
  langfuse: {
    getPrompt: jest.fn()
  },
  langfuseEnvironment: 'test'
}))

const mockedGenerateObject = generateObject as jest.Mock
const mockedGetPrompt = langfuse.getPrompt as jest.Mock

describe('agentGetPersonalizationQuestions', () => {
  let mockClient: ApolloClient<NormalizedCacheObject>

  beforeEach(() => {
    jest.clearAllMocks()

    mockClient = {
      query: jest.fn(),
      mutate: jest.fn()
    } as unknown as ApolloClient<NormalizedCacheObject>
  })

  it('should return a structured object with personalization questions', async () => {
    const markdown = 'Welcome to [Church Name]! Our event is on [Event Date].'
    const mockSystemPrompt = 'You are a personalization assistant.'
    const mockCompiledPrompt = {
      compile: () => mockSystemPrompt,
      toJSON: () => ({ prompt: mockSystemPrompt })
    }
    const mockResponse = {
      questions: [
        {
          variable: 'churchName',
          question: 'What is the name of your church or organization?'
        },
        {
          variable: 'eventDate',
          question: 'What is the date of the event?'
        }
      ]
    }

    mockedGetPrompt.mockResolvedValue(mockCompiledPrompt)
    mockedGenerateObject.mockResolvedValue({ object: mockResponse })

    const tool = agentGetPersonalizationQuestions(mockClient, {
      langfuseTraceId: 'test-trace-id'
    })
    const result = await tool.execute(
      { markdown },
      {
        toolCallId: '123',
        messages: []
      }
    )

    expect(mockedGetPrompt).toHaveBeenCalledWith(
      'system/ai/tools/agent/getPersonalizationQuestions',
      undefined,
      expect.any(Object)
    )
    expect(mockedGenerateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        system: mockSystemPrompt,
        prompt: markdown
      })
    )
    expect(result).toEqual(mockResponse)
  })

  it('should return an error object when generateObject fails', async () => {
    const markdown = 'Some markdown'
    const mockSystemPrompt = 'You are a personalization assistant.'
    const mockCompiledPrompt = { compile: () => mockSystemPrompt }

    mockedGetPrompt.mockResolvedValue(mockCompiledPrompt)
    mockedGenerateObject.mockRejectedValue(new Error('AI error'))

    const tool = agentGetPersonalizationQuestions(mockClient, {
      langfuseTraceId: 'test-trace-id'
    })
    const result = await tool.execute(
      { markdown },
      {
        toolCallId: '123',
        messages: []
      }
    )

    expect(result).toEqual({ error: 'Failed to get personalization questions' })
  })
})

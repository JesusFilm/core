import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { journeySimpleSchema } from '@core/shared/ai/journeySimpleTypes'

import { JOURNEY_SIMPLE_GET, journeySimpleGet } from './get'

jest.mock('@apollo/client')

describe('journeySimpleGet', () => {
  let mockClient: ApolloClient<NormalizedCacheObject>

  beforeEach(() => {
    mockClient = {
      query: jest.fn()
    } as unknown as ApolloClient<NormalizedCacheObject>
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should return a tool with correct description and inputSchema', () => {
    const tool = journeySimpleGet(mockClient, { langfuseTraceId: 'test' })
    expect(typeof tool.description).toBe('string')
    expect(tool.inputSchema).toBeInstanceOf(z.ZodObject)
    const inputSchemaShape = tool.inputSchema.shape as { journeyId: z.ZodTypeAny }
    expect(inputSchemaShape.journeyId).toBeInstanceOf(z.ZodString)
  })

  it('should execute the query and return validated data on success', async () => {
    const mockJourney = {
      title: 'Test Journey',
      description: 'A test journey',
      cards: []
    }
    ;(mockClient.query as jest.Mock).mockResolvedValue({
      data: { journeySimpleGet: mockJourney }
    })
    const tool = journeySimpleGet(mockClient, { langfuseTraceId: 'test' })
    const result = await tool.execute!(
      { journeyId: 'jid' },
      { toolCallId: 'tid', messages: [] }
    )
    expect(mockClient.query).toHaveBeenCalledWith({
      query: JOURNEY_SIMPLE_GET,
      variables: { id: 'jid' }
    })
    expect(result).toEqual(mockJourney)
    // Validate output with Zod
    expect(journeySimpleSchema.safeParse(result).success).toBe(true)
  })

  it('should return success false and errors if the returned journey is invalid', async () => {
    const invalidJourney = { foo: 'bar' }
    ;(mockClient.query as jest.Mock).mockResolvedValue({
      data: { journeySimpleGet: invalidJourney }
    })
    const tool = journeySimpleGet(mockClient, { langfuseTraceId: 'test' })
    const result = await tool.execute!(
      { journeyId: 'jid' },
      { toolCallId: 'tid', messages: [] }
    )
    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('Returned journey is invalid')
          })
        ])
      })
    )
  })

  it('should return success false and errors if the query fails', async () => {
    const mockError = new Error('Network error')
    ;(mockClient.query as jest.Mock).mockRejectedValue(mockError)
    const tool = journeySimpleGet(mockClient, { langfuseTraceId: 'test' })
    const result = await tool.execute!(
      { journeyId: 'jid' },
      { toolCallId: 'tid', messages: [] }
    )
    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: 'Network error' })
        ])
      })
    )
  })
})

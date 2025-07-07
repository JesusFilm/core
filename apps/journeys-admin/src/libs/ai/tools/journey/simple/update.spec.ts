import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { journeySimpleSchema } from '@core/shared/ai/journeySimpleTypes'

import { JOURNEY_SIMPLE_UPDATE, journeySimpleUpdate } from './update'

jest.mock('@apollo/client')

describe('journeySimpleUpdate', () => {
  let mockClient: ApolloClient<NormalizedCacheObject>

  beforeEach(() => {
    mockClient = {
      mutate: jest.fn()
    } as unknown as ApolloClient<NormalizedCacheObject>
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should return a tool with correct description and parameters', () => {
    const tool = journeySimpleUpdate(mockClient, { langfuseTraceId: 'test' })
    expect(typeof tool.description).toBe('string')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as {
      journeyId: z.ZodTypeAny
      journey: z.ZodTypeAny
    }
    expect(parametersShape.journeyId).toBeInstanceOf(z.ZodString)
    expect(parametersShape.journey).toBeInstanceOf(z.ZodObject)
    const journeySchema = parametersShape.journey as z.ZodObject<any>
    expect(journeySchema.shape).toEqual(journeySimpleSchema.shape)
  })

  it('should execute the mutation and return success true with data', async () => {
    const mockJourney = {
      title: 'Test Journey',
      description: 'A test journey',
      cards: []
    }
    ;(mockClient.mutate as jest.Mock).mockResolvedValue({
      data: { journeySimpleUpdate: mockJourney },
      errors: undefined
    })
    const tool = journeySimpleUpdate(mockClient, { langfuseTraceId: 'test' })
    const result = await tool.execute!(
      { journeyId: 'jid', journey: mockJourney },
      { toolCallId: 'tid', messages: [] }
    )
    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: JOURNEY_SIMPLE_UPDATE,
      variables: { id: 'jid', journey: mockJourney }
    })
    expect(result).toEqual({ success: true, data: mockJourney })
  })

  it('should return success false with errors if mutation returns null', async () => {
    ;(mockClient.mutate as jest.Mock).mockResolvedValue({
      data: { journeySimpleUpdate: null },
      errors: [{ message: 'Some error' }]
    })
    const tool = journeySimpleUpdate(mockClient, { langfuseTraceId: 'test' })
    const result = await tool.execute!(
      { journeyId: 'jid', journey: {} },
      { toolCallId: 'tid', messages: [] }
    )
    expect(result).toEqual({
      success: false,
      errors: [{ message: 'Some error' }]
    })
  })

  it('should throw an error if the mutation fails', async () => {
    const mockError = new Error('Network error')
    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)
    const tool = journeySimpleUpdate(mockClient, { langfuseTraceId: 'test' })
    await expect(
      tool.execute!(
        { journeyId: 'jid', journey: {} },
        { toolCallId: 'tid', messages: [] }
      )
    ).rejects.toThrow('Network error')
  })
})

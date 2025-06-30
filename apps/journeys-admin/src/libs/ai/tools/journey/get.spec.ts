import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { blocks, defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { transformer } from '@core/journeys/ui/transformer'

import { AiJourneyGetQuery } from '../../../../../__generated__/AiJourneyGetQuery'

import { AI_JOURNEY_GET, journeyGet } from './get'

describe('journeyGet', () => {
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

  it('should return a tool with correct description and parameters', () => {
    const tool = journeyGet(mockClient)
    expect(tool.description).toContain(
      'You can use this tool to get the journey and its blocks.'
    )
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as {
      journeyId: z.ZodTypeAny
    }
    expect(parametersShape.journeyId).toBeInstanceOf(z.ZodString)
    expect(parametersShape.journeyId.description).toBe('The id of the journey.')
  })

  it('should execute the query and return transformed journey data on success', async () => {
    const mockJourneyId = 'journey-123'
    const mockJourney = {
      ...defaultJourney,
      id: mockJourneyId,
      blocks
    }

    const mockResponse: { data: AiJourneyGetQuery } = {
      data: {
        journey: mockJourney
      }
    }

    ;(mockClient.query as jest.Mock).mockResolvedValue(mockResponse)

    const tool = journeyGet(mockClient)
    const result = await tool.execute!(
      { journeyId: mockJourneyId },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.query).toHaveBeenCalledWith({
      query: AI_JOURNEY_GET,
      variables: { id: mockJourneyId }
    })

    const expectedTransformedBlocks = transformer(blocks)
    expect(result).toEqual({
      ...mockJourney,
      blocks: expectedTransformedBlocks
    })
  })

  it('should return null when journey blocks are null', async () => {
    const mockJourneyId = 'journey-123'
    const mockJourney = {
      ...defaultJourney,
      id: mockJourneyId,
      blocks: null
    }

    const mockResponse: { data: AiJourneyGetQuery } = {
      data: {
        journey: mockJourney
      }
    }

    ;(mockClient.query as jest.Mock).mockResolvedValue(mockResponse)

    const tool = journeyGet(mockClient)
    const result = await tool.execute!(
      { journeyId: mockJourneyId },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.query).toHaveBeenCalledWith({
      query: AI_JOURNEY_GET,
      variables: { id: mockJourneyId }
    })

    expect(result).toBeNull()
  })

  it('should return an error message on query failure', async () => {
    const mockJourneyId = 'journey-123'
    const mockError = new Error('Network error')

    ;(mockClient.query as jest.Mock).mockRejectedValue(mockError)

    const tool = journeyGet(mockClient)
    const result = await tool.execute!(
      { journeyId: mockJourneyId },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(result).toBe(`Error getting journey: ${mockError}`)
  })
})

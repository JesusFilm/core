import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiJourneyUpdateMutation } from '../../../../../__generated__/AiJourneyUpdateMutation'
import { JourneyUpdateInput } from '../../../../../__generated__/globalTypes'

import { journeyUpdateInputSchema } from './type'
import { AI_JOURNEY_UPDATE, journeyUpdate } from './update'

describe('journeyUpdate', () => {
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
    const tool = journeyUpdate(mockClient)
    expect(tool.description).toBe('Update a journey.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as {
      id: z.ZodTypeAny
      input: z.ZodTypeAny
    }
    expect(parametersShape.id).toBeInstanceOf(z.ZodString)
    expect(parametersShape.input).toBe(journeyUpdateInputSchema)
    expect(parametersShape.id.description).toBe(
      'The id of the journey to update.'
    )
  })

  it('should execute the mutation and return journey data on success', async () => {
    const mockId = 'journey-123'
    const mockInput = {
      title: 'Updated Journey Title',
      description: 'Updated description'
    } satisfies JourneyUpdateInput

    const mockResponse: { data: AiJourneyUpdateMutation } = {
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'journey-123'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = journeyUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_JOURNEY_UPDATE,
      variables: { id: mockId, input: mockInput }
    })

    expect(result).toEqual(mockResponse.data?.journeyUpdate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockId = 'journey-123'
    const mockInput = {
      title: 'Updated Journey Title'
    } satisfies JourneyUpdateInput

    const mockError = new Error('Network error')

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = journeyUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(result).toBe(`Error updating journey: ${mockError}`)
  })
})

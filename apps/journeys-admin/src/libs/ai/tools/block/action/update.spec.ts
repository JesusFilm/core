import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockActionUpdateMutation } from '../../../../../../__generated__/AiBlockActionUpdateMutation'
import { BlockUpdateActionInput } from '../../../../../../__generated__/globalTypes'

import { blockActionUpdateInputSchema } from './type'
import { AI_BLOCK_ACTION_UPDATE, blockActionUpdate } from './update'

describe('blockActionUpdate', () => {
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
    const tool = blockActionUpdate(mockClient)
    expect(tool.description).toBe('Update an action associated with a block.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as {
      id: z.ZodTypeAny
      input: z.ZodTypeAny
    }
    expect(parametersShape.id).toBeInstanceOf(z.ZodString)
    expect(parametersShape.input).toBe(blockActionUpdateInputSchema)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockId = 'block-id-123'
    const mockInput = {
      gtmEventName: 'button_click',
      url: 'https://example.com',
      target: '_blank'
    } satisfies BlockUpdateActionInput

    const mockResponse: { data: AiBlockActionUpdateMutation } = {
      data: {
        blockUpdateAction: {
          __typename: 'LinkAction',
          parentBlockId: 'parent-block-id-123'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockActionUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_ACTION_UPDATE,
      variables: { id: mockId, input: mockInput }
    })

    expect(result).toEqual(mockResponse.data?.blockUpdateAction)
  })

  it('should return an error message on mutation failure', async () => {
    const mockId = 'block-id-123'
    const mockInput = {
      gtmEventName: 'button_click',
      email: 'test@example.com'
    } satisfies BlockUpdateActionInput
    const mockError = new Error('Network error')

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn())

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockActionUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
    expect(result).toBe(`Error updating action: ${mockError}`)
  })
})

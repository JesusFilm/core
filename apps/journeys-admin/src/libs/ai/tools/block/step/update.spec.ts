import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockStepUpdateMutation } from '../../../../../../__generated__/AiBlockStepUpdateMutation'
import { StepBlockUpdateInput } from '../../../../../../__generated__/globalTypes'

import { blockStepUpdateInputSchema } from './type'
import { AI_BLOCK_STEP_UPDATE, blockStepUpdate } from './update'

describe('blockStepUpdate', () => {
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
    const tool = blockStepUpdate(mockClient)
    expect(tool.description).toBe('Update a step block.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as {
      id: z.ZodTypeAny
      input: z.ZodTypeAny
    }
    expect(parametersShape.id).toBeInstanceOf(z.ZodString)
    expect(parametersShape.input).toBe(blockStepUpdateInputSchema)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockId = 'step-block-id'
    const mockInput = {
      nextBlockId: 'next-step-id'
    } satisfies StepBlockUpdateInput

    const mockResponse: { data: AiBlockStepUpdateMutation } = {
      data: {
        stepBlockUpdate: {
          __typename: 'StepBlock',
          id: 'step-block-id'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockStepUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_STEP_UPDATE,
      variables: { id: mockId, input: mockInput }
    })

    expect(result).toEqual(mockResponse.data?.stepBlockUpdate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockId = 'step-block-id'
    const mockInput = {
      nextBlockId: 'next-step-id'
    } satisfies StepBlockUpdateInput
    const mockError = new Error('Network error')

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn())

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockStepUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
    expect(result).toBe(`Error updating step block: ${mockError}`)
  })
})

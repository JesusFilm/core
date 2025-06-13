import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockButtonUpdateMutation } from '../../../../../../__generated__/AiBlockButtonUpdateMutation'
import { ButtonBlockUpdateInput } from '../../../../../../__generated__/globalTypes'

import { blockButtonUpdateInputSchema } from './type'
import { AI_BLOCK_BUTTON_UPDATE, blockButtonUpdate } from './update'

describe('blockButtonUpdate', () => {
  let mockClient: ApolloClient<NormalizedCacheObject>

  beforeEach(() => {
    mockClient = {
      mutate: jest.fn()
    } as unknown as ApolloClient<NormalizedCacheObject>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return a tool with correct description and parameters', () => {
    const tool = blockButtonUpdate(mockClient)
    expect(tool.description).toBe('Update a button block.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as {
      id: z.ZodTypeAny
      input: z.ZodTypeAny
    }
    expect(parametersShape.id).toBeInstanceOf(z.ZodString)
    expect(parametersShape.input).toBe(blockButtonUpdateInputSchema)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockId = 'button-block-id'
    const mockInput = {
      label: 'Updated Button',
      submitEnabled: true
    } satisfies ButtonBlockUpdateInput

    const mockResponse: { data: AiBlockButtonUpdateMutation } = {
      data: {
        buttonBlockUpdate: {
          __typename: 'ButtonBlock',
          id: 'button-block-id'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockButtonUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_BUTTON_UPDATE,
      variables: { id: mockId, input: mockInput }
    })

    expect(result).toEqual(mockResponse.data?.buttonBlockUpdate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockId = 'button-block-id'
    const mockInput = {
      label: 'Updated Button',
      submitEnabled: false
    } satisfies ButtonBlockUpdateInput
    const mockError = new Error('Network error')

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn())

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockButtonUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
    expect(result).toBe(`Error updating button block: ${mockError}`)

    consoleErrorSpy.mockRestore()
  })
})

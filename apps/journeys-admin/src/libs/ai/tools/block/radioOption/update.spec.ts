import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockRadioOptionMutation } from '../../../../../../__generated__/AiBlockRadioOptionMutation'
import { RadioOptionBlockUpdateInput } from '../../../../../../__generated__/globalTypes'

import { blockRadioOptionUpdateInputSchema } from './type'
import { AI_BLOCK_RADIO_OPTION_UPDATE, blockRadioOptionUpdate } from './update'

describe('blockRadioOptionUpdate', () => {
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
    const tool = blockRadioOptionUpdate(mockClient)
    expect(tool.description).toBe('Update a radio option block.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as {
      id: z.ZodTypeAny
      input: z.ZodTypeAny
    }
    expect(parametersShape.id).toBeInstanceOf(z.ZodString)
    expect(parametersShape.input).toBe(blockRadioOptionUpdateInputSchema)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockId = 'radio-option-block-id'
    const mockInput = {
      label: 'Updated Radio Option'
    } satisfies RadioOptionBlockUpdateInput

    const mockResponse: { data: AiBlockRadioOptionMutation } = {
      data: {
        radioOptionBlockUpdate: {
          __typename: 'RadioOptionBlock',
          id: 'radio-option-block-id'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockRadioOptionUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_RADIO_OPTION_UPDATE,
      variables: { id: mockId, input: mockInput }
    })

    expect(result).toEqual(mockResponse.data?.radioOptionBlockUpdate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockId = 'radio-option-block-id'
    const mockInput = {
      label: 'Updated Radio Option'
    } satisfies RadioOptionBlockUpdateInput
    const mockError = new Error('Network error')

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn())

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockRadioOptionUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
    expect(result).toBe(`Error updating radio option block: ${mockError}`)

    consoleErrorSpy.mockRestore()
  })
})

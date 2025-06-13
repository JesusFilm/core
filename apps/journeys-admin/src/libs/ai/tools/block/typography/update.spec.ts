import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockTypographyUpdateMutation } from '../../../../../../__generated__/AiBlockTypographyUpdateMutation'
import { TypographyBlockUpdateInput } from '../../../../../../__generated__/globalTypes'

import { blockTypographyUpdateInputSchema } from './type'
import { AI_BLOCK_TYPOGRAPHY_UPDATE, blockTypographyUpdate } from './update'

describe('blockTypographyUpdate', () => {
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
    const tool = blockTypographyUpdate(mockClient)
    expect(tool.description).toBe('Update a typography block.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as {
      id: z.ZodTypeAny
      input: z.ZodTypeAny
    }
    expect(parametersShape.id).toBeInstanceOf(z.ZodString)
    expect(parametersShape.input).toBe(blockTypographyUpdateInputSchema)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockId = 'typography-block-id'
    const mockInput = {
      content: 'Updated text content'
    } satisfies TypographyBlockUpdateInput

    const mockResponse: { data: AiBlockTypographyUpdateMutation } = {
      data: {
        typographyBlockUpdate: {
          __typename: 'TypographyBlock',
          id: 'typography-block-id'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockTypographyUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_TYPOGRAPHY_UPDATE,
      variables: { id: mockId, input: mockInput }
    })

    expect(result).toEqual(mockResponse.data?.typographyBlockUpdate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockId = 'typography-block-id'
    const mockInput = {
      content: 'Updated text content'
    } satisfies TypographyBlockUpdateInput
    const mockError = new Error('Network error')

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn())

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockTypographyUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
    expect(result).toBe(`Error updating typography block: ${mockError}`)
  })
})

import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockDeleteMutation } from '../../../../../__generated__/AiBlockDeleteMutation'

import { AI_BLOCK_DELETE, blockDelete } from './delete'

describe('blockDelete', () => {
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
    const tool = blockDelete(mockClient)
    expect(tool.description).toBe('Delete a block by its ID.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as {
      id: z.ZodTypeAny
    }
    expect(parametersShape.id).toBeInstanceOf(z.ZodString)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockId = 'block-id-to-delete'

    const mockResponse: { data: AiBlockDeleteMutation } = {
      data: {
        blockDelete: [
          {
            __typename: 'ButtonBlock',
            id: 'block-id-to-delete',
            parentOrder: 0
          }
        ]
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockDelete(mockClient)
    const result = await tool.execute!(
      { id: mockId },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_DELETE,
      variables: { id: mockId }
    })

    expect(result).toEqual(mockResponse.data?.blockDelete)
  })

  it('should return an error message on mutation failure', async () => {
    const mockId = 'block-id-to-delete'
    const mockError = new Error('Network error')

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockDelete(mockClient)
    const result = await tool.execute!(
      { id: mockId },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(result).toBe(`Error deleting block: ${mockError}`)
  })
})

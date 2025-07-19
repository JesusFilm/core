import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockImageUpdateMutation } from '../../../../../../__generated__/AiBlockImageUpdateMutation'
import { ImageBlockUpdateInput } from '../../../../../../__generated__/globalTypes'

import { blockImageUpdateInputSchema } from './type'
import { AI_BLOCK_IMAGE_UPDATE, blockImageUpdate } from './update'

describe('blockImageUpdate', () => {
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
    const tool = blockImageUpdate(mockClient)
    expect(tool.description).toBe('Update an image block.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as {
      id: z.ZodTypeAny
      input: z.ZodTypeAny
    }
    expect(parametersShape.id).toBeInstanceOf(z.ZodString)
    expect(parametersShape.input).toBe(blockImageUpdateInputSchema)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockId = 'image-block-id'
    const mockInput = {
      alt: 'Updated image description',
      src: 'https://example.com/updated-image.jpg'
    } satisfies ImageBlockUpdateInput

    const mockResponse: { data: AiBlockImageUpdateMutation } = {
      data: {
        imageBlockUpdate: {
          __typename: 'ImageBlock',
          id: 'image-block-id'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockImageUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_IMAGE_UPDATE,
      variables: { id: mockId, input: mockInput }
    })

    expect(result).toEqual(mockResponse.data?.imageBlockUpdate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockId = 'image-block-id'
    const mockInput = {
      alt: 'Updated image description',
      src: 'https://example.com/updated-image.jpg'
    } satisfies ImageBlockUpdateInput
    const mockError = new Error('Network error')

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockImageUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(result).toBe(`Error updating image block: ${mockError}`)
  })
})

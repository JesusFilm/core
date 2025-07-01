import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockImageCreateMutation } from '../../../../../../__generated__/AiBlockImageCreateMutation'
import { ImageBlockCreateInput } from '../../../../../../__generated__/globalTypes'

import { AI_BLOCK_IMAGE_CREATE, blockImageCreate } from './create'
import { blockImageCreateInputSchema } from './type'

describe('blockImageCreate', () => {
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
    const tool = blockImageCreate(mockClient)
    expect(tool.description).toBe('Create a new image block.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as { input: z.ZodTypeAny }
    expect(parametersShape.input).toBe(blockImageCreateInputSchema)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockInput = {
      journeyId: 'journey-id',
      alt: 'Sample image description',
      src: 'https://example.com/image.jpg'
    } satisfies ImageBlockCreateInput

    const mockResponse: { data: AiBlockImageCreateMutation } = {
      data: {
        imageBlockCreate: {
          id: 'new-image-id',
          __typename: 'ImageBlock'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockImageCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_IMAGE_CREATE,
      variables: {
        input: { ...mockInput, alt: mockInput.alt }
      }
    })

    expect(result).toEqual(mockResponse.data?.imageBlockCreate)
  })

  it('should execute the mutation with default alt when alt is undefined', async () => {
    const mockInput = {
      journeyId: 'journey-id',
      src: 'https://example.com/image.jpg'
    }

    const mockResponse: { data: AiBlockImageCreateMutation } = {
      data: {
        imageBlockCreate: {
          id: 'new-image-id',
          __typename: 'ImageBlock'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockImageCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_IMAGE_CREATE,
      variables: {
        input: { ...mockInput, alt: '' }
      }
    })

    expect(result).toEqual(mockResponse.data?.imageBlockCreate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockInput = {
      journeyId: 'journey-id',
      alt: 'Sample image description',
      src: 'https://example.com/image.jpg'
    } satisfies ImageBlockCreateInput
    const mockError = new Error('Network error')

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockImageCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )
    expect(result).toBe(`Error creating image block: ${mockError}`)
  })
})

import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockVideoCreateMutation } from '../../../../../../__generated__/AiBlockVideoCreateMutation'
import { VideoBlockCreateInput } from '../../../../../../__generated__/globalTypes'

import { AI_BLOCK_VIDEO_CREATE, blockVideoCreate } from './create'
import { blockVideoCreateInputSchema } from './type'

describe('blockVideoCreate', () => {
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
    const tool = blockVideoCreate(mockClient)
    expect(tool.description).toBe('Create a new video block.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    // assert that the parameters input is the correct schema
    const parametersShape = tool.parameters.shape as { input: z.ZodTypeAny }

    expect(parametersShape.input).toBe(blockVideoCreateInputSchema)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockInput = {
      journeyId: 'journey-id',
      parentBlockId: 'parent-block-id',
      videoId: 'video-id',
      videoVariantLanguageId: 'variant-id'
    } satisfies VideoBlockCreateInput

    const mockResponse: { data: AiBlockVideoCreateMutation } = {
      data: {
        videoBlockCreate: {
          id: 'new-video-id',
          __typename: 'VideoBlock'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockVideoCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_VIDEO_CREATE,
      variables: {
        input: mockInput
      }
    })

    expect(result).toEqual(mockResponse.data?.videoBlockCreate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockInput = {
      journeyId: 'journey-id',
      parentBlockId: 'parent-block-id',
      videoId: 'video-id',
      videoVariantLanguageId: 'variant-id'
    } satisfies VideoBlockCreateInput
    const mockError = new Error('Network error')

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockVideoCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )
    expect(result).toBe(`Error creating video block: ${mockError}`)
  })
})

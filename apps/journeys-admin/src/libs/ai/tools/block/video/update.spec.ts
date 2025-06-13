import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockVideoUpdateMutation } from '../../../../../../__generated__/AiBlockVideoUpdateMutation'
import { VideoBlockUpdateInput } from '../../../../../../__generated__/globalTypes'

import { blockVideoUpdateInputSchema } from './type'
import { AI_BLOCK_VIDEO_UPDATE, blockVideoUpdate } from './update'

describe('blockVideoUpdate', () => {
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
    const tool = blockVideoUpdate(mockClient)
    expect(tool.description).toBe('Update a video block.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as {
      id: z.ZodTypeAny
      input: z.ZodTypeAny
    }
    expect(parametersShape.id).toBeInstanceOf(z.ZodString)
    expect(parametersShape.input).toBe(blockVideoUpdateInputSchema)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockId = 'video-block-id'
    const mockInput = {
      startAt: 10,
      endAt: 120,
      muted: false,
      autoplay: true
    } satisfies VideoBlockUpdateInput

    const mockResponse: { data: AiBlockVideoUpdateMutation } = {
      data: {
        videoBlockUpdate: {
          __typename: 'VideoBlock',
          id: 'video-block-id'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockVideoUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_VIDEO_UPDATE,
      variables: { id: mockId, input: mockInput }
    })

    expect(result).toEqual(mockResponse.data?.videoBlockUpdate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockId = 'video-block-id'
    const mockInput = {
      startAt: 10,
      endAt: 120,
      muted: false,
      autoplay: true
    } satisfies VideoBlockUpdateInput
    const mockError = new Error('Network error')

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn())

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockVideoUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
    expect(result).toBe(`Error updating video block: ${mockError}`)

    consoleErrorSpy.mockRestore()
  })
})

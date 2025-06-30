import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockTypographyCreateMutation } from '../../../../../../__generated__/AiBlockTypographyCreateMutation'
import { TypographyBlockCreateInput } from '../../../../../../__generated__/globalTypes'

import { AI_BLOCK_TYPOGRAPHY_CREATE, blockTypographyCreate } from './create'
import { blockTypographyCreateInputSchema } from './type'

describe('blockTypographyCreate', () => {
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
    const tool = blockTypographyCreate(mockClient)
    expect(tool.description).toBe('Create a new typography block.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    // assert that the parameters input is the correct schema
    const parametersShape = tool.parameters.shape as { input: z.ZodTypeAny }

    expect(parametersShape.input).toBe(blockTypographyCreateInputSchema)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockInput = {
      journeyId: 'journey-id',
      parentBlockId: 'parent-block-id',
      content: 'Sample text content'
    } satisfies TypographyBlockCreateInput

    const mockResponse: { data: AiBlockTypographyCreateMutation } = {
      data: {
        typographyBlockCreate: {
          id: 'new-typography-id',
          __typename: 'TypographyBlock'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockTypographyCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_TYPOGRAPHY_CREATE,
      variables: {
        input: mockInput
      }
    })

    expect(result).toEqual(mockResponse.data?.typographyBlockCreate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockInput = {
      journeyId: 'journey-id',
      parentBlockId: 'parent-block-id',
      content: 'Sample text content'
    } satisfies TypographyBlockCreateInput
    const mockError = new Error('Network error')

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockTypographyCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )
    expect(result).toBe(`Error creating typography block: ${mockError}`)
  })
})

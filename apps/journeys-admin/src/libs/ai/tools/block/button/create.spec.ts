import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockButtonCreateMutation } from '../../../../../../__generated__/AiBlockButtonCreateMutation'
import { ButtonBlockCreateInput } from '../../../../../../__generated__/globalTypes'

import { AI_BLOCK_BUTTON_CREATE, blockButtonCreate } from './create'
import { blockButtonCreateInputSchema } from './type'

describe('blockButtonCreate', () => {
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
    const tool = blockButtonCreate(mockClient)
    expect(tool.description).toBe('Create a new button block.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    // assert that the parameters input is the correct schema
    const parametersShape = tool.parameters.shape as { input: z.ZodTypeAny }
    expect(parametersShape.input).toBe(blockButtonCreateInputSchema)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockInput = {
      journeyId: 'journey-id',
      parentBlockId: 'parent-block-id',
      label: 'Click me'
    } satisfies ButtonBlockCreateInput

    const mockResponse: { data: AiBlockButtonCreateMutation } = {
      data: {
        buttonBlockCreate: {
          id: 'new-button-id',
          __typename: 'ButtonBlock'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockButtonCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_BUTTON_CREATE,
      variables: {
        input: mockInput
      }
    })

    expect(result).toEqual(mockResponse.data.buttonBlockCreate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockInput = {
      journeyId: 'journey-id',
      parentBlockId: 'parent-block-id',
      label: 'Click me'
    } satisfies ButtonBlockCreateInput
    const errorMessage = 'Network error'
    const mockError = new Error(errorMessage)

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn())

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockButtonCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)

    expect(result).toBe(`Error creating button block: ${mockError}`)

    consoleErrorSpy.mockRestore()
  })
})

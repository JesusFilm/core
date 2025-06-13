import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockRadioOptionCreateMutation } from '../../../../../../__generated__/AiBlockRadioOptionCreateMutation'
import { RadioOptionBlockCreateInput } from '../../../../../../__generated__/globalTypes'

import { AI_BLOCK_RADIO_OPTION_CREATE, blockRadioOptionCreate } from './create'
import { blockRadioOptionCreateInputSchema } from './type'

describe('blockRadioOptionCreate', () => {
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
    const tool = blockRadioOptionCreate(mockClient)
    expect(tool.description).toBe('Create a new radio option block.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as { input: z.ZodTypeAny }
    expect(parametersShape.input).toBe(blockRadioOptionCreateInputSchema)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockInput = {
      journeyId: 'journey-id',
      parentBlockId: 'parent-block-id',
      label: 'Option A'
    } satisfies RadioOptionBlockCreateInput

    const mockResponse: { data: AiBlockRadioOptionCreateMutation } = {
      data: {
        radioOptionBlockCreate: {
          id: 'new-radio-option-id',
          __typename: 'RadioOptionBlock'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockRadioOptionCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_RADIO_OPTION_CREATE,
      variables: {
        input: mockInput
      }
    })

    expect(result).toEqual(mockResponse.data?.radioOptionBlockCreate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockInput = {
      journeyId: 'journey-id',
      parentBlockId: 'parent-block-id',
      label: 'Option A'
    } satisfies RadioOptionBlockCreateInput
    const mockError = new Error('Network error')

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn())

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockRadioOptionCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
    expect(result).toBe(`Error creating radio option block: ${mockError}`)

    consoleErrorSpy.mockRestore()
  })
})

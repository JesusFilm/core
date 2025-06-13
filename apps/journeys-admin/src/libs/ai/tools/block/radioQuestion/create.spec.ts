import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockRadioQuestionCreateMutation } from '../../../../../../__generated__/AiBlockRadioQuestionCreateMutation'
import { RadioQuestionBlockCreateInput } from '../../../../../../__generated__/globalTypes'

import {
  AI_BLOCK_RADIO_QUESTION_CREATE,
  blockRadioQuestionCreate
} from './create'
import { blockRadioQuestionCreateInputSchema } from './type'

describe('blockRadioQuestionCreate', () => {
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
    const tool = blockRadioQuestionCreate(mockClient)
    expect(tool.description).toBe('Create a new radio question block')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as { input: z.ZodTypeAny }
    expect(parametersShape.input).toBe(blockRadioQuestionCreateInputSchema)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockInput = {
      journeyId: 'journey-id',
      parentBlockId: 'parent-block-id'
    } satisfies RadioQuestionBlockCreateInput

    const mockResponse: { data: AiBlockRadioQuestionCreateMutation } = {
      data: {
        radioQuestionBlockCreate: {
          id: 'new-radio-question-id',
          __typename: 'RadioQuestionBlock'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockRadioQuestionCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_RADIO_QUESTION_CREATE,
      variables: {
        input: mockInput
      }
    })

    expect(result).toEqual(mockResponse.data?.radioQuestionBlockCreate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockInput = {
      journeyId: 'journey-id',
      parentBlockId: 'parent-block-id'
    } satisfies RadioQuestionBlockCreateInput
    const mockError = new Error('Network error')

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn())

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockRadioQuestionCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
    expect(result).toBe(`Error creating radio question block: ${mockError}`)

    consoleErrorSpy.mockRestore()
  })
})

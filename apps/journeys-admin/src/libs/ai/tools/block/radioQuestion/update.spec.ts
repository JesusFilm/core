import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockRadioQuestionUpdateMutation } from '../../../../../../__generated__/AiBlockRadioQuestionUpdateMutation'

import {
  AI_BLOCK_RADIO_QUESTION_UPDATE,
  blockRadioQuestionUpdate
} from './update'

describe('blockRadioQuestionUpdate', () => {
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
    const tool = blockRadioQuestionUpdate(mockClient)
    expect(tool.description).toBe('Update a radio question block.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as {
      id: z.ZodTypeAny
      parentBlockId: z.ZodTypeAny
    }
    expect(parametersShape.id).toBeInstanceOf(z.ZodString)
    expect(parametersShape.parentBlockId).toBeInstanceOf(z.ZodString)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockId = 'radio-question-block-id'
    const mockParentBlockId = 'parent-block-id'

    const mockResponse: { data: AiBlockRadioQuestionUpdateMutation } = {
      data: {
        radioQuestionBlockUpdate: {
          __typename: 'RadioQuestionBlock',
          id: 'radio-question-block-id'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockRadioQuestionUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, parentBlockId: mockParentBlockId },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_RADIO_QUESTION_UPDATE,
      variables: { id: mockId, parentBlockId: mockParentBlockId }
    })

    expect(result).toEqual(mockResponse.data?.radioQuestionBlockUpdate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockId = 'radio-question-block-id'
    const mockParentBlockId = 'parent-block-id'
    const mockError = new Error('Network error')

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockRadioQuestionUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, parentBlockId: mockParentBlockId },
      { toolCallId: 'test-id', messages: [] }
    )
    expect(result).toBe(`Error updating radio question block: ${mockError}`)
  })
})

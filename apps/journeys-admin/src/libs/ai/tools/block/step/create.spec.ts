import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockStepCreateMutation } from '../../../../../../__generated__/AiBlockStepCreateMutation'
import {
  CardBlockCreateInput,
  StepBlockCreateInput
} from '../../../../../../__generated__/globalTypes'
import { blockCardCreateInputSchema } from '../card/type'

import { AI_BLOCK_STEP_CREATE, blockStepCreate } from './create'
import { blockStepCreateInputSchema } from './type'

describe('blockStepCreate', () => {
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
    const tool = blockStepCreate(mockClient)
    expect(tool.description).toBe(
      'Create a new step block with a single card block as its content.'
    )
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as {
      input: z.ZodTypeAny
      cardInput: z.ZodTypeAny
    }
    expect(parametersShape.input).toBe(blockStepCreateInputSchema)
    expect(parametersShape.cardInput).toBe(blockCardCreateInputSchema)
  })

  it('should execute the dual mutation and return step data on success', async () => {
    const mockInput = {
      journeyId: 'journey-id'
    } satisfies StepBlockCreateInput

    const mockCardInput = {
      journeyId: 'journey-id',
      parentBlockId: 'step-block-id'
    } satisfies CardBlockCreateInput

    const mockResponse: { data: AiBlockStepCreateMutation } = {
      data: {
        stepBlockCreate: {
          __typename: 'StepBlock',
          id: 'new-step-id'
        },
        cardBlockCreate: {
          __typename: 'CardBlock',
          id: 'new-card-id'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockStepCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput, cardInput: mockCardInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_STEP_CREATE,
      variables: { input: mockInput, cardInput: mockCardInput }
    })

    expect(result).toEqual(mockResponse.data?.stepBlockCreate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockInput = {
      journeyId: 'journey-id'
    } satisfies StepBlockCreateInput

    const mockCardInput = {
      journeyId: 'journey-id',
      parentBlockId: 'step-block-id'
    } satisfies CardBlockCreateInput

    const mockError = new Error('Network error')

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockStepCreate(mockClient)
    const result = await tool.execute!(
      { input: mockInput, cardInput: mockCardInput },
      { toolCallId: 'test-id', messages: [] }
    )
    expect(result).toBe(`Error creating step block: ${mockError}`)
  })
})

import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { z } from 'zod'

import { AiBlockCardUpdateMutation } from '../../../../../../__generated__/AiBlockCardUpdateMutation'
import {
  CardBlockUpdateInput,
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'

import { blockCardUpdateInputSchema } from './type'
import { AI_BLOCK_CARD_UPDATE, blockCardUpdate } from './update'

describe('blockCardUpdate', () => {
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
    const tool = blockCardUpdate(mockClient)
    expect(tool.description).toBe('Update a card block.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)
    const parametersShape = tool.parameters.shape as {
      id: z.ZodTypeAny
      input: z.ZodTypeAny
    }
    expect(parametersShape.id).toBeInstanceOf(z.ZodString)
    expect(parametersShape.input).toBe(blockCardUpdateInputSchema)
  })

  it('should execute the mutation and return data on success', async () => {
    const mockId = 'card-block-id'
    const mockInput = {
      fullscreen: false,
      themeMode: ThemeMode.light,
      themeName: ThemeName.base
    } satisfies CardBlockUpdateInput

    const mockResponse: { data: AiBlockCardUpdateMutation } = {
      data: {
        cardBlockUpdate: {
          __typename: 'CardBlock',
          id: 'card-block-id'
        }
      }
    }

    ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockResponse)

    const tool = blockCardUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(mockClient.mutate).toHaveBeenCalledWith({
      mutation: AI_BLOCK_CARD_UPDATE,
      variables: { id: mockId, input: mockInput }
    })

    expect(result).toEqual(mockResponse.data?.cardBlockUpdate)
  })

  it('should return an error message on mutation failure', async () => {
    const mockId = 'card-block-id'
    const mockInput = {
      fullscreen: true,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base
    } satisfies CardBlockUpdateInput
    const mockError = new Error('Network error')

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn())

    ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

    const tool = blockCardUpdate(mockClient)
    const result = await tool.execute!(
      { id: mockId, input: mockInput },
      { toolCallId: 'test-id', messages: [] }
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
    expect(result).toBe(`Error updating card block: ${mockError}`)

    consoleErrorSpy.mockRestore()
  })
})

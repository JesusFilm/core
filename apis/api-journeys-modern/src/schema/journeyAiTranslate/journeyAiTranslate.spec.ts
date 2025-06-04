import { generateObject, streamObject } from 'ai'

import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { Action, ability } from '../../lib/auth/ability'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { getCardBlocksContent } from './getCardBlocksContent'

// Mock all external dependencies
jest.mock('@ai-sdk/google', () => ({
  google: jest.fn(() => 'mocked-google-model')
}))

jest.mock('ai', () => ({
  generateObject: jest.fn(),
  streamObject: jest.fn()
}))

jest.mock('@core/shared/ai/prompts', () => ({
  hardenPrompt: jest.fn((text) => `<hardened>${text}</hardened>`),
  preSystemPrompt: 'mocked system prompt'
}))

jest.mock('../../lib/auth/ability', () => ({
  Action: {
    Update: 'update'
  },
  ability: jest.fn(),
  subject: jest.fn()
}))

jest.mock('./getCardBlocksContent', () => ({
  getCardBlocksContent: jest.fn()
}))

// Mock utility to create AsyncIterator for testing
function createMockAsyncIterator<T>(items: T[]): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]: () => {
      let index = 0
      return {
        next: () => {
          if (index < items.length) {
            return Promise.resolve({ done: false, value: items[index++] })
          }
          return Promise.resolve({ done: true, value: undefined })
        }
      }
    }
  }
}

describe('journeyAiTranslateCreate mutation', () => {
  const mockAbility = ability as jest.MockedFunction<typeof ability>
  const mockGenerateObject = generateObject as jest.MockedFunction<
    typeof generateObject
  >
  const mockStreamObject = streamObject as jest.MockedFunction<
    typeof streamObject
  >
  const mockGetCardBlocksContent = getCardBlocksContent as jest.MockedFunction<
    typeof getCardBlocksContent
  >

  // Sample data
  const mockJourneyId = 'journey123'
  const mockLanguageId = 'lang456'
  const mockUser = {
    id: 'testUserId',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
    imageUrl: null
  }

  const mockInput = {
    journeyId: mockJourneyId,
    name: 'Original Journey Name',
    journeyLanguageName: 'English',
    textLanguageId: mockLanguageId,
    textLanguageName: 'Spanish'
  }

  const mockJourney = {
    id: mockJourneyId,
    title: 'Original Journey Title',
    description: 'Original journey description',
    blocks: [
      {
        id: 'card1',
        typename: 'CardBlock',
        parentOrder: 0
      },
      {
        id: 'typography1',
        typename: 'TypographyBlock',
        parentBlockId: 'card1',
        content: 'Some text content'
      },
      {
        id: 'button1',
        typename: 'ButtonBlock',
        parentBlockId: 'card1',
        label: 'Click me'
      },
      {
        id: 'radio1',
        typename: 'RadioQuestionBlock',
        parentBlockId: 'card1',
        label: 'Choose an option'
      },
      {
        id: 'option1',
        typename: 'RadioOptionBlock',
        parentBlockId: 'radio1',
        label: 'Option 1'
      },
      {
        id: 'text1',
        typename: 'TextResponseBlock',
        parentBlockId: 'card1',
        label: 'Enter text',
        placeholder: 'Type here'
      }
    ],
    userJourneys: [],
    team: {
      id: 'team1',
      userTeams: []
    }
  }

  const mockCardBlocksContent = ['Card 1 content including all blocks']

  const mockAnalysisAndTranslation = {
    analysis:
      'This journey is about example content. Cultural adaptations include...',
    title: 'Título del Viaje Traducido',
    description: 'Descripción del viaje traducida'
  }

  const mockTranslatedBlocks = [
    {
      blockId: 'typography1',
      updates: { content: 'Contenido de texto traducido' }
    },
    {
      blockId: 'button1',
      updates: { label: 'Haga clic aquí' }
    },
    {
      blockId: 'radio1',
      updates: { label: 'Elija una opción' }
    },
    {
      blockId: 'option1',
      updates: { label: 'Opción 1' }
    },
    {
      blockId: 'text1',
      updates: {
        label: 'Ingrese texto',
        placeholder: 'Escriba aquí'
      }
    }
  ]

  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentUser: mockUser
    }
  })

  const JOURNEY_AI_TRANSLATE_CREATE_MUTATION = graphql(`
    mutation JourneyAiTranslateCreate($input: JourneyAiTranslateInput!) {
      journeyAiTranslateCreate(input: $input) {
        id
        title
        description
      }
    }
  `)

  beforeEach(() => {
    jest.clearAllMocks()

    // Set up prismaMock
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)

    prismaMock.journey.update.mockResolvedValue({
      ...mockJourney,
      title: mockAnalysisAndTranslation.title,
      description: mockAnalysisAndTranslation.description
    } as any)

    prismaMock.block.update.mockResolvedValue({} as any)

    mockAbility.mockReturnValue(true)

    mockGenerateObject.mockResolvedValue({
      object: mockAnalysisAndTranslation,
      usage: {
        totalTokens: 1000,
        promptTokens: 600,
        completionTokens: 400
      },
      finishReason: 'stop',
      warnings: [],
      request: {} as any,
      response: {} as any,
      id: 'mock-id',
      createdAt: new Date()
    } as any)

    // Create a mock implementation for streamObject
    mockStreamObject.mockReturnValue({
      fullStream: createMockAsyncIterator([
        { type: 'object', object: mockTranslatedBlocks }
      ])
    } as any)

    mockGetCardBlocksContent.mockResolvedValue(mockCardBlocksContent)
  })

  it('should translate a journey successfully', async () => {
    // Call the mutation via test client
    const result = await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: {
        input: mockInput
      }
    })

    // Verify journey was retrieved
    expect(prismaMock.journey.findUnique).toHaveBeenCalledWith({
      where: { id: mockInput.journeyId },
      include: expect.objectContaining({
        blocks: true,
        userJourneys: true
      })
    })

    // Verify permissions were checked
    expect(mockAbility).toHaveBeenCalledWith(Action.Update, undefined, mockUser)

    // Verify AI analysis was requested
    expect(mockGenerateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'mocked-google-model',
        messages: expect.arrayContaining([
          { role: 'system', content: expect.any(String) },
          { role: 'user', content: expect.any(String) }
        ])
      })
    )

    // Verify journey was updated with translation
    expect(prismaMock.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockInput.journeyId },
        data: expect.objectContaining({
          title: mockAnalysisAndTranslation.title,
          description: mockAnalysisAndTranslation.description,
          languageId: mockInput.textLanguageId
        })
      })
    )

    // Verify block translations were processed
    // We should have 5 blocks to update from our mock data
    expect(prismaMock.block.update).toHaveBeenCalledTimes(
      mockTranslatedBlocks.length
    )

    // Verify specific block updates
    mockTranslatedBlocks.forEach((block) => {
      expect(prismaMock.block.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: block.blockId,
            journeyId: mockInput.journeyId
          }),
          data: block.updates
        })
      )
    })

    // Verify the result
    expect(result).toEqual({
      data: {
        journeyAiTranslateCreate: {
          id: mockJourneyId,
          title: mockJourney.title,
          description: mockJourney.description
        }
      }
    })
  })

  it('should throw an error if journey is not found', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce(null)

    const result = await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: {
        input: mockInput
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'journey not found'
        })
      ]
    })

    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  it('should throw an error if user lacks permission', async () => {
    mockAbility.mockReturnValueOnce(false)

    const result = await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: {
        input: mockInput
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user does not have permission to update journey'
        })
      ]
    })

    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  it('should throw an error if title translation fails', async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: {
        ...mockAnalysisAndTranslation,
        title: '' // Empty title
      },
      usage: {
        totalTokens: 1000,
        promptTokens: 600,
        completionTokens: 400
      },
      finishReason: 'stop',
      warnings: [],
      request: {} as any,
      response: {} as any,
      id: 'mock-id',
      createdAt: new Date()
    } as any)

    const result = await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: {
        input: mockInput
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [expect.any(Error)]
    })

    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  it('should not require description translation if original has no description', async () => {
    // Update mock journey to have no description
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      description: null
    } as any)

    // Make sure the update function returns the right data
    prismaMock.journey.update.mockResolvedValueOnce({
      ...mockJourney,
      description: null,
      title: mockAnalysisAndTranslation.title,
      languageId: mockInput.textLanguageId
    } as any)

    mockGenerateObject.mockResolvedValueOnce({
      object: {
        ...mockAnalysisAndTranslation,
        description: '' // Empty description
      },
      usage: {
        totalTokens: 1000,
        promptTokens: 600,
        completionTokens: 400
      },
      finishReason: 'stop',
      warnings: [],
      request: {} as any,
      response: {} as any,
      id: 'mock-id',
      createdAt: new Date()
    } as any)

    const result = await authClient({
      document: graphql(`
        mutation JourneyAiTranslateCreate($input: JourneyAiTranslateInput!) {
          journeyAiTranslateCreate(input: $input) {
            id
            title
          }
        }
      `),
      variables: {
        input: mockInput
      }
    })

    // Verify journey update was called with the right data
    expect(prismaMock.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockInput.journeyId },
        data: expect.not.objectContaining({
          description: expect.anything()
        })
      })
    )

    expect(result).toEqual({
      data: {
        journeyAiTranslateCreate: {
          id: mockJourneyId,
          title: mockJourney.title
        }
      }
    })
  })

  it('should handle errors during card translation and continue with other cards', async () => {
    // Make stream throw an error
    mockStreamObject.mockReturnValueOnce({
      fullStream: createMockAsyncIterator([
        { type: 'error', error: new Error('Translation error') }
      ])
    } as any)

    // Create a journey with multiple card blocks
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      blocks: [
        ...mockJourney.blocks,
        {
          id: 'card2',
          typename: 'CardBlock',
          parentOrder: 1
        },
        {
          id: 'typography2',
          typename: 'TypographyBlock',
          parentBlockId: 'card2',
          content: 'Another text block'
        }
      ]
    } as any)

    // Update cardBlocksContent to have content for both cards
    mockGetCardBlocksContent.mockResolvedValueOnce([
      'Card 1 content',
      'Card 2 content'
    ])

    // Second stream call should succeed
    mockStreamObject.mockReturnValueOnce({
      fullStream: createMockAsyncIterator([
        {
          type: 'object',
          object: [
            {
              blockId: 'typography2',
              updates: { content: 'Otro contenido de texto' }
            }
          ]
        }
      ])
    } as any)

    const result = await authClient({
      document: graphql(`
        mutation JourneyAiTranslateCreate($input: JourneyAiTranslateInput!) {
          journeyAiTranslateCreate(input: $input) {
            id
          }
        }
      `),
      variables: {
        input: mockInput
      }
    })

    // Journey update should still have happened
    expect(prismaMock.journey.update).toHaveBeenCalledWith(expect.any(Object))

    // Block update should have been called for the second card
    expect(prismaMock.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'typography2'
        })
      })
    )

    expect(result).toEqual({
      data: {
        journeyAiTranslateCreate: {
          id: mockJourneyId
        }
      }
    })
  })
})

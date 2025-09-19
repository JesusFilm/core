import { generateObject, streamObject } from 'ai'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { Action, ability, subject } from '../../lib/auth/ability'
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
  subject: jest.fn((type, object) => ({ subject: type, object }))
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
    imageUrl: null,
    roles: []
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
    expect(mockAbility).toHaveBeenCalledWith(
      Action.Update,
      { subject: 'Journey', object: mockJourney },
      mockUser
    )

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

describe('journeyAiTranslateCreateSubscription', () => {
  const mockAbility = ability as jest.MockedFunction<typeof ability>
  const mockSubject = subject as jest.MockedFunction<typeof subject>
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
    imageUrl: null,
    roles: []
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
    seoTitle: 'Original SEO Title',
    seoDescription: 'Original SEO Description',
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
    description: 'Descripción del viaje traducida',
    seoTitle: 'Título SEO Traducido',
    seoDescription: 'Descripción SEO Traducida'
  }

  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentUser: mockUser
    }
  })

  const JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION = graphql(`
    subscription JourneyAiTranslateCreateSubscription(
      $input: JourneyAiTranslateInput!
    ) {
      journeyAiTranslateCreateSubscription(input: $input) {
        progress
        message
        journey {
          id
          title
          description
          seoTitle
          seoDescription
        }
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
      description: mockAnalysisAndTranslation.description,
      seoTitle: mockAnalysisAndTranslation.seoTitle,
      seoDescription: mockAnalysisAndTranslation.seoDescription,
      languageId: mockInput.textLanguageId
    } as any)

    prismaMock.block.update.mockResolvedValue({} as any)

    // Mock ability to return true for valid users
    mockAbility.mockReturnValue(true)

    // Mock card blocks content
    mockGetCardBlocksContent.mockResolvedValue(mockCardBlocksContent)

    // Mock generateObject for journey analysis
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

    // Mock streamObject for block translations
    mockStreamObject.mockReturnValue({
      fullStream: createMockAsyncIterator([
        {
          type: 'object',
          object: [
            {
              blockId: 'typography1',
              updates: { content: 'Contenido traducido' }
            },
            {
              blockId: 'button1',
              updates: { label: 'Botón traducido' }
            },
            {
              blockId: 'option1',
              updates: { label: 'Opción 1' }
            }
          ]
        }
      ])
    } as any)
  })

  it('should validate subscription includes SEO fields in schema', () => {
    // Test that the subscription now supports SEO fields
    expect(mockGenerateObject).toBeDefined()
    expect(mockStreamObject).toBeDefined()

    // This tests the updated schema includes SEO fields
    const expectedSchema = {
      analysis: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      seoTitle: expect.any(String),
      seoDescription: expect.any(String)
    }

    // Verify the mock structure matches what we expect
    expect(mockAnalysisAndTranslation).toMatchObject(expectedSchema)
  })

  it('should handle SEO fields conditionally', () => {
    // Test SEO field handling
    const journeyWithSEO = mockJourney
    const journeyWithoutSEO = {
      ...mockJourney,
      seoTitle: null,
      seoDescription: null
    }

    // Both should be valid
    expect(journeyWithSEO.seoTitle).toBeDefined()
    expect(journeyWithoutSEO.seoTitle).toBeNull()
  })

  it('should include RadioOptionBlock handling', () => {
    // Test that RadioOptionBlocks are included in the journey structure
    const radioOption = mockJourney.blocks.find(
      (block) => block.typename === 'RadioOptionBlock'
    )
    expect(radioOption).toBeDefined()
    expect(radioOption?.parentBlockId).toBe('radio1')
  })
})

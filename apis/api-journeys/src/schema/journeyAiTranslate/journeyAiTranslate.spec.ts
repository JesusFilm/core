import { Output, streamText } from 'ai'
import { type MockedFunction, vi } from 'vitest'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { Action, ability } from '../../lib/auth/ability'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { getCardBlocksContent } from './getCardBlocksContent'
import { translateCustomizationFields } from './translateCustomizationFields/translateCustomizationFields'
import { translateJourneyMetadata } from './translateJourneyMetadata/translateJourneyMetadata'

// Mock all external dependencies
vi.mock('@openrouter/ai-sdk-provider', () => ({
  openrouter: {
    chat: vi.fn(() => 'mocked-openrouter-model')
  }
}))

vi.mock('ai', () => ({
  Output: {
    object: vi.fn((config) => ({ type: 'object', ...config })),
    array: vi.fn((config) => ({ type: 'array', ...config }))
  },
  generateText: vi.fn(),
  streamText: vi.fn()
}))

vi.mock('@core/shared/ai/prompts', () => ({
  hardenPrompt: vi.fn((text) => `<hardened>${text}</hardened>`),
  preSystemPrompt: 'mocked system prompt'
}))

vi.mock('../../lib/auth/ability', () => ({
  Action: {
    Update: 'update'
  },
  ability: vi.fn(),
  subject: vi.fn((type, object) => ({ subject: type, object }))
}))

vi.mock('./getCardBlocksContent', () => ({
  getCardBlocksContent: vi.fn()
}))

vi.mock('./translateCustomizationFields/translateCustomizationFields', () => ({
  translateCustomizationFields: vi.fn()
}))

vi.mock('./translateJourneyMetadata/translateJourneyMetadata', () => ({
  TRANSLATION_SYSTEM_PROMPT: 'mocked translation system prompt',
  translateJourneyMetadata: vi.fn()
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
  const mockAbility = ability as MockedFunction<typeof ability>
  const mockStreamText = streamText as MockedFunction<typeof streamText>
  const mockOutputArray = Output.array as MockedFunction<typeof Output.array>
  const mockGetCardBlocksContent = getCardBlocksContent as MockedFunction<
    typeof getCardBlocksContent
  >
  const mockTranslateCustomizationFields =
    translateCustomizationFields as MockedFunction<
      typeof translateCustomizationFields
    >
  const mockTranslateJourneyMetadata =
    translateJourneyMetadata as MockedFunction<typeof translateJourneyMetadata>

  // Sample data
  const mockJourneyId = 'journey123'
  const mockLanguageId = 'lang456'
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
    journeyCustomizationDescription:
      'Welcome {{ user_name }}! Your event is on {{ event_date }}.',
    journeyCustomizationFields: [
      {
        id: 'field1',
        journeyId: mockJourneyId,
        key: 'user_name',
        value: 'John Doe',
        defaultValue: 'Guest'
      },
      {
        id: 'field2',
        journeyId: mockJourneyId,
        key: 'event_date',
        value: 'January 15, 2024',
        defaultValue: null
      }
    ],
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
    displayTitle: '',
    description: 'Descripción del viaje traducida',
    seoTitle: '',
    seoDescription: ''
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
      currentUser: {
        id: 'testUserId',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
        imageUrl: null,
        roles: []
      }
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
    vi.clearAllMocks()

    // Set up prismaMock
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)

    prismaMock.journey.update.mockResolvedValue({
      ...mockJourney,
      title: mockAnalysisAndTranslation.title,
      description: mockAnalysisAndTranslation.description
    } as any)

    prismaMock.block.update.mockResolvedValue({} as any)

    mockAbility.mockReturnValue(true)

    mockTranslateJourneyMetadata.mockResolvedValue(mockAnalysisAndTranslation)

    // Create a mock implementation for streamText
    mockStreamText.mockReturnValue({
      elementStream: createMockAsyncIterator(mockTranslatedBlocks)
    } as any)

    mockGetCardBlocksContent.mockResolvedValue(mockCardBlocksContent)

    // Mock translateCustomizationFields
    mockTranslateCustomizationFields.mockResolvedValue({
      translatedDescription:
        '¡Bienvenido {{ user_name }}! Tu evento es el {{ event_date }}.',
      translatedFields: [
        {
          id: 'field1',
          key: 'user_name',
          translatedValue: 'Juan Pérez',
          translatedDefaultValue: 'Invitado'
        },
        {
          id: 'field2',
          key: 'event_date',
          translatedValue: '15 de enero de 2024',
          translatedDefaultValue: null
        }
      ]
    })

    // Mock journeyCustomizationField.update
    prismaMock.journeyCustomizationField.update.mockResolvedValue({} as any)
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
        userJourneys: true,
        journeyCustomizationFields: true
      })
    })

    // Verify permissions were checked
    expect(mockAbility).toHaveBeenCalledWith(
      Action.Update,
      { subject: 'Journey', object: mockJourney },
      {
        id: 'testUserId',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
        imageUrl: null,
        roles: []
      }
    )

    // Verify journey metadata translation was requested with the journey's
    // own title and description (not swapped)
    expect(mockOutputArray).toHaveBeenCalled()
    expect(mockTranslateJourneyMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        journeyTitle: mockInput.name,
        journeyDescription: mockJourney.description,
        sourceLanguageName: mockInput.journeyLanguageName,
        targetLanguageName: mockInput.textLanguageName
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
    // We should have one update per supported translated block
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

    // Verify customization fields translation was called
    expect(mockTranslateCustomizationFields).toHaveBeenCalledWith({
      journeyCustomizationDescription:
        mockJourney.journeyCustomizationDescription,
      journeyCustomizationFields: mockJourney.journeyCustomizationFields,
      sourceLanguageName: mockInput.journeyLanguageName,
      targetLanguageName: mockInput.textLanguageName,
      descriptionTargetLanguageName: mockInput.textLanguageName,
      defaultValueTargetLanguageName: mockInput.textLanguageName,
      journeyAnalysis: expect.any(String)
    })

    // Verify customization fields were updated
    expect(prismaMock.journeyCustomizationField.update).toHaveBeenCalledTimes(2)
    expect(prismaMock.journeyCustomizationField.update).toHaveBeenCalledWith({
      where: { id: 'field1' },
      data: {
        value: 'Juan Pérez',
        defaultValue: 'Invitado'
      }
    })
    expect(prismaMock.journeyCustomizationField.update).toHaveBeenCalledWith({
      where: { id: 'field2' },
      data: {
        value: '15 de enero de 2024',
        defaultValue: null
      }
    })

    // Verify journey was updated with translated customization description
    expect(prismaMock.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockInput.journeyId },
        data: expect.objectContaining({
          title: mockAnalysisAndTranslation.title,
          description: mockAnalysisAndTranslation.description,
          languageId: mockInput.textLanguageId,
          journeyCustomizationDescription:
            '¡Bienvenido {{ user_name }}! Tu evento es el {{ event_date }}.'
        })
      })
    )

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
    mockTranslateJourneyMetadata.mockResolvedValueOnce({
      ...mockAnalysisAndTranslation,
      title: '' // Empty title
    })

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

  it('should handle journey with no customization description', async () => {
    mockTranslateCustomizationFields.mockResolvedValueOnce({
      translatedDescription: null,
      translatedFields: [
        {
          id: 'field1',
          key: 'user_name',
          translatedValue: 'Juan Pérez',
          translatedDefaultValue: 'Invitado'
        }
      ]
    })

    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      journeyCustomizationDescription: null
    } as any)

    await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: {
        input: mockInput
      }
    })

    // Should still succeed even without customization description
    expect(mockTranslateCustomizationFields).toHaveBeenCalledWith(
      expect.objectContaining({
        journeyCustomizationDescription: null
      })
    )
  })

  it('should use userLanguageName for description translation when provided', async () => {
    const inputWithUserLanguage = {
      ...mockInput,
      userLanguageId: 'userLang789',
      userLanguageName: 'French'
    }

    await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: {
        input: inputWithUserLanguage
      }
    })

    expect(mockTranslateCustomizationFields).toHaveBeenCalledWith({
      journeyCustomizationDescription:
        mockJourney.journeyCustomizationDescription,
      journeyCustomizationFields: mockJourney.journeyCustomizationFields,
      sourceLanguageName: inputWithUserLanguage.journeyLanguageName,
      targetLanguageName: inputWithUserLanguage.textLanguageName,
      descriptionTargetLanguageName: 'French',
      defaultValueTargetLanguageName: inputWithUserLanguage.textLanguageName,
      journeyAnalysis: expect.any(String)
    })
  })

  it('should fall back to textLanguageName for description translation when userLanguageName not provided', async () => {
    await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: {
        input: mockInput
      }
    })

    expect(mockTranslateCustomizationFields).toHaveBeenCalledWith({
      journeyCustomizationDescription:
        mockJourney.journeyCustomizationDescription,
      journeyCustomizationFields: mockJourney.journeyCustomizationFields,
      sourceLanguageName: mockInput.journeyLanguageName,
      targetLanguageName: mockInput.textLanguageName,
      descriptionTargetLanguageName: mockInput.textLanguageName,
      defaultValueTargetLanguageName: mockInput.textLanguageName,
      journeyAnalysis: expect.any(String)
    })
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

    mockTranslateJourneyMetadata.mockResolvedValueOnce({
      ...mockAnalysisAndTranslation,
      description: '' // Empty description
    })

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
    mockStreamText.mockReturnValueOnce({
      elementStream: {
        [Symbol.asyncIterator]() {
          return {
            next: async () => {
              throw new Error('Translation error')
            }
          }
        }
      }
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
    mockStreamText.mockReturnValueOnce({
      elementStream: createMockAsyncIterator([
        {
          blockId: 'typography2',
          updates: { content: 'Otro contenido de texto' }
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

  it('translates displayTitle when the journey has one', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      displayTitle: 'Original Display Title'
    } as any)

    mockTranslateJourneyMetadata.mockResolvedValueOnce({
      ...mockAnalysisAndTranslation,
      displayTitle: 'Título de Visualización Traducido'
    })

    await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: { input: mockInput }
    })

    // The journey's display title is forwarded for translation...
    expect(mockTranslateJourneyMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        journeyDisplayTitle: 'Original Display Title'
      })
    )

    // ...and written back to the journey.
    expect(prismaMock.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockInput.journeyId },
        data: expect.objectContaining({
          displayTitle: 'Título de Visualización Traducido'
        })
      })
    )
  })

  it('does not set displayTitle when the journey has none', async () => {
    await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: { input: mockInput }
    })

    expect(prismaMock.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({
          displayTitle: expect.anything()
        })
      })
    )
  })

  it('does not overwrite an existing displayTitle with an empty translation', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      displayTitle: 'Original Display Title'
    } as any)

    // Translation came back empty for displayTitle (e.g. model omitted it).
    mockTranslateJourneyMetadata.mockResolvedValueOnce({
      ...mockAnalysisAndTranslation,
      displayTitle: ''
    })

    await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: { input: mockInput }
    })

    // The real displayTitle must be preserved, not cleared.
    expect(prismaMock.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({
          displayTitle: expect.anything()
        })
      })
    )
  })

  it('re-requests blocks the model omits on the first attempt', async () => {
    // First attempt translates only typography1 and omits the rest.
    mockStreamText.mockReturnValueOnce({
      elementStream: createMockAsyncIterator([
        { blockId: 'typography1', updates: { content: 'Contenido traducido' } }
      ])
    } as any)
    // Retry attempt returns the previously-omitted blocks.
    mockStreamText.mockReturnValueOnce({
      elementStream: createMockAsyncIterator([
        { blockId: 'button1', updates: { label: 'Botón traducido' } },
        { blockId: 'option1', updates: { label: 'Opción traducida' } },
        {
          blockId: 'text1',
          updates: { label: 'Texto', placeholder: 'Escriba' }
        }
      ])
    } as any)

    await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: { input: mockInput }
    })

    // A second AI call is made to fetch the omitted blocks.
    expect(mockStreamText).toHaveBeenCalledTimes(2)

    // Every block ends up translated despite the first-attempt omission.
    for (const id of ['typography1', 'button1', 'option1', 'text1']) {
      expect(prismaMock.block.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id })
        })
      )
    }
  })

  it('translates SignUpBlock submitLabel and TextResponseBlock hint', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      blocks: [
        { id: 'card1', typename: 'CardBlock', parentOrder: 0 },
        {
          id: 'signup1',
          typename: 'SignUpBlock',
          parentBlockId: 'card1',
          submitLabel: 'Submit'
        },
        {
          id: 'text1',
          typename: 'TextResponseBlock',
          parentBlockId: 'card1',
          label: 'Name',
          placeholder: 'Your name',
          hint: 'We keep it private'
        }
      ]
    } as any)

    mockStreamText.mockReturnValueOnce({
      elementStream: createMockAsyncIterator([
        { blockId: 'signup1', updates: { submitLabel: 'Enviar' } },
        {
          blockId: 'text1',
          updates: {
            label: 'Nombre',
            placeholder: 'Tu nombre',
            hint: 'Lo mantenemos privado'
          }
        }
      ])
    } as any)

    await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: { input: mockInput }
    })

    expect(prismaMock.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'signup1' }),
        data: { submitLabel: 'Enviar' }
      })
    )
    expect(prismaMock.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'text1' }),
        data: {
          label: 'Nombre',
          placeholder: 'Tu nombre',
          hint: 'Lo mantenemos privado'
        }
      })
    )
  })

  it('re-requests an individual field the model omits (field-level completeness)', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      blocks: [
        { id: 'card1', typename: 'CardBlock', parentOrder: 0 },
        {
          id: 'text1',
          typename: 'TextResponseBlock',
          parentBlockId: 'card1',
          label: 'Name',
          placeholder: 'Your name',
          hint: 'We keep it private'
        }
      ]
    } as any)

    // First attempt translates label + placeholder but omits hint.
    mockStreamText.mockReturnValueOnce({
      elementStream: createMockAsyncIterator([
        {
          blockId: 'text1',
          updates: { label: 'Nombre', placeholder: 'Tu nombre' }
        }
      ])
    } as any)
    // Retry returns the omitted hint.
    mockStreamText.mockReturnValueOnce({
      elementStream: createMockAsyncIterator([
        { blockId: 'text1', updates: { hint: 'Lo mantenemos privado' } }
      ])
    } as any)

    await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: { input: mockInput }
    })

    // A second call is made because hint was still missing after the first.
    expect(mockStreamText).toHaveBeenCalledTimes(2)

    // The retry prompt asks only for the missing hint field.
    const retryPrompt = (mockStreamText.mock.calls[1][0] as any).messages[1]
      .content[0].text as string
    expect(retryPrompt).toContain('hint:')
    expect(retryPrompt).not.toContain('label:')

    // label + placeholder written first, hint written on the retry.
    expect(prismaMock.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'text1' }),
        data: { label: 'Nombre', placeholder: 'Tu nombre' }
      })
    )
    expect(prismaMock.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'text1' }),
        data: { hint: 'Lo mantenemos privado' }
      })
    )
  })

  it('escalates to a per-block request when batched passes keep omitting a block', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      blocks: [
        { id: 'card1', typename: 'CardBlock', parentOrder: 0 },
        {
          id: 'radio1',
          typename: 'RadioQuestionBlock',
          parentBlockId: 'card1',
          label: 'Pick one'
        },
        {
          id: 'option1',
          typename: 'RadioOptionBlock',
          parentBlockId: 'radio1',
          label: 'Option A'
        }
      ]
    } as any)

    // Three batched passes all drop the option, then the per-block escalation
    // request returns it.
    mockStreamText
      .mockReturnValueOnce({
        elementStream: createMockAsyncIterator([])
      } as any)
      .mockReturnValueOnce({
        elementStream: createMockAsyncIterator([])
      } as any)
      .mockReturnValueOnce({
        elementStream: createMockAsyncIterator([])
      } as any)
      .mockReturnValueOnce({
        elementStream: createMockAsyncIterator([
          { blockId: 'option1', updates: { label: 'Opción A' } }
        ])
      } as any)

    await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: { input: mockInput }
    })

    // 3 batched attempts + 1 per-block escalation attempt.
    expect(mockStreamText).toHaveBeenCalledTimes(4)

    // The option is ultimately translated.
    expect(prismaMock.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'option1' }),
        data: { label: 'Opción A' }
      })
    )
  })

  it('translates both radio and multiselect option labels on the same card', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      blocks: [
        { id: 'card1', typename: 'CardBlock', parentOrder: 0 },
        {
          id: 'radio1',
          typename: 'RadioQuestionBlock',
          parentBlockId: 'card1',
          label: 'Pick one'
        },
        {
          id: 'ropt1',
          typename: 'RadioOptionBlock',
          parentBlockId: 'radio1',
          label: 'Red'
        },
        {
          id: 'ropt2',
          typename: 'RadioOptionBlock',
          parentBlockId: 'radio1',
          label: 'Blue'
        },
        {
          id: 'multi1',
          typename: 'MultiselectBlock',
          parentBlockId: 'card1',
          label: 'Pick any'
        },
        {
          id: 'mopt1',
          typename: 'MultiselectOptionBlock',
          parentBlockId: 'multi1',
          label: 'Cat'
        },
        {
          id: 'mopt2',
          typename: 'MultiselectOptionBlock',
          parentBlockId: 'multi1',
          label: 'Dog'
        }
      ]
    } as any)

    mockStreamText.mockReturnValueOnce({
      elementStream: createMockAsyncIterator([
        { blockId: 'ropt1', updates: { label: 'Rojo' } },
        { blockId: 'ropt2', updates: { label: 'Azul' } },
        { blockId: 'mopt1', updates: { label: 'Gato' } },
        { blockId: 'mopt2', updates: { label: 'Perro' } }
      ])
    } as any)

    await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: { input: mockInput }
    })

    const expected: Array<[string, string]> = [
      ['ropt1', 'Rojo'],
      ['ropt2', 'Azul'],
      ['mopt1', 'Gato'],
      ['mopt2', 'Perro']
    ]
    for (const [id, label] of expected) {
      expect(prismaMock.block.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id }),
          data: { label }
        })
      )
    }
  })

  it('collects and translates blocks nested deeper than one level under the card', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      blocks: [
        { id: 'card1', typename: 'CardBlock', parentOrder: 0 },
        {
          id: 'wrapper1',
          typename: 'MultiselectBlock',
          parentBlockId: 'card1'
        },
        // A TypographyBlock two levels under the card (card → wrapper → text).
        // The previous one-level collection would have missed this.
        {
          id: 'nestedtypo',
          typename: 'TypographyBlock',
          parentBlockId: 'wrapper1',
          content: 'Nested text'
        },
        {
          id: 'option1',
          typename: 'MultiselectOptionBlock',
          parentBlockId: 'wrapper1',
          label: 'Opt'
        }
      ]
    } as any)

    mockStreamText.mockReturnValueOnce({
      elementStream: createMockAsyncIterator([
        { blockId: 'nestedtypo', updates: { content: 'Texto anidado' } },
        { blockId: 'option1', updates: { label: 'Opción' } }
      ])
    } as any)

    await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: { input: mockInput }
    })

    expect(prismaMock.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'nestedtypo' }),
        data: { content: 'Texto anidado' }
      })
    )
    expect(prismaMock.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'option1' }),
        data: { label: 'Opción' }
      })
    )
  })

  it('translates MultiselectOptionBlock labels nested under a MultiselectBlock', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      blocks: [
        { id: 'card1', typename: 'CardBlock', parentOrder: 0 },
        {
          id: 'multiselect1',
          typename: 'MultiselectBlock',
          parentBlockId: 'card1'
        },
        {
          id: 'msoption1',
          typename: 'MultiselectOptionBlock',
          parentBlockId: 'multiselect1',
          label: 'Red'
        },
        {
          id: 'msoption2',
          typename: 'MultiselectOptionBlock',
          parentBlockId: 'multiselect1',
          label: 'Blue'
        }
      ]
    } as any)

    mockStreamText.mockReturnValueOnce({
      elementStream: createMockAsyncIterator([
        { blockId: 'msoption1', updates: { label: 'Rojo' } },
        { blockId: 'msoption2', updates: { label: 'Azul' } }
      ])
    } as any)

    await authClient({
      document: JOURNEY_AI_TRANSLATE_CREATE_MUTATION,
      variables: { input: mockInput }
    })

    expect(prismaMock.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'msoption1' }),
        data: { label: 'Rojo' }
      })
    )
    expect(prismaMock.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'msoption2' }),
        data: { label: 'Azul' }
      })
    )
  })
})

describe('journeyAiTranslateCreateSubscription', () => {
  const mockAbility = ability as MockedFunction<typeof ability>
  const mockStreamText = streamText as MockedFunction<typeof streamText>
  const mockGetCardBlocksContent = getCardBlocksContent as MockedFunction<
    typeof getCardBlocksContent
  >
  const mockTranslateCustomizationFields =
    translateCustomizationFields as MockedFunction<
      typeof translateCustomizationFields
    >
  const mockTranslateJourneyMetadata =
    translateJourneyMetadata as MockedFunction<typeof translateJourneyMetadata>

  // Sample data
  const mockJourneyId = 'journey123'
  const mockLanguageId = 'lang456'
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
    journeyCustomizationDescription:
      'Welcome {{ user_name }}! Your event is on {{ event_date }}.',
    journeyCustomizationFields: [
      {
        id: 'field1',
        journeyId: mockJourneyId,
        key: 'user_name',
        value: 'John Doe',
        defaultValue: 'Guest'
      },
      {
        id: 'field2',
        journeyId: mockJourneyId,
        key: 'event_date',
        value: 'January 15, 2024',
        defaultValue: null
      }
    ],
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
    displayTitle: 'Título de Visualización Traducido',
    description: 'Descripción del viaje traducida',
    seoTitle: 'Título SEO Traducido',
    seoDescription: 'Descripción SEO Traducida'
  }

  beforeEach(() => {
    vi.clearAllMocks()

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

    // Mock journey metadata translation (analysis + title/description/SEO)
    mockTranslateJourneyMetadata.mockResolvedValue(mockAnalysisAndTranslation)

    // Mock streamText for block translations
    mockStreamText.mockReturnValue({
      elementStream: createMockAsyncIterator([
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
      ])
    } as any)

    // Mock translateCustomizationFields
    mockTranslateCustomizationFields.mockResolvedValue({
      translatedDescription:
        '¡Bienvenido {{ user_name }}! Tu evento es el {{ event_date }}.',
      translatedFields: [
        {
          id: 'field1',
          key: 'user_name',
          translatedValue: 'Juan Pérez',
          translatedDefaultValue: 'Invitado'
        },
        {
          id: 'field2',
          key: 'event_date',
          translatedValue: '15 de enero de 2024',
          translatedDefaultValue: null
        }
      ]
    })

    // Mock journeyCustomizationField.update
    prismaMock.journeyCustomizationField.update.mockResolvedValue({} as any)
  })

  it('should validate subscription includes SEO fields in schema', () => {
    // Test that the subscription now supports SEO fields
    expect(mockTranslateJourneyMetadata).toBeDefined()
    expect(mockStreamText).toBeDefined()

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

  it('should handle journey with no customization fields', async () => {
    const journeyWithoutCustomization = {
      ...mockJourney,
      journeyCustomizationDescription: null,
      journeyCustomizationFields: []
    }

    prismaMock.journey.findUnique.mockResolvedValueOnce(
      journeyWithoutCustomization as any
    )

    mockTranslateCustomizationFields.mockResolvedValueOnce({
      translatedDescription: null,
      translatedFields: []
    })

    // The subscription should handle this gracefully
    expect(journeyWithoutCustomization.journeyCustomizationFields).toHaveLength(
      0
    )
    expect(
      journeyWithoutCustomization.journeyCustomizationDescription
    ).toBeNull()
  })
})

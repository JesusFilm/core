import { generateText } from 'ai'

import { translateCustomizationFields } from './translateCustomizationFields'

jest.mock('@openrouter/ai-sdk-provider', () => ({
  openrouter: {
    chat: jest.fn(() => 'mocked-openrouter-model')
  }
}))

jest.mock('ai', () => ({
  Output: { object: jest.fn(({ schema }) => ({ schema })) },
  generateText: jest.fn()
}))

jest.mock('@core/shared/ai/prompts', () => ({
  hardenPrompt: jest.fn((text) => `<hardened>${text}</hardened>`),
  preSystemPrompt: 'mocked system prompt'
}))

const baseMockResponse = {
  usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
  finishReason: 'stop',
  warnings: [],
  request: {} as any,
  response: {} as any,
  id: 'mock-id',
  createdAt: new Date()
}

describe('translateCustomizationFields', () => {
  const mockGenerateText = generateText as jest.MockedFunction<
    typeof generateText
  >

  const mockJourneyCustomizationFields = [
    {
      id: 'field1',
      journeyId: 'journey123',
      key: 'user_name',
      value: 'John Doe',
      defaultValue: 'Guest',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'field2',
      journeyId: 'journey123',
      key: 'event_date',
      value: 'January 15, 2024',
      defaultValue: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'field3',
      journeyId: 'journey123',
      key: 'location',
      value: null,
      defaultValue: 'New York',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should translate customization fields and description', async () => {
    const description =
      'Welcome {{ user_name }}! Your event is on {{ event_date }} at {{ location }}.'
    const sourceLanguageName = 'English'
    const targetLanguageName = 'Spanish'

    mockGenerateText.mockImplementation(async (options: any) => {
      const prompt = options.messages[1].content[0].text

      if (prompt.includes('customization description')) {
        return {
          output: {
            translatedDescription:
              '¡Bienvenido {{ user_name }}! Tu evento es el {{ event_date }} en {{ location }}.'
          },
          ...baseMockResponse
        } as any
      }

      // Batch translation of values: ["John Doe", "January 15, 2024"]
      if (prompt.includes('John Doe') && prompt.includes('January 15, 2024')) {
        return {
          output: {
            translations: ['Juan Pérez', '15 de enero de 2024']
          },
          ...baseMockResponse
        } as any
      }

      // Batch translation of defaultValues: ["Guest", "New York"]
      if (prompt.includes('Guest') && prompt.includes('New York')) {
        return {
          output: { translations: ['Invitado', 'Nueva York'] },
          ...baseMockResponse
        } as any
      }

      return {
        output: { translations: ['Translated Value'] },
        ...baseMockResponse
      } as any
    })

    const result = await translateCustomizationFields({
      journeyCustomizationDescription: description,
      journeyCustomizationFields: mockJourneyCustomizationFields,
      sourceLanguageName,
      targetLanguageName
    })

    expect(result.translatedDescription).toBe(
      '¡Bienvenido {{ user_name }}! Tu evento es el {{ event_date }} en {{ location }}.'
    )
    expect(result.translatedFields).toHaveLength(3)
    expect(result.translatedFields[0]).toEqual({
      id: 'field1',
      key: 'user_name',
      translatedValue: 'Juan Pérez',
      translatedDefaultValue: 'Invitado'
    })
    expect(result.translatedFields[1]).toEqual({
      id: 'field2',
      key: 'event_date',
      translatedValue: '15 de enero de 2024',
      translatedDefaultValue: null
    })
    expect(result.translatedFields[2]).toEqual({
      id: 'field3',
      key: 'location',
      translatedValue: null,
      translatedDefaultValue: 'Nueva York'
    })

    // 3 calls: 1 batch for values, 1 batch for defaultValues, 1 for description
    expect(mockGenerateText).toHaveBeenCalledTimes(3)
  })

  it('should handle null customization description', async () => {
    // field1 has both value and defaultValue, so 2 batch calls
    mockGenerateText.mockImplementation(async (options: any) => {
      const prompt = options.messages[1].content[0].text

      if (prompt.includes('John Doe')) {
        return {
          output: { translations: ['Juan Pérez'] },
          ...baseMockResponse
        } as any
      }
      if (prompt.includes('Guest')) {
        return {
          output: { translations: ['Invitado'] },
          ...baseMockResponse
        } as any
      }

      return {
        output: { translations: ['Translated'] },
        ...baseMockResponse
      } as any
    })

    const result = await translateCustomizationFields({
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [mockJourneyCustomizationFields[0]],
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish'
    })

    expect(result.translatedDescription).toBeNull()
    expect(result.translatedFields).toHaveLength(1)
    expect(result.translatedFields[0]).toEqual({
      id: 'field1',
      key: 'user_name',
      translatedValue: 'Juan Pérez',
      translatedDefaultValue: 'Invitado'
    })
    // 2 batch calls: one for values, one for defaultValues (no description)
    expect(mockGenerateText).toHaveBeenCalledTimes(2)
  })

  it('should handle empty customization fields array', async () => {
    mockGenerateText.mockResolvedValueOnce({
      output: {
        translatedDescription: 'Translated description'
      },
      ...baseMockResponse
    } as any)

    const result = await translateCustomizationFields({
      journeyCustomizationDescription: 'Welcome!',
      journeyCustomizationFields: [],
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish'
    })

    expect(result.translatedDescription).toBe('Translated description')
    expect(result.translatedFields).toHaveLength(0)
    // Only description translation should be called
    expect(mockGenerateText).toHaveBeenCalledTimes(1)
  })

  it('should skip fields with no value or defaultValue', async () => {
    const fieldsWithNoValues = [
      {
        id: 'field1',
        journeyId: 'journey123',
        key: 'empty_field',
        value: null,
        defaultValue: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    mockGenerateText.mockResolvedValueOnce({
      output: {
        translatedDescription: 'Translated description'
      },
      ...baseMockResponse
    } as any)

    const result = await translateCustomizationFields({
      journeyCustomizationDescription: 'Welcome!',
      journeyCustomizationFields: fieldsWithNoValues,
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish'
    })

    expect(result.translatedFields).toHaveLength(0)
    // Only description translation should be called
    expect(mockGenerateText).toHaveBeenCalledTimes(1)
  })

  it('should preserve text inside curly braces in description', async () => {
    const description =
      'Hello {{ user_name }}, your code is {{ code: ABC123 }}.'
    const sourceLanguageName = 'English'
    const targetLanguageName = 'Spanish'

    mockGenerateText.mockResolvedValueOnce({
      output: {
        translatedDescription:
          'Hola {{ user_name }}, tu código es {{ code: ABC123 }}.'
      },
      ...baseMockResponse
    } as any)

    const result = await translateCustomizationFields({
      journeyCustomizationDescription: description,
      journeyCustomizationFields: [],
      sourceLanguageName,
      targetLanguageName
    })

    expect(result.translatedDescription).toContain('{{ user_name }}')
    expect(result.translatedDescription).toContain('{{ code: ABC123 }}')
    expect(result.translatedDescription).not.toContain('{{ user_name:')
  })

  it('should include journey analysis in translation prompts when provided', async () => {
    const journeyAnalysis = 'This journey is about user onboarding'

    mockGenerateText.mockImplementation(async () => {
      return {
        output: { translations: ['Translated Value'] },
        ...baseMockResponse
      } as any
    })

    // Override for description call
    mockGenerateText
      .mockResolvedValueOnce({
        output: { translations: ['Translated Value'] },
        ...baseMockResponse
      } as any)
      .mockResolvedValueOnce({
        output: { translations: ['Translated Default'] },
        ...baseMockResponse
      } as any)
      .mockResolvedValueOnce({
        output: { translatedDescription: 'Translated description' },
        ...baseMockResponse
      } as any)

    await translateCustomizationFields({
      journeyCustomizationDescription: 'Welcome!',
      journeyCustomizationFields: [mockJourneyCustomizationFields[0]],
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish',
      journeyAnalysis
    })

    const calls = mockGenerateText.mock.calls
    expect(calls.length).toBeGreaterThan(0)
    const promptText = JSON.stringify(calls[0])
    expect(promptText).toContain('journey')
    expect(promptText).toContain('onboarding')
  })

  it('should translate defaultValue to defaultValueTargetLanguageName when provided', async () => {
    const fields = [
      {
        id: 'field1',
        journeyId: 'journey123',
        key: 'greeting',
        value: 'Hello',
        defaultValue: 'Welcome',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    mockGenerateText.mockImplementation(async (options: any) => {
      const prompt = options.messages[1].content[0].text

      // Values batch should target French
      if (prompt.includes('Hello')) {
        expect(prompt).toContain('French')
        return {
          output: { translations: ['Bonjour'] },
          ...baseMockResponse
        } as any
      }
      // DefaultValues batch should target Spanish
      if (prompt.includes('Welcome')) {
        expect(prompt).toContain('Spanish')
        return {
          output: { translations: ['Bienvenido'] },
          ...baseMockResponse
        } as any
      }

      return {
        output: { translations: ['Translated'] },
        ...baseMockResponse
      } as any
    })

    const result = await translateCustomizationFields({
      journeyCustomizationDescription: null,
      journeyCustomizationFields: fields,
      sourceLanguageName: 'English',
      targetLanguageName: 'French',
      defaultValueTargetLanguageName: 'Spanish'
    })

    expect(result.translatedFields[0]).toEqual({
      id: 'field1',
      key: 'greeting',
      translatedValue: 'Bonjour',
      translatedDefaultValue: 'Bienvenido'
    })
    expect(mockGenerateText).toHaveBeenCalledTimes(2)
  })

  it('should fall back to targetLanguageName for defaultValue when defaultValueTargetLanguageName not provided', async () => {
    const fields = [
      {
        id: 'field1',
        journeyId: 'journey123',
        key: 'greeting',
        value: null,
        defaultValue: 'Welcome',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    mockGenerateText.mockImplementation(async (options: any) => {
      const prompt = options.messages[1].content[0].text
      expect(prompt).toContain('French')
      return {
        output: { translations: ['Bienvenue'] },
        ...baseMockResponse
      } as any
    })

    const result = await translateCustomizationFields({
      journeyCustomizationDescription: null,
      journeyCustomizationFields: fields,
      sourceLanguageName: 'English',
      targetLanguageName: 'French'
    })

    expect(result.translatedFields[0]).toEqual({
      id: 'field1',
      key: 'greeting',
      translatedValue: null,
      translatedDefaultValue: 'Bienvenue'
    })
  })

  it('should translate description to descriptionTargetLanguageName when provided', async () => {
    const fields = [
      {
        id: 'field1',
        journeyId: 'journey123',
        key: 'greeting',
        value: 'Hello',
        defaultValue: 'Welcome',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    mockGenerateText.mockImplementation(async (options: any) => {
      const prompt = options.messages[1].content[0].text

      if (prompt.includes('customization description')) {
        expect(prompt).toContain('Spanish')
        return {
          output: { translatedDescription: '¡Bienvenido {{ greeting }}!' },
          ...baseMockResponse
        } as any
      }

      if (prompt.includes('Hello')) {
        expect(prompt).toContain('French')
        return {
          output: { translations: ['Bonjour'] },
          ...baseMockResponse
        } as any
      }

      if (prompt.includes('Welcome')) {
        expect(prompt).toContain('French')
        return {
          output: { translations: ['Bienvenue'] },
          ...baseMockResponse
        } as any
      }

      return {
        output: { translations: ['Translated'] },
        ...baseMockResponse
      } as any
    })

    const result = await translateCustomizationFields({
      journeyCustomizationDescription: 'Welcome {{ greeting }}!',
      journeyCustomizationFields: fields,
      sourceLanguageName: 'English',
      targetLanguageName: 'French',
      descriptionTargetLanguageName: 'Spanish'
    })

    expect(result.translatedDescription).toBe('¡Bienvenido {{ greeting }}!')
    expect(result.translatedFields[0].translatedValue).toBe('Bonjour')
    expect(result.translatedFields[0].translatedDefaultValue).toBe('Bienvenue')
  })

  it('should fall back to targetLanguageName for description when descriptionTargetLanguageName not provided', async () => {
    mockGenerateText.mockImplementation(async (options: any) => {
      const prompt = options.messages[1].content[0].text
      expect(prompt).toContain('French')
      return {
        output: { translatedDescription: 'Bienvenue!' },
        ...baseMockResponse
      } as any
    })

    const result = await translateCustomizationFields({
      journeyCustomizationDescription: 'Welcome!',
      journeyCustomizationFields: [],
      sourceLanguageName: 'English',
      targetLanguageName: 'French'
    })

    expect(result.translatedDescription).toBe('Bienvenue!')
  })

  it('should not translate addresses, times, or locations in field values', async () => {
    const fieldsWithAddresses = [
      {
        id: 'field1',
        journeyId: 'journey123',
        key: 'address',
        value: '123 Main Street, New York, NY 10001',
        defaultValue: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'field2',
        journeyId: 'journey123',
        key: 'time',
        value: '3:00 PM on Monday, January 15',
        defaultValue: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    mockGenerateText.mockResolvedValueOnce({
      output: {
        translations: [
          '123 Main Street, New York, NY 10001',
          '3:00 PM on Monday, January 15'
        ]
      },
      ...baseMockResponse
    } as any)

    await translateCustomizationFields({
      journeyCustomizationDescription: null,
      journeyCustomizationFields: fieldsWithAddresses,
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish'
    })

    // Both values are batched into a single call
    expect(mockGenerateText).toHaveBeenCalledTimes(1)
    const promptCalls = mockGenerateText.mock.calls
    promptCalls.forEach((call) => {
      const prompt = JSON.stringify(call)
      expect(prompt).toContain('DO NOT translate addresses')
      expect(prompt).toContain('Preserve numeric time formats')
      expect(prompt).toContain('DO NOT translate locations')
    })
  })

  it('should return early when no fields and no description', async () => {
    const result = await translateCustomizationFields({
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish'
    })

    expect(result.translatedDescription).toBeNull()
    expect(result.translatedFields).toHaveLength(0)
    expect(mockGenerateText).not.toHaveBeenCalled()
  })
})

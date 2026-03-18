import { generateText } from 'ai'

import { translateCustomizationFields } from './translateCustomizationFields'

// Mock all external dependencies
jest.mock('@ai-sdk/google', () => ({
  google: jest.fn(() => 'mocked-google-model')
}))

jest.mock('ai', () => ({
  Output: { object: jest.fn(({ schema }) => ({ schema })) },
  generateText: jest.fn()
}))

jest.mock('@core/shared/ai/prompts', () => ({
  hardenPrompt: jest.fn((text) => `<hardened>${text}</hardened>`),
  preSystemPrompt: 'mocked system prompt'
}))

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

    mockGenerateText.mockResolvedValue({
      output: { translatedValue: 'Translated Value' },
      usage: {
        totalTokens: 100,
        inputTokens: 50,
        outputTokens: 50
      },
      finishReason: 'stop',
      warnings: [],
      request: {} as any,
      response: {} as any,
      id: 'mock-id',
      createdAt: new Date()
    } as any)
  })

  it('should translate customization fields and description', async () => {
    const description =
      'Welcome {{ user_name }}! Your event is on {{ event_date }} at {{ location }}.'
    const sourceLanguageName = 'English'
    const targetLanguageName = 'Spanish'

    // Use mockImplementation to return translations based on the input value
    // This handles the parallel execution order issue with Promise.all
    mockGenerateText.mockImplementation(async (options: any) => {
      const prompt = options.messages[1].content[0].text

      // Check if this is a description translation (has "customization description" in prompt)
      if (prompt.includes('customization description')) {
        return {
          output: {
            translatedDescription:
              '¡Bienvenido {{ user_name }}! Tu evento es el {{ event_date }} en {{ location }}.'
          },
          usage: { totalTokens: 200, inputTokens: 100, outputTokens: 100 },
          finishReason: 'stop',
          warnings: [],
          request: {} as any,
          response: {} as any,
          id: 'mock-id',
          createdAt: new Date()
        } as any
      }

      // Field value translations - match based on the value in the prompt
      if (prompt.includes('John Doe')) {
        return {
          output: { translatedValue: 'Juan Pérez' },
          usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
          finishReason: 'stop',
          warnings: [],
          request: {} as any,
          response: {} as any,
          id: 'mock-id',
          createdAt: new Date()
        } as any
      }
      if (prompt.includes('Guest')) {
        return {
          output: { translatedValue: 'Invitado' },
          usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
          finishReason: 'stop',
          warnings: [],
          request: {} as any,
          response: {} as any,
          id: 'mock-id',
          createdAt: new Date()
        } as any
      }
      if (prompt.includes('January 15, 2024')) {
        return {
          output: { translatedValue: '15 de enero de 2024' },
          usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
          finishReason: 'stop',
          warnings: [],
          request: {} as any,
          response: {} as any,
          id: 'mock-id',
          createdAt: new Date()
        } as any
      }
      if (prompt.includes('New York')) {
        return {
          output: { translatedValue: 'Nueva York' },
          usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
          finishReason: 'stop',
          warnings: [],
          request: {} as any,
          response: {} as any,
          id: 'mock-id',
          createdAt: new Date()
        } as any
      }

      // Default fallback
      return {
        output: { translatedValue: 'Translated Value' },
        usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
        finishReason: 'stop',
        warnings: [],
        request: {} as any,
        response: {} as any,
        id: 'mock-id',
        createdAt: new Date()
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

    // Verify generateObject was called for each field value and description
    // 4 field translations (user_name value, user_name defaultValue, event_date value, location defaultValue) + 1 description
    expect(mockGenerateText).toHaveBeenCalledTimes(5)
  })

  it('should handle null customization description', async () => {
    // Mock field value and defaultValue translations (2 calls for field1)
    mockGenerateText.mockResolvedValueOnce({
      output: { translatedValue: 'Juan Pérez' },
      usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
      finishReason: 'stop',
      warnings: [],
      request: {} as any,
      response: {} as any,
      id: 'mock-id',
      createdAt: new Date()
    } as any)

    mockGenerateText.mockResolvedValueOnce({
      output: { translatedValue: 'Invitado' },
      usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
      finishReason: 'stop',
      warnings: [],
      request: {} as any,
      response: {} as any,
      id: 'mock-id',
      createdAt: new Date()
    } as any)

    const result = await translateCustomizationFields({
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [mockJourneyCustomizationFields[0]],
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish'
    })

    expect(result.translatedDescription).toBeNull()
    expect(result.translatedFields).toHaveLength(1)
    // Description translation should not be called - only field value and defaultValue
    expect(mockGenerateText).toHaveBeenCalledTimes(2)
  })

  it('should handle empty customization fields array', async () => {
    mockGenerateText.mockResolvedValueOnce({
      output: {
        translatedDescription: 'Translated description'
      },
      usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
      finishReason: 'stop',
      warnings: [],
      request: {} as any,
      response: {} as any,
      id: 'mock-id',
      createdAt: new Date()
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
      usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
      finishReason: 'stop',
      warnings: [],
      request: {} as any,
      response: {} as any,
      id: 'mock-id',
      createdAt: new Date()
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
      usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
      finishReason: 'stop',
      warnings: [],
      request: {} as any,
      response: {} as any,
      id: 'mock-id',
      createdAt: new Date()
    } as any)

    const result = await translateCustomizationFields({
      journeyCustomizationDescription: description,
      journeyCustomizationFields: [],
      sourceLanguageName,
      targetLanguageName
    })

    // Verify {{ }} blocks are preserved
    expect(result.translatedDescription).toContain('{{ user_name }}')
    expect(result.translatedDescription).toContain('{{ code: ABC123 }}')
    expect(result.translatedDescription).not.toContain('{{ user_name:')
  })

  it('should include journey analysis in translation prompts when provided', async () => {
    const journeyAnalysis = 'This journey is about user onboarding'

    mockGenerateText.mockResolvedValueOnce({
      output: { translatedValue: 'Translated Value' },
      usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
      finishReason: 'stop',
      warnings: [],
      request: {} as any,
      response: {} as any,
      id: 'mock-id',
      createdAt: new Date()
    } as any)

    mockGenerateText.mockResolvedValueOnce({
      output: { translatedDescription: 'Translated description' },
      usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
      finishReason: 'stop',
      warnings: [],
      request: {} as any,
      response: {} as any,
      id: 'mock-id',
      createdAt: new Date()
    } as any)

    await translateCustomizationFields({
      journeyCustomizationDescription: 'Welcome!',
      journeyCustomizationFields: [mockJourneyCustomizationFields[0]],
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish',
      journeyAnalysis
    })

    // Verify journey analysis was included in the prompt
    const calls = mockGenerateText.mock.calls
    expect(calls.length).toBeGreaterThan(0)
    const promptText = JSON.stringify(calls[0])
    expect(promptText).toContain('journey')
    expect(promptText).toContain('onboarding')
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
      output: { translatedValue: '123 Main Street, New York, NY 10001' },
      usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
      finishReason: 'stop',
      warnings: [],
      request: {} as any,
      response: {} as any,
      id: 'mock-id',
      createdAt: new Date()
    } as any)

    mockGenerateText.mockResolvedValueOnce({
      output: { translatedValue: '3:00 PM on Monday, January 15' },
      usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
      finishReason: 'stop',
      warnings: [],
      request: {} as any,
      response: {} as any,
      id: 'mock-id',
      createdAt: new Date()
    } as any)

    await translateCustomizationFields({
      journeyCustomizationDescription: null,
      journeyCustomizationFields: fieldsWithAddresses,
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish'
    })

    // The prompt should instruct not to translate addresses/times
    // In a real scenario, the AI would preserve these, but in tests we verify the prompt
    expect(mockGenerateText).toHaveBeenCalledTimes(2)
    const promptCalls = mockGenerateText.mock.calls
    promptCalls.forEach((call) => {
      const prompt = JSON.stringify(call)
      expect(prompt).toContain('DO NOT translate addresses')
      expect(prompt).toContain('DO NOT translate times')
      expect(prompt).toContain('DO NOT translate locations')
    })
  })
})

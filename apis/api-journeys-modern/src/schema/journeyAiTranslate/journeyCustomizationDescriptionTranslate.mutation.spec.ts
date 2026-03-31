import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { Action, ability } from '../../lib/auth/ability'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import {
  translateCustomizationDescription,
  translateValue
} from './translateCustomizationFields/translateCustomizationFields'

jest.mock('@ai-sdk/google', () => ({
  google: jest.fn(() => 'mocked-google-model')
}))

jest.mock('ai', () => ({
  Output: {
    object: jest.fn((config) => ({ type: 'object', ...config }))
  },
  generateText: jest.fn()
}))

jest.mock('@core/shared/ai/prompts', () => ({
  hardenPrompt: jest.fn((text) => `<hardened>${text}</hardened>`),
  preSystemPrompt: 'mocked system prompt'
}))

jest.mock('../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

jest.mock(
  './translateCustomizationFields/translateCustomizationFields',
  () => ({
    translateCustomizationFields: jest.fn(),
    translateCustomizationDescription: jest.fn(),
    translateValue: jest.fn()
  })
)

const JOURNEY_CUSTOMIZATION_DESCRIPTION_TRANSLATE = graphql(`
  mutation JourneyCustomizationDescriptionTranslate(
    $input: JourneyCustomizationDescriptionTranslateInput!
  ) {
    journeyCustomizationDescriptionTranslate(input: $input) {
      id
      title
    }
  }
`)

describe('journeyCustomizationDescriptionTranslate', () => {
  const mockAbility = ability as jest.MockedFunction<typeof ability>
  const mockTranslateDescription =
    translateCustomizationDescription as jest.MockedFunction<
      typeof translateCustomizationDescription
    >
  const mockTranslateValue = translateValue as jest.MockedFunction<
    typeof translateValue
  >

  const mockFields = [
    { id: 'field-1', key: 'website_label', value: null, defaultValue: 'our website' },
    { id: 'field-2', key: 'cta_label', value: null, defaultValue: 'Learn More' },
    { id: 'field-3', key: 'empty_field', value: null, defaultValue: null }
  ]

  const mockJourney = {
    id: 'journey-1',
    title: 'Test Journey',
    journeyCustomizationDescription:
      'Welcome {{ user_name }}! Enter your details below.',
    journeyCustomizationFields: mockFields,
    userJourneys: [],
    team: { id: 'team-1', userTeams: [] }
  }

  const mockInput = {
    journeyId: 'journey-1',
    sourceLanguageName: 'English',
    targetLanguageName: 'Spanish'
  }

  const authClient = getClient({
    headers: { authorization: 'token' },
    context: {
      currentUser: {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
        imageUrl: null,
        roles: []
      }
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockAbility.mockReturnValue(true)
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    mockTranslateDescription.mockResolvedValue(
      '¡Bienvenido {{ user_name }}! Ingresa tus datos a continuación.'
    )
    mockTranslateValue.mockImplementation(async ({ value }) => `translated:${value}`)
    prismaMock.journeyCustomizationField.update.mockResolvedValue({} as any)
    prismaMock.journey.update.mockResolvedValue({
      ...mockJourney,
      journeyCustomizationDescription:
        '¡Bienvenido {{ user_name }}! Ingresa tus datos a continuación.'
    } as any)
  })

  it('should translate description and field values', async () => {
    const result = await authClient({
      document: JOURNEY_CUSTOMIZATION_DESCRIPTION_TRANSLATE,
      variables: { input: mockInput }
    })

    expect(mockTranslateDescription).toHaveBeenCalledWith({
      description: mockJourney.journeyCustomizationDescription,
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish'
    })

    expect(mockTranslateValue).toHaveBeenCalledTimes(2)
    expect(mockTranslateValue).toHaveBeenCalledWith({
      value: 'our website',
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish'
    })
    expect(mockTranslateValue).toHaveBeenCalledWith({
      value: 'Learn More',
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish'
    })

    expect(prismaMock.journeyCustomizationField.update).toHaveBeenCalledTimes(2)
    expect(prismaMock.journeyCustomizationField.update).toHaveBeenCalledWith({
      where: { id: 'field-1' },
      data: { value: 'translated:our website' }
    })
    expect(prismaMock.journeyCustomizationField.update).toHaveBeenCalledWith({
      where: { id: 'field-2' },
      data: { value: 'translated:Learn More' }
    })

    expect(prismaMock.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'journey-1' },
        data: {
          journeyCustomizationDescription:
            '¡Bienvenido {{ user_name }}! Ingresa tus datos a continuación.'
        }
      })
    )

    expect(result).toEqual({
      data: {
        journeyCustomizationDescriptionTranslate: expect.objectContaining({
          id: 'journey-1'
        })
      }
    })
  })

  it('should translate field values when description is null', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      journeyCustomizationDescription: null
    } as any)

    prismaMock.journey.findUniqueOrThrow.mockResolvedValueOnce({
      ...mockJourney,
      journeyCustomizationDescription: null
    } as any)

    await authClient({
      document: JOURNEY_CUSTOMIZATION_DESCRIPTION_TRANSLATE,
      variables: { input: mockInput }
    })

    expect(mockTranslateDescription).not.toHaveBeenCalled()
    expect(mockTranslateValue).toHaveBeenCalledTimes(2)
    expect(prismaMock.journeyCustomizationField.update).toHaveBeenCalledTimes(2)
  })

  it('should skip all translation when no description and no fields', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      journeyCustomizationDescription: null,
      journeyCustomizationFields: []
    } as any)

    prismaMock.journey.findUniqueOrThrow.mockResolvedValueOnce({
      ...mockJourney,
      journeyCustomizationDescription: null,
      journeyCustomizationFields: []
    } as any)

    await authClient({
      document: JOURNEY_CUSTOMIZATION_DESCRIPTION_TRANSLATE,
      variables: { input: mockInput }
    })

    expect(mockTranslateDescription).not.toHaveBeenCalled()
    expect(mockTranslateValue).not.toHaveBeenCalled()
    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  it('should skip translation when description is empty and no fields', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      journeyCustomizationDescription: '   ',
      journeyCustomizationFields: []
    } as any)

    prismaMock.journey.findUniqueOrThrow.mockResolvedValueOnce({
      ...mockJourney,
      journeyCustomizationDescription: '   ',
      journeyCustomizationFields: []
    } as any)

    await authClient({
      document: JOURNEY_CUSTOMIZATION_DESCRIPTION_TRANSLATE,
      variables: { input: mockInput }
    })

    expect(mockTranslateDescription).not.toHaveBeenCalled()
    expect(mockTranslateValue).not.toHaveBeenCalled()
    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  it('should throw when journey not found', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce(null)

    const result = await authClient({
      document: JOURNEY_CUSTOMIZATION_DESCRIPTION_TRANSLATE,
      variables: { input: mockInput }
    })

    expect(result).toEqual({
      data: null,
      errors: [expect.objectContaining({ message: 'journey not found' })]
    })
    expect(mockTranslateDescription).not.toHaveBeenCalled()
    expect(mockTranslateValue).not.toHaveBeenCalled()
  })

  it('should throw when user lacks permission', async () => {
    mockAbility.mockReturnValueOnce(false)

    const result = await authClient({
      document: JOURNEY_CUSTOMIZATION_DESCRIPTION_TRANSLATE,
      variables: { input: mockInput }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user does not have permission to update journey'
        })
      ]
    })
    expect(mockTranslateDescription).not.toHaveBeenCalled()
    expect(mockTranslateValue).not.toHaveBeenCalled()
  })
})

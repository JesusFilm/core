import { type MockedFunction, vi } from 'vitest'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { Action, ability } from '../../lib/auth/ability'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { translateCustomizationDescription } from './translateCustomizationFields/translateCustomizationFields'

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => 'mocked-google-model')
}))

vi.mock('ai', () => ({
  Output: {
    object: vi.fn((config) => ({ type: 'object', ...config }))
  },
  generateText: vi.fn()
}))

vi.mock('@core/shared/ai/prompts', () => ({
  hardenPrompt: vi.fn((text) => `<hardened>${text}</hardened>`),
  preSystemPrompt: 'mocked system prompt'
}))

vi.mock('../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: vi.fn(),
  subject: vi.fn((type, object) => ({ subject: type, object }))
}))

vi.mock(
  './translateCustomizationFields/translateCustomizationFields',
  () => ({
    translateCustomizationFields: vi.fn(),
    translateCustomizationDescription: vi.fn()
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
  const mockAbility = ability as MockedFunction<typeof ability>
  const mockTranslateDescription =
    translateCustomizationDescription as MockedFunction<
      typeof translateCustomizationDescription
    >

  const mockJourney = {
    id: 'journey-1',
    title: 'Test Journey',
    journeyCustomizationDescription:
      'Welcome {{ user_name }}! Enter your details below.',
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
    vi.clearAllMocks()
    mockAbility.mockReturnValue(true)
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    mockTranslateDescription.mockResolvedValue(
      '¡Bienvenido {{ user_name }}! Ingresa tus datos a continuación.'
    )
    prismaMock.journey.update.mockResolvedValue({
      ...mockJourney,
      journeyCustomizationDescription:
        '¡Bienvenido {{ user_name }}! Ingresa tus datos a continuación.'
    } as any)
  })

  it('should translate description only without translating field values', async () => {
    const result = await authClient({
      document: JOURNEY_CUSTOMIZATION_DESCRIPTION_TRANSLATE,
      variables: { input: mockInput }
    })

    expect(mockTranslateDescription).toHaveBeenCalledWith({
      description: mockJourney.journeyCustomizationDescription,
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish'
    })

    expect(prismaMock.journeyCustomizationField.update).not.toHaveBeenCalled()

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

  it('should skip translation when description is null', async () => {
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
    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  it('should skip all translation when no description', async () => {
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
    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  it('should skip translation when description is empty', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...mockJourney,
      journeyCustomizationDescription: '   '
    } as any)

    prismaMock.journey.findUniqueOrThrow.mockResolvedValueOnce({
      ...mockJourney,
      journeyCustomizationDescription: '   '
    } as any)

    await authClient({
      document: JOURNEY_CUSTOMIZATION_DESCRIPTION_TRANSLATE,
      variables: { input: mockInput }
    })

    expect(mockTranslateDescription).not.toHaveBeenCalled()
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
  })
})

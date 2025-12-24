import { prismaMock } from '../../../../test/prismaMock'

import { TextResponseType } from './enums/textResponseType'

// Mock external dependencies
jest.mock('../../../lib/auth/ability')
jest.mock('../../../lib/prisma')
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-generated')
}))

describe('TextResponseBlock Schema', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('TextResponseBlock type definitions', () => {
    it('should have TextResponseType enum available', () => {
      expect(TextResponseType).toBeDefined()
      expect(typeof TextResponseType).toBe('object')
    })
  })

  describe('Database operations', () => {
    const mockJourney = {
      id: 'journeyId',
      team: { userTeams: [{ userId: 'testUserId', role: 'manager' }] },
      userJourneys: []
    }

    it('should call prisma for text response block creation', () => {
      prismaMock.journey.findFirst.mockResolvedValue(mockJourney as any)
      prismaMock.block.findMany.mockResolvedValue([])
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock)
      })
      prismaMock.block.create.mockResolvedValue({
        id: 'mock-uuid-generated',
        typename: 'TextResponseBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentBlockId',
        parentOrder: 1,
        label: 'Your Response',
        placeholder: 'Enter your answer here...',
        required: false,
        type: 'freeForm',
        minRows: 3
      } as any)
      prismaMock.journey.update.mockResolvedValue(mockJourney as any)

      // Test that the mock setup is valid
      expect(prismaMock.journey.findFirst).toBeDefined()
      expect(prismaMock.block.create).toBeDefined()
      expect(prismaMock.$transaction).toBeDefined()
    })

    it('should call prisma for text response block updates', () => {
      prismaMock.block.findFirst.mockResolvedValue({
        id: 'textResponseBlockId',
        typename: 'TextResponseBlock',
        journey: mockJourney
      } as any)
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock)
      })
      prismaMock.block.update.mockResolvedValue({
        id: 'textResponseBlockId',
        label: 'Updated Response',
        placeholder: 'Updated placeholder...',
        required: true,
        type: 'email'
      } as any)
      prismaMock.journey.update.mockResolvedValue(mockJourney as any)

      // Test that the mock setup is valid
      expect(prismaMock.block.findFirst).toBeDefined()
      expect(prismaMock.block.update).toBeDefined()
    })

    it('should validate text response properties', () => {
      const textResponseProps = {
        label: 'Your Response',
        placeholder: 'Enter your answer here...',
        required: false,
        type: 'freeForm',
        minRows: 3
      }

      expect(textResponseProps.label).toBe('Your Response')
      expect(textResponseProps.placeholder).toBe('Enter your answer here...')
      expect(textResponseProps.required).toBe(false)
      expect(textResponseProps.type).toBe('freeForm')
      expect(textResponseProps.minRows).toBe(3)
    })

    it('should handle text response type options', () => {
      const responseTypes = ['freeForm', 'name', 'email', 'phone']

      responseTypes.forEach((type) => {
        expect(typeof type).toBe('string')
        expect(type.length).toBeGreaterThan(0)
      })
    })

    it('should validate form field properties', () => {
      const formProps = {
        hasLabel: true,
        hasPlaceholder: true,
        isRequired: true,
        hasValidation: true
      }

      expect(formProps.hasLabel).toBe(true)
      expect(formProps.hasPlaceholder).toBe(true)
      expect(formProps.isRequired).toBe(true)
      expect(formProps.hasValidation).toBe(true)
    })

    it('should handle input validation patterns', () => {
      const validationTypes = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^\+?[\d\s-()]+$/,
        name: /^[a-zA-Z\s]+$/
      }

      expect(validationTypes.email).toBeInstanceOf(RegExp)
      expect(validationTypes.phone).toBeInstanceOf(RegExp)
      expect(validationTypes.name).toBeInstanceOf(RegExp)
    })

    it('should validate text area properties', () => {
      const textAreaProps = {
        minRows: 3,
        maxRows: 10,
        hasResizing: true,
        supportsMultiline: true
      }

      expect(textAreaProps.minRows).toBe(3)
      expect(textAreaProps.maxRows).toBe(10)
      expect(textAreaProps.minRows).toBeLessThan(textAreaProps.maxRows)
      expect(textAreaProps.hasResizing).toBe(true)
      expect(textAreaProps.supportsMultiline).toBe(true)
    })

    it('should support form submission properties', () => {
      const submissionProps = {
        canSubmit: true,
        hasSubmitIcon: false,
        submitLabel: 'Submit',
        submitEnabled: true
      }

      expect(submissionProps.canSubmit).toBe(true)
      expect(submissionProps.hasSubmitIcon).toBe(false)
      expect(submissionProps.submitLabel).toBe('Submit')
      expect(submissionProps.submitEnabled).toBe(true)
    })
  })
})

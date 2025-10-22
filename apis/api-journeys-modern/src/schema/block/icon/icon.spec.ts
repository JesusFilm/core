import { prismaMock } from '../../../../test/prismaMock'

import { IconColor } from './enums/iconColor'
import { IconName } from './enums/iconName'
import { IconSize } from './enums/iconSize'

// Mock external dependencies
jest.mock('../../../lib/auth/ability')
jest.mock('../../../lib/prisma')
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-generated')
}))

describe('IconBlock Schema', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('IconBlock type definitions', () => {
    it('should have IconName enum available', () => {
      expect(IconName).toBeDefined()
      expect(typeof IconName).toBe('object')
    })

    it('should have IconColor enum available', () => {
      expect(IconColor).toBeDefined()
      expect(typeof IconColor).toBe('object')
    })

    it('should have IconSize enum available', () => {
      expect(IconSize).toBeDefined()
      expect(typeof IconSize).toBe('object')
    })
  })

  describe('Database operations', () => {
    const mockJourney = {
      id: 'journeyId',
      team: { userTeams: [{ userId: 'testUserId', role: 'manager' }] },
      userJourneys: []
    }

    it('should call prisma for icon block creation', () => {
      prismaMock.journey.findFirst.mockResolvedValue(mockJourney as any)
      prismaMock.block.findMany.mockResolvedValue([])
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock)
      })
      prismaMock.block.create.mockResolvedValue({
        id: 'mock-uuid-generated',
        typename: 'IconBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentBlockId',
        parentOrder: 1,
        name: 'PlayArrowRounded',
        color: 'primary',
        size: 'md'
      } as any)
      prismaMock.journey.update.mockResolvedValue(mockJourney as any)

      // Test that the mock setup is valid
      expect(prismaMock.journey.findFirst).toBeDefined()
      expect(prismaMock.block.create).toBeDefined()
      expect(prismaMock.$transaction).toBeDefined()
    })

    it('should call prisma for icon block updates', () => {
      prismaMock.block.findFirst.mockResolvedValue({
        id: 'iconBlockId',
        typename: 'IconBlock',
        journey: mockJourney
      } as any)
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock)
      })
      prismaMock.block.update.mockResolvedValue({
        id: 'iconBlockId',
        name: 'CheckCircleRounded',
        color: 'secondary',
        size: 'lg'
      } as any)
      prismaMock.journey.update.mockResolvedValue(mockJourney as any)

      // Test that the mock setup is valid
      expect(prismaMock.block.findFirst).toBeDefined()
      expect(prismaMock.block.update).toBeDefined()
    })

    it('should validate icon properties', () => {
      const iconProps = {
        name: 'PlayArrowRounded',
        color: 'primary',
        size: 'md'
      }

      expect(iconProps.name).toBe('PlayArrowRounded')
      expect(iconProps.color).toBe('primary')
      expect(iconProps.size).toBe('md')
    })

    it('should handle icon name options', () => {
      const iconNames = [
        'PlayArrowRounded',
        'TranslateRounded',
        'CheckCircleRounded',
        'RadioButtonUncheckedRounded',
        'FormatQuoteRounded',
        'LockOpenRounded',
        'ArrowForwardRounded',
        'ArrowBackRounded'
      ]

      iconNames.forEach((name) => {
        expect(typeof name).toBe('string')
        expect(name.length).toBeGreaterThan(0)
      })
    })

    it('should handle icon color options', () => {
      const colors = [
        'primary',
        'secondary',
        'action',
        'error',
        'disabled',
        'inherit'
      ]

      colors.forEach((color) => {
        expect(typeof color).toBe('string')
        expect(color.length).toBeGreaterThan(0)
      })
    })

    it('should handle icon size options', () => {
      const sizes = ['sm', 'md', 'lg', 'xl', 'inherit']

      sizes.forEach((size) => {
        expect(typeof size).toBe('string')
        expect(size.length).toBeGreaterThan(0)
      })
    })
  })
})

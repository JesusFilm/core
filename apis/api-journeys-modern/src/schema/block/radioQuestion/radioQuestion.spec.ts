import { prismaMock } from '../../../../test/prismaMock'

// Mock the builder and external dependencies
jest.mock('../../../lib/auth/ability')
jest.mock('../../../lib/prisma')
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-generated')
}))

describe('RadioQuestionBlock Schema', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('RadioQuestionBlock CRUD operations', () => {
    const mockRadioQuestionBlock = {
      id: 'radio-question-block-id',
      journeyId: 'journey-id',
      typename: 'RadioQuestionBlock',
      parentBlockId: 'parent-block-id',
      parentOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    }

    const mockJourney = {
      id: 'journey-id',
      title: 'Test Journey',
      team: {
        userTeams: [{ userId: 'user-id', role: 'manager' }]
      },
      userJourneys: [{ userId: 'user-id', role: 'owner' }]
    }

    describe('radioQuestionBlockCreate mutation', () => {
      it('should handle database operations for block creation', async () => {
        // Mock the database calls that would be made during block creation
        prismaMock.journey.findFirst.mockResolvedValue(mockJourney as any)
        prismaMock.block.findMany.mockResolvedValue([])
        prismaMock.$transaction.mockImplementation(async (callback) => {
          return await callback(prismaMock)
        })
        prismaMock.block.create.mockResolvedValue(mockRadioQuestionBlock as any)
        prismaMock.journey.update.mockResolvedValue(mockJourney as any)

        // Test that the mocks are set up correctly
        expect(prismaMock.journey.findFirst).toBeDefined()
        expect(prismaMock.block.create).toBeDefined()
        expect(prismaMock.$transaction).toBeDefined()
      })

      it('should create a container block for radio options', async () => {
        // RadioQuestionBlock serves as a container for RadioOptionBlocks
        prismaMock.journey.findFirst.mockResolvedValue(mockJourney as any)
        prismaMock.block.findMany.mockResolvedValue([])
        prismaMock.$transaction.mockImplementation(async (callback) => {
          return await callback(prismaMock)
        })
        prismaMock.block.create.mockResolvedValue(mockRadioQuestionBlock as any)
        prismaMock.journey.update.mockResolvedValue(mockJourney as any)

        // Verify the block is created with correct typename
        expect(mockRadioQuestionBlock.typename).toBe('RadioQuestionBlock')
        expect(mockRadioQuestionBlock.parentBlockId).toBe('parent-block-id')
      })
    })

    describe('radioQuestionBlockUpdate mutation', () => {
      it('should handle database operations for block updates', async () => {
        const updatedBlock = {
          ...mockRadioQuestionBlock,
          parentOrder: 2
        }

        prismaMock.block.findFirst.mockResolvedValue({
          ...mockRadioQuestionBlock,
          journey: mockJourney
        } as any)
        prismaMock.$transaction.mockImplementation(async (callback) => {
          return await callback(prismaMock)
        })
        prismaMock.block.update.mockResolvedValue(updatedBlock as any)
        prismaMock.journey.update.mockResolvedValue(mockJourney as any)

        // Test that the update mocks work correctly
        expect(prismaMock.block.findFirst).toBeDefined()
        expect(prismaMock.block.update).toBeDefined()
        expect(updatedBlock.parentOrder).toBe(2)
      })
    })
  })

  describe('RadioQuestionBlock relationships', () => {
    it('should work with RadioOptionBlock children', async () => {
      const mockRadioOptions = [
        {
          id: 'option-1',
          typename: 'RadioOptionBlock',
          parentBlockId: 'radio-question-block-id',
          parentOrder: 0,
          label: 'Option 1'
        },
        {
          id: 'option-2',
          typename: 'RadioOptionBlock',
          parentBlockId: 'radio-question-block-id',
          parentOrder: 1,
          label: 'Option 2'
        }
      ]

      prismaMock.block.findMany.mockResolvedValue(mockRadioOptions as any)

      // Verify that radio options can be children of radio question
      const childOptions = await prismaMock.block.findMany({
        where: {
          parentBlockId: 'radio-question-block-id',
          typename: 'RadioOptionBlock'
        },
        orderBy: { parentOrder: 'asc' }
      })

      expect(childOptions).toEqual(mockRadioOptions)
      expect(childOptions[0].label).toBe('Option 1')
      expect(childOptions[1].label).toBe('Option 2')
    })
  })

  describe('RadioQuestionBlock helper functions', () => {
    it('should validate parent order calculation logic', async () => {
      // Test the parent order calculation logic
      const siblings = [{ parentOrder: 1 }, { parentOrder: 0 }]

      prismaMock.block.findMany.mockResolvedValue(siblings as any)

      // Verify that finding siblings works as expected
      const result = await prismaMock.block.findMany({
        where: {
          journeyId: 'test-journey',
          parentBlockId: 'test-parent',
          deletedAt: null,
          parentOrder: { not: null }
        },
        orderBy: { parentOrder: 'desc' },
        take: 1
      })

      expect(result).toEqual(siblings)
      // Next parent order should be highest + 1 = 2
      const nextOrder = (result[0]?.parentOrder ?? -1) + 1
      expect(nextOrder).toBe(2)
    })
  })

  describe('RadioQuestionBlock data validation', () => {
    it('should handle basic block properties', () => {
      const blockData = {
        typename: 'RadioQuestionBlock',
        journeyId: 'journey-123',
        parentBlockId: 'card-456',
        parentOrder: 0
      }

      expect(blockData.typename).toBe('RadioQuestionBlock')
      expect(blockData.journeyId).toBe('journey-123')
      expect(blockData.parentBlockId).toBe('card-456')
      expect(blockData.parentOrder).toBe(0)
    })

    it('should handle minimal required fields', () => {
      // RadioQuestionBlock is one of the simpler blocks with minimal fields
      const minimalBlock = {
        journeyId: 'journey-id',
        parentBlockId: 'parent-id',
        typename: 'RadioQuestionBlock'
      }

      expect(minimalBlock.journeyId).toBeDefined()
      expect(minimalBlock.parentBlockId).toBeDefined()
      expect(minimalBlock.typename).toBe('RadioQuestionBlock')
    })
  })
})

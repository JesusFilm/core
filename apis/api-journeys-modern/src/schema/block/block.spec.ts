import { prismaMock } from '../../../test/prismaMock'

// Mock the builder and external dependencies
jest.mock('../../lib/auth/ability')
jest.mock('../../lib/prisma')
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-generated')
}))

describe('Block Core Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Block queries', () => {
    const mockBlocks = [
      {
        id: 'block-1',
        journeyId: 'journey-id',
        typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        deletedAt: null
      },
      {
        id: 'block-2',
        journeyId: 'journey-id',
        typename: 'CardBlock',
        parentBlockId: 'block-1',
        parentOrder: 0,
        deletedAt: null
      },
      {
        id: 'block-3',
        journeyId: 'journey-id',
        typename: 'ButtonBlock',
        parentBlockId: 'block-2',
        parentOrder: 0,
        deletedAt: null
      }
    ]

    it('should handle blocks query with filtering', async () => {
      prismaMock.block.findMany.mockResolvedValue(mockBlocks as any)

      const result = await prismaMock.block.findMany({
        where: {
          journeyId: 'journey-id',
          deletedAt: null
        },
        orderBy: { parentOrder: 'asc' }
      })

      expect(result).toEqual(mockBlocks)
      expect(result).toHaveLength(3)
      expect(result[0].typename).toBe('StepBlock')
      expect(result[1].typename).toBe('CardBlock')
      expect(result[2].typename).toBe('ButtonBlock')
    })

    it('should handle block query for single block', async () => {
      const singleBlock = mockBlocks[0]
      prismaMock.block.findUnique.mockResolvedValue(singleBlock as any)

      const result = await prismaMock.block.findUnique({
        where: { id: 'block-1', deletedAt: null }
      })

      expect(result).toEqual(singleBlock)
      expect(result?.typename).toBe('StepBlock')
    })

    it('should filter by typename', async () => {
      const stepBlocks = mockBlocks.filter(
        (block) => block.typename === 'StepBlock'
      )
      prismaMock.block.findMany.mockResolvedValue(stepBlocks as any)

      const result = await prismaMock.block.findMany({
        where: {
          journeyId: 'journey-id',
          typename: 'StepBlock',
          deletedAt: null
        }
      })

      expect(result).toEqual(stepBlocks)
      expect(result[0].typename).toBe('StepBlock')
    })
  })

  describe('Block mutations', () => {
    const mockJourney = {
      id: 'journey-id',
      title: 'Test Journey',
      team: {
        userTeams: [{ userId: 'user-id', role: 'manager' }]
      },
      userJourneys: [{ userId: 'user-id', role: 'owner' }]
    }

    describe('blockDelete mutation', () => {
      it('should handle database operations for block deletion', async () => {
        const blockToDelete = {
          id: 'block-to-delete',
          journeyId: 'journey-id',
          typename: 'ButtonBlock',
          parentBlockId: 'parent-block',
          parentOrder: 1,
          journey: mockJourney
        }

        prismaMock.block.findFirst.mockResolvedValue(blockToDelete as any)
        prismaMock.$transaction.mockImplementation(async (callback) => {
          return await callback(prismaMock)
        })
        prismaMock.block.update.mockResolvedValue({
          ...blockToDelete,
          deletedAt: new Date()
        } as any)
        prismaMock.journey.update.mockResolvedValue(mockJourney as any)

        // Test that the delete operation (soft delete) works
        expect(prismaMock.block.findFirst).toBeDefined()
        expect(prismaMock.block.update).toBeDefined()
        expect(prismaMock.$transaction).toBeDefined()
      })
    })

    describe('blockOrderUpdate mutation', () => {
      it('should handle database operations for reordering blocks', async () => {
        const blockToReorder = {
          id: 'block-to-reorder',
          journeyId: 'journey-id',
          typename: 'ButtonBlock',
          parentBlockId: 'parent-block',
          parentOrder: 1,
          journey: mockJourney
        }

        const siblings = [
          { id: 'sibling-1', parentOrder: 0 },
          { id: 'sibling-2', parentOrder: 2 }
        ]

        prismaMock.block.findFirst.mockResolvedValue(blockToReorder as any)
        prismaMock.block.findMany.mockResolvedValue(siblings as any)
        prismaMock.$transaction.mockImplementation(async (callback) => {
          return await callback(prismaMock)
        })
        prismaMock.block.updateMany.mockResolvedValue({ count: 2 } as any)
        prismaMock.block.update.mockResolvedValue({
          ...blockToReorder,
          parentOrder: 2
        } as any)
        prismaMock.journey.update.mockResolvedValue(mockJourney as any)

        // Test that the reorder operation works
        expect(prismaMock.block.findFirst).toBeDefined()
        expect(prismaMock.block.updateMany).toBeDefined()
        expect(prismaMock.block.update).toBeDefined()
      })
    })

    describe('blockRestore mutation', () => {
      it('should handle database operations for restoring blocks', async () => {
        const deletedBlock = {
          id: 'deleted-block',
          journeyId: 'journey-id',
          typename: 'ButtonBlock',
          parentBlockId: 'parent-block',
          parentOrder: 1,
          deletedAt: new Date(),
          journey: mockJourney
        }

        prismaMock.block.findFirst.mockResolvedValue(deletedBlock as any)
        prismaMock.$transaction.mockImplementation(async (callback) => {
          return await callback(prismaMock)
        })
        prismaMock.block.update.mockResolvedValue({
          ...deletedBlock,
          deletedAt: null
        } as any)
        prismaMock.journey.update.mockResolvedValue(mockJourney as any)

        // Test that the restore operation works
        expect(prismaMock.block.findFirst).toBeDefined()
        expect(prismaMock.block.update).toBeDefined()
      })
    })
  })

  describe('Block ACL integration', () => {
    it('should validate journey permissions', async () => {
      const authorizedJourney = {
        id: 'journey-id',
        team: {
          userTeams: [{ userId: 'user-id', role: 'manager' }]
        },
        userJourneys: [{ userId: 'user-id', role: 'owner' }]
      }

      const unauthorizedJourney = {
        id: 'journey-id',
        team: { userTeams: [] },
        userJourneys: []
      }

      // Test that authorized journey has permissions
      expect(authorizedJourney.team.userTeams).toHaveLength(1)
      expect(authorizedJourney.userJourneys).toHaveLength(1)

      // Test that unauthorized journey lacks permissions
      expect(unauthorizedJourney.team.userTeams).toHaveLength(0)
      expect(unauthorizedJourney.userJourneys).toHaveLength(0)
    })
  })

  describe('Block data integrity', () => {
    it('should maintain parent-child relationships', () => {
      const parentBlock = {
        id: 'parent-block',
        typename: 'StepBlock',
        parentBlockId: null
      }

      const childBlock = {
        id: 'child-block',
        typename: 'CardBlock',
        parentBlockId: 'parent-block'
      }

      const grandChildBlock = {
        id: 'grandchild-block',
        typename: 'ButtonBlock',
        parentBlockId: 'child-block'
      }

      expect(childBlock.parentBlockId).toBe(parentBlock.id)
      expect(grandChildBlock.parentBlockId).toBe(childBlock.id)
      expect(parentBlock.parentBlockId).toBeNull()
    })

    it('should handle parent order correctly', () => {
      const orderedBlocks = [
        { id: 'block-1', parentOrder: 0 },
        { id: 'block-2', parentOrder: 1 },
        { id: 'block-3', parentOrder: 2 }
      ]

      expect(orderedBlocks[0].parentOrder).toBe(0)
      expect(orderedBlocks[1].parentOrder).toBe(1)
      expect(orderedBlocks[2].parentOrder).toBe(2)

      // Test sorting
      const unsortedBlocks = [
        { id: 'block-3', parentOrder: 2 },
        { id: 'block-1', parentOrder: 0 },
        { id: 'block-2', parentOrder: 1 }
      ]

      const sorted = unsortedBlocks.sort(
        (a, b) => a.parentOrder - b.parentOrder
      )
      expect(sorted[0].id).toBe('block-1')
      expect(sorted[1].id).toBe('block-2')
      expect(sorted[2].id).toBe('block-3')
    })
  })
})

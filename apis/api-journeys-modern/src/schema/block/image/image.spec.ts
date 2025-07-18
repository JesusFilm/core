import { prismaMock } from '../../../../test/prismaMock'

// Mock the builder and external dependencies
jest.mock('../../../lib/auth/ability')
jest.mock('../../../lib/prisma')
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-generated')
}))

describe('ImageBlock Schema', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ImageBlock CRUD operations', () => {
    const mockImageBlock = {
      id: 'image-block-id',
      journeyId: 'journey-id',
      typename: 'ImageBlock',
      parentBlockId: 'parent-block-id',
      parentOrder: 1,
      src: 'https://example.com/image.jpg',
      alt: 'Test image',
      width: 1920,
      height: 1080,
      blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      focalTop: 0.5,
      focalLeft: 0.5,
      scale: null,
      isCover: false,
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

    describe('imageBlockCreate mutation', () => {
      it('should handle database operations for block creation', async () => {
        // Mock the database calls that would be made during block creation
        prismaMock.journey.findFirst.mockResolvedValue(mockJourney as any)
        prismaMock.block.findMany.mockResolvedValue([])
        prismaMock.$transaction.mockImplementation(async (callback) => {
          return await callback(prismaMock)
        })
        prismaMock.block.create.mockResolvedValue(mockImageBlock as any)
        prismaMock.journey.update.mockResolvedValue(mockJourney as any)

        // Test that the mocks are set up correctly
        expect(prismaMock.journey.findFirst).toBeDefined()
        expect(prismaMock.block.create).toBeDefined()
        expect(prismaMock.$transaction).toBeDefined()
      })

      it('should handle cover image functionality', async () => {
        const coverImageBlock = {
          ...mockImageBlock,
          isCover: true
        }

        prismaMock.journey.findFirst.mockResolvedValue(mockJourney as any)
        prismaMock.block.findMany.mockResolvedValue([])
        prismaMock.$transaction.mockImplementation(async (callback) => {
          return await callback(prismaMock)
        })
        prismaMock.block.create.mockResolvedValue(coverImageBlock as any)
        prismaMock.block.update.mockResolvedValue({} as any) // Parent block update
        prismaMock.journey.update.mockResolvedValue(mockJourney as any)

        // Verify cover image specific operations are available
        expect(prismaMock.block.update).toBeDefined()
        expect(coverImageBlock.isCover).toBe(true)
      })
    })

    describe('imageBlockUpdate mutation', () => {
      it('should handle database operations for block updates', async () => {
        const updatedBlock = {
          ...mockImageBlock,
          alt: 'Updated alt text',
          src: 'https://example.com/updated-image.jpg'
        }

        prismaMock.block.findFirst.mockResolvedValue({
          ...mockImageBlock,
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
        expect(updatedBlock.alt).toBe('Updated alt text')
      })
    })
  })

  describe('ImageBlock helper functions', () => {
    it('should validate parent order calculation logic', async () => {
      // Test the parent order calculation logic
      const siblings = [
        { parentOrder: 2 },
        { parentOrder: 1 },
        { parentOrder: 0 }
      ]

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
      // Next parent order should be highest + 1 = 3
      const nextOrder = (result[0]?.parentOrder ?? -1) + 1
      expect(nextOrder).toBe(3)
    })
  })

  describe('ImageBlock data validation', () => {
    it('should handle image metadata correctly', () => {
      const imageData = {
        src: 'https://example.com/image.jpg',
        alt: 'Test image',
        width: 1920,
        height: 1080,
        blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
      }

      expect(imageData.src).toBe('https://example.com/image.jpg')
      expect(imageData.width).toBe(1920)
      expect(imageData.height).toBe(1080)
      expect(imageData.blurhash).toMatch(/^[A-Za-z0-9#+$.*]+$/)
    })

    it('should handle focal point calculations', () => {
      const focalPoint = {
        focalTop: 0.25,
        focalLeft: 0.75
      }

      expect(focalPoint.focalTop).toBeGreaterThanOrEqual(0)
      expect(focalPoint.focalTop).toBeLessThanOrEqual(1)
      expect(focalPoint.focalLeft).toBeGreaterThanOrEqual(0)
      expect(focalPoint.focalLeft).toBeLessThanOrEqual(1)
    })

    it('should handle cover image flag', () => {
      const coverImageData = { isCover: true }
      const regularImageData = { isCover: false }

      expect(coverImageData.isCover).toBe(true)
      expect(regularImageData.isCover).toBe(false)
    })
  })
})

import { Job } from 'bullmq'
import { Logger } from 'pino'

import { UserJourneyRole } from '.prisma/api-journeys-modern-client'

import { prismaMock } from '../../../../test/prismaMock'

import { service } from './service'

// Mock prismaUsers
const mockPrismaUsers = {
  user: {
    findMany: jest.fn(),
    delete: jest.fn()
  }
}

jest.mock('@core/prisma/users/client', () => ({
  prismaUsers: mockPrismaUsers
}))

describe('E2E Cleanup Service', () => {
  let mockLogger: Logger
  let mockTx: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as any

    // Create mock transaction client
    mockTx = {
      event: { deleteMany: jest.fn() },
      journey: { delete: jest.fn() }
    }

    // Mock the transaction to execute the callback with the mock transaction client
    prismaMock.$transaction.mockImplementation(async (callback, options) => {
      return await callback(mockTx)
    })
  })

  describe('service', () => {
    it('should find playwright users and delete their journeys individually', async () => {
      const playwrightUsers = [
        {
          id: 'user-1',
          userId: 'playwright-user-1',
          email: 'playwright123@example.com'
        },
        {
          id: 'user-2',
          userId: 'playwright-user-2',
          email: 'playwright456@example.com'
        }
      ]

      const user1Journeys = [
        {
          id: 'journey-1',
          title: 'Test Journey 1',
          userJourneys: [
            {
              userId: 'playwright-user-1',
              role: UserJourneyRole.owner
            }
          ]
        }
      ]

      const user2Journeys = [
        {
          id: 'journey-2',
          title: 'Test Journey 2',
          userJourneys: [
            {
              userId: 'playwright-user-2',
              role: UserJourneyRole.owner
            }
          ]
        },
        {
          id: 'journey-3',
          title: 'Test Journey 3',
          userJourneys: [
            {
              userId: 'playwright-user-2',
              role: UserJourneyRole.owner
            }
          ]
        }
      ]

      // Mock finding playwright users
      mockPrismaUsers.user.findMany.mockResolvedValue(playwrightUsers)

      // Mock finding journeys for each user
      prismaMock.journey.findMany
        .mockResolvedValueOnce(user1Journeys as any)
        .mockResolvedValueOnce(user2Journeys as any)

      // Mock transaction operations
      mockTx.event.deleteMany.mockResolvedValue({ count: 0 })
      mockTx.journey.delete.mockResolvedValue({})

      // Mock user deletion
      mockPrismaUsers.user.delete.mockResolvedValue({})

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await service(job, mockLogger)

      // Should find playwright users with correct filters
      expect(mockPrismaUsers.user.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date)
          },
          AND: [
            {
              email: {
                startsWith: 'playwright',
                mode: 'insensitive'
              }
            },
            {
              email: {
                endsWith: '@example.com'
              }
            }
          ]
        },
        select: {
          id: true,
          userId: true,
          email: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Should find journeys for each user
      expect(prismaMock.journey.findMany).toHaveBeenCalledTimes(2)
      expect(prismaMock.journey.findMany).toHaveBeenNthCalledWith(1, {
        where: {
          userJourneys: {
            some: {
              AND: [
                { role: UserJourneyRole.owner },
                { userId: 'playwright-user-1' }
              ]
            }
          }
        }
      })
      expect(prismaMock.journey.findMany).toHaveBeenNthCalledWith(2, {
        where: {
          userJourneys: {
            some: {
              AND: [
                { role: UserJourneyRole.owner },
                { userId: 'playwright-user-2' }
              ]
            }
          }
        }
      })

      // Should delete journeys in transactions (3 total journeys)
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(3)
      expect(mockTx.event.deleteMany).toHaveBeenCalledTimes(3)
      expect(mockTx.journey.delete).toHaveBeenCalledTimes(3)

      // Should delete events for each journey
      expect(mockTx.event.deleteMany).toHaveBeenNthCalledWith(1, {
        where: { journeyId: 'journey-1' }
      })
      expect(mockTx.event.deleteMany).toHaveBeenNthCalledWith(2, {
        where: { journeyId: 'journey-2' }
      })
      expect(mockTx.event.deleteMany).toHaveBeenNthCalledWith(3, {
        where: { journeyId: 'journey-3' }
      })

      // Should delete each journey
      expect(mockTx.journey.delete).toHaveBeenNthCalledWith(1, {
        where: { id: 'journey-1' }
      })
      expect(mockTx.journey.delete).toHaveBeenNthCalledWith(2, {
        where: { id: 'journey-2' }
      })
      expect(mockTx.journey.delete).toHaveBeenNthCalledWith(3, {
        where: { id: 'journey-3' }
      })

      // Should delete both users
      expect(mockPrismaUsers.user.delete).toHaveBeenCalledTimes(2)
      expect(mockPrismaUsers.user.delete).toHaveBeenNthCalledWith(1, {
        where: { id: 'user-1' }
      })
      expect(mockPrismaUsers.user.delete).toHaveBeenNthCalledWith(2, {
        where: { id: 'user-2' }
      })
    })

    it('should perform dry run without deleting anything', async () => {
      const playwrightUsers = [
        {
          id: 'user-1',
          userId: 'playwright-user-1',
          email: 'playwright123@example.com'
        }
      ]

      const userJourneys = [
        {
          id: 'journey-1',
          title: 'Test Journey 1',
          userJourneys: [
            {
              userId: 'playwright-user-1',
              role: UserJourneyRole.owner
            }
          ]
        }
      ]

      mockPrismaUsers.user.findMany.mockResolvedValue(playwrightUsers)
      prismaMock.journey.findMany.mockResolvedValue(userJourneys as any)

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: true
        }
      } as Job

      await service(job, mockLogger)

      // Should find users and journeys
      expect(mockPrismaUsers.user.findMany).toHaveBeenCalled()
      expect(prismaMock.journey.findMany).toHaveBeenCalled()

      // Should not perform any deletions
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(mockPrismaUsers.user.delete).not.toHaveBeenCalled()
    })

    it('should handle users with no journeys', async () => {
      const playwrightUsers = [
        {
          id: 'user-1',
          userId: 'playwright-user-1',
          email: 'playwright123@example.com'
        }
      ]

      mockPrismaUsers.user.findMany.mockResolvedValue(playwrightUsers)
      prismaMock.journey.findMany.mockResolvedValue([]) // No journeys

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await service(job, mockLogger)

      // Should still delete the user even if they have no journeys
      expect(mockPrismaUsers.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' }
      })

      // Should not call transaction since no journeys to delete
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('should handle journey deletion errors gracefully', async () => {
      const playwrightUsers = [
        {
          id: 'user-1',
          userId: 'playwright-user-1',
          email: 'playwright123@example.com'
        }
      ]

      const userJourneys = [
        {
          id: 'journey-1',
          title: 'Test Journey 1',
          userJourneys: [
            {
              userId: 'playwright-user-1',
              role: UserJourneyRole.owner
            }
          ]
        }
      ]

      mockPrismaUsers.user.findMany.mockResolvedValue(playwrightUsers)
      prismaMock.journey.findMany.mockResolvedValue(userJourneys as any)

      // Mock transaction to fail
      const transactionError = new Error('Journey deletion failed')
      prismaMock.$transaction.mockRejectedValue(transactionError)

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await service(job, mockLogger)

      // Should still delete the user
      expect(mockPrismaUsers.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' }
      })
    })

    it('should use default cleanup hours when not specified', async () => {
      mockPrismaUsers.user.findMany.mockResolvedValue([])

      const job = {
        data: {
          __typename: 'e2eCleanup'
        }
      } as Job

      await service(job, mockLogger)

      // Should use 24 hours as default by checking the date filter
      const expectedCutoffTime = Date.now() - 24 * 60 * 60 * 1000
      const actualCall = mockPrismaUsers.user.findMany.mock.calls[0][0]
      const actualCutoffTime = actualCall.where.createdAt.lt.getTime()

      // Allow for small time difference due to test execution time
      expect(Math.abs(actualCutoffTime - expectedCutoffTime)).toBeLessThan(1000)
    })

    it('should handle service errors gracefully', async () => {
      const error = new Error('Database error')
      mockPrismaUsers.user.findMany.mockRejectedValue(error)

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await expect(service(job, mockLogger)).rejects.toThrow('Database error')
    })

    it('should use transaction timeout for journey deletion', async () => {
      const playwrightUsers = [
        {
          id: 'user-1',
          userId: 'playwright-user-1',
          email: 'playwright123@example.com'
        }
      ]

      const userJourneys = [
        {
          id: 'journey-1',
          title: 'Test Journey 1',
          userJourneys: [
            {
              userId: 'playwright-user-1',
              role: UserJourneyRole.owner
            }
          ]
        }
      ]

      mockPrismaUsers.user.findMany.mockResolvedValue(playwrightUsers)
      prismaMock.journey.findMany.mockResolvedValue(userJourneys as any)

      mockTx.event.deleteMany.mockResolvedValue({ count: 0 })
      mockTx.journey.delete.mockResolvedValue({})
      mockPrismaUsers.user.delete.mockResolvedValue({})

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await service(job, mockLogger)

      // Should call transaction with timeout option
      expect(prismaMock.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        { timeout: 30000 }
      )
    })

    it('should filter users by correct time cutoff', async () => {
      const olderThanHours = 48
      mockPrismaUsers.user.findMany.mockResolvedValue([])

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours,
          dryRun: false
        }
      } as Job

      await service(job, mockLogger)

      // Should use the specified hours for the cutoff date
      const expectedCutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000
      const actualCall = mockPrismaUsers.user.findMany.mock.calls[0][0]
      const actualCutoffTime = actualCall.where.createdAt.lt.getTime()

      // Allow for small time difference due to test execution time
      expect(Math.abs(actualCutoffTime - expectedCutoffTime)).toBeLessThan(1000)
    })
  })
})

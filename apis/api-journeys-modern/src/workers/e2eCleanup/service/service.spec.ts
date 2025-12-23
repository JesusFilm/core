import { Job } from 'bullmq'
import { Logger } from 'pino'

import { type UserJourneyRole } from '@core/prisma/journeys/client'

import { prismaMock as mockPrisma } from '../../../../test/prismaMock'

import { service } from './service'

type PrismaUsersClientMock = {
  user: {
    findMany: jest.Mock
    delete: jest.Mock
  }
}

type TransactionClientMock = {
  event: { deleteMany: jest.Mock }
  journey: { delete: jest.Mock }
}

jest.mock(
  '@core/prisma-users/client',
  () => ({
    prismaUsers: {
      user: {
        findMany: jest.fn(),
        delete: jest.fn()
      }
    }
  }),
  { virtual: true }
)

describe('E2E Cleanup Service', () => {
  let mockLogger: Logger
  let mockTx: TransactionClientMock
  let prismaUsers: PrismaUsersClientMock

  beforeEach(() => {
    jest.clearAllMocks()
    prismaUsers = (
      jest.requireMock('@core/prisma-users/client') as unknown as {
        prismaUsers: PrismaUsersClientMock
      }
    ).prismaUsers
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
    mockPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockTx)
    )
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
      prismaUsers.user.findMany.mockResolvedValue(playwrightUsers)

      // Mock finding journeys for each user
      mockPrisma.journey.findMany
        .mockResolvedValueOnce(user1Journeys as any)
        .mockResolvedValueOnce(user2Journeys as any)

      // Mock transaction operations
      mockTx.event.deleteMany.mockResolvedValue({ count: 0 })
      mockTx.journey.delete.mockResolvedValue({})

      // Mock user deletion
      prismaUsers.user.delete.mockResolvedValue({})

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await service(job, mockLogger)

      // Should find playwright users with correct filters
      expect(prismaUsers.user.findMany).toHaveBeenCalledWith({
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
      expect(mockPrisma.journey.findMany).toHaveBeenCalledTimes(2)
      expect(mockPrisma.journey.findMany).toHaveBeenNthCalledWith(1, {
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
      expect(mockPrisma.journey.findMany).toHaveBeenNthCalledWith(2, {
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
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(3)
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
      expect(prismaUsers.user.delete).toHaveBeenCalledTimes(2)
      expect(prismaUsers.user.delete).toHaveBeenNthCalledWith(1, {
        where: { id: 'user-1' }
      })
      expect(prismaUsers.user.delete).toHaveBeenNthCalledWith(2, {
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

      prismaUsers.user.findMany.mockResolvedValue(playwrightUsers)
      mockPrisma.journey.findMany.mockResolvedValue(userJourneys as any)

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: true
        }
      } as Job

      await service(job, mockLogger)

      // Should find users and journeys
      expect(prismaUsers.user.findMany).toHaveBeenCalled()
      expect(mockPrisma.journey.findMany).toHaveBeenCalled()

      // Should not perform any deletions
      expect(mockPrisma.$transaction).not.toHaveBeenCalled()
      expect(mockTx.event.deleteMany).not.toHaveBeenCalled()
      expect(mockTx.journey.delete).not.toHaveBeenCalled()
      expect(prismaUsers.user.delete).not.toHaveBeenCalled()
    })

    it('should handle users with no journeys', async () => {
      const playwrightUsers = [
        {
          id: 'user-1',
          userId: 'playwright-user-1',
          email: 'playwright123@example.com'
        }
      ]

      prismaUsers.user.findMany.mockResolvedValue(playwrightUsers)
      mockPrisma.journey.findMany.mockResolvedValue([]) // No journeys

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await service(job, mockLogger)

      // Should still delete the user even if they have no journeys
      expect(prismaUsers.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' }
      })

      // Should not call transaction since no journeys to delete
      expect(mockPrisma.$transaction).not.toHaveBeenCalled()
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

      prismaUsers.user.findMany.mockResolvedValue(playwrightUsers)
      mockPrisma.journey.findMany.mockResolvedValue(userJourneys as any)

      // Mock transaction to fail
      const transactionError = new Error('Journey deletion failed')
      mockPrisma.$transaction.mockRejectedValueOnce(transactionError)

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await service(job, mockLogger)

      // Should still delete the user
      expect(prismaUsers.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' }
      })
    })

    it('should use default cleanup hours when not specified', async () => {
      prismaUsers.user.findMany.mockResolvedValue([])

      const job = {
        data: {
          __typename: 'e2eCleanup'
        }
      } as Job

      await service(job, mockLogger)

      // Should use 24 hours as default by checking the date filter
      const expectedCutoffTime = Date.now() - 24 * 60 * 60 * 1000
      const actualCall = prismaUsers.user.findMany.mock.calls[0][0]
      const actualCutoffTime = actualCall.where.createdAt.lt.getTime()

      // Allow for small time difference due to test execution time
      expect(Math.abs(actualCutoffTime - expectedCutoffTime)).toBeLessThan(1000)
    })

    it('should handle service errors gracefully', async () => {
      const error = new Error('Database error')
      prismaUsers.user.findMany.mockRejectedValue(error)

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

      prismaUsers.user.findMany.mockResolvedValue(playwrightUsers)
      mockPrisma.journey.findMany.mockResolvedValue(userJourneys as any)

      mockTx.event.deleteMany.mockResolvedValue({ count: 0 })
      mockTx.journey.delete.mockResolvedValue({})
      prismaUsers.user.delete.mockResolvedValue({})

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await service(job, mockLogger)

      // Should call transaction with timeout option
      expect(mockPrisma.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        { timeout: 30000 }
      )
    })

    it('should filter users by correct time cutoff', async () => {
      const olderThanHours = 48
      prismaUsers.user.findMany.mockResolvedValue([])

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
      const actualCall = prismaUsers.user.findMany.mock.calls[0][0]
      const actualCutoffTime = actualCall.where.createdAt.lt.getTime()

      // Allow for small time difference due to test execution time
      expect(Math.abs(actualCutoffTime - expectedCutoffTime)).toBeLessThan(1000)
    })
  })
})

import { Job } from 'bullmq'
import { Logger } from 'pino'

import { UserJourneyRole } from '@core/prisma/journeys/client'

import { prismaMock } from '../../../../test/prismaMock'

import { service } from './service'

jest.mock('@core/prisma/users/client', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      delete: jest.fn()
    }
  }
}))

const { prisma: mockPrismaUsers } = jest.requireMock(
  '@core/prisma/users/client'
)

describe('anonymousJourneyCleanup service', () => {
  let mockLogger: Logger
  const mockJob = {} as Job

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-01-10T00:00:00Z'))
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as any
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return early when no anonymous users exist', async () => {
    mockPrismaUsers.user.findMany.mockResolvedValue([])

    await service(mockJob, mockLogger)

    expect(mockPrismaUsers.user.findMany).toHaveBeenCalledWith({
      where: { email: null },
      select: { id: true, userId: true }
    })
    expect(prismaMock.journey.findMany).not.toHaveBeenCalled()
    expect(mockLogger.info).toHaveBeenCalledWith('No anonymous users found')
  })

  it('should skip users with no old journeys', async () => {
    mockPrismaUsers.user.findMany.mockResolvedValue([
      { id: 'user-db-1', userId: 'user-1' }
    ])
    prismaMock.journey.findMany.mockResolvedValue([])

    await service(mockJob, mockLogger)

    expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
      where: {
        createdAt: { lt: new Date('2025-01-05T00:00:00Z') },
        userJourneys: {
          some: { userId: 'user-1', role: UserJourneyRole.owner }
        }
      },
      select: { id: true, title: true }
    })
    expect(prismaMock.journey.delete).not.toHaveBeenCalled()
    expect(mockPrismaUsers.user.delete).not.toHaveBeenCalled()
  })

  it('should delete old journeys and the user when no journeys remain', async () => {
    mockPrismaUsers.user.findMany.mockResolvedValue([
      { id: 'user-db-1', userId: 'user-1' }
    ])
    prismaMock.journey.findMany.mockResolvedValue([
      { id: 'journey-1', title: 'Old Journey 1' },
      { id: 'journey-2', title: 'Old Journey 2' }
    ] as any)
    prismaMock.journey.delete.mockResolvedValue({} as any)
    prismaMock.journey.count.mockResolvedValue(0)
    mockPrismaUsers.user.delete.mockResolvedValue({})

    await service(mockJob, mockLogger)

    expect(prismaMock.journey.delete).toHaveBeenCalledTimes(2)
    expect(prismaMock.journey.delete).toHaveBeenCalledWith({
      where: { id: 'journey-1' }
    })
    expect(prismaMock.journey.delete).toHaveBeenCalledWith({
      where: { id: 'journey-2' }
    })
    expect(prismaMock.journey.count).toHaveBeenCalledWith({
      where: {
        userJourneys: {
          some: { userId: 'user-1', role: UserJourneyRole.owner }
        }
      }
    })
    expect(mockPrismaUsers.user.delete).toHaveBeenCalledWith({
      where: { id: 'user-db-1' }
    })
  })

  it('should not delete the user when remaining journeys exist', async () => {
    mockPrismaUsers.user.findMany.mockResolvedValue([
      { id: 'user-db-1', userId: 'user-1' }
    ])
    prismaMock.journey.findMany.mockResolvedValue([
      { id: 'journey-1', title: 'Old Journey' }
    ] as any)
    prismaMock.journey.delete.mockResolvedValue({} as any)
    prismaMock.journey.count.mockResolvedValue(2)

    await service(mockJob, mockLogger)

    expect(prismaMock.journey.delete).toHaveBeenCalledTimes(1)
    expect(mockPrismaUsers.user.delete).not.toHaveBeenCalled()
  })

  it('should continue processing when a journey deletion fails', async () => {
    mockPrismaUsers.user.findMany.mockResolvedValue([
      { id: 'user-db-1', userId: 'user-1' }
    ])
    prismaMock.journey.findMany.mockResolvedValue([
      { id: 'journey-1', title: 'Failing Journey' },
      { id: 'journey-2', title: 'Good Journey' }
    ] as any)
    prismaMock.journey.delete
      .mockRejectedValueOnce(new Error('delete failed'))
      .mockResolvedValueOnce({} as any)
    prismaMock.journey.count.mockResolvedValue(0)
    mockPrismaUsers.user.delete.mockResolvedValue({})

    await service(mockJob, mockLogger)

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ journeyId: 'journey-1' }),
      'Failed to delete journey "Failing Journey"'
    )
    expect(prismaMock.journey.delete).toHaveBeenCalledTimes(2)
    expect(mockPrismaUsers.user.delete).toHaveBeenCalled()
  })

  it('should continue processing when user deletion fails', async () => {
    mockPrismaUsers.user.findMany.mockResolvedValue([
      { id: 'user-db-1', userId: 'user-1' }
    ])
    prismaMock.journey.findMany.mockResolvedValue([
      { id: 'journey-1', title: 'Journey' }
    ] as any)
    prismaMock.journey.delete.mockResolvedValue({} as any)
    prismaMock.journey.count.mockResolvedValue(0)
    mockPrismaUsers.user.delete.mockRejectedValue(new Error('user delete failed'))

    await service(mockJob, mockLogger)

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1' }),
      'Failed to delete anonymous user'
    )
  })

  it('should process multiple anonymous users independently', async () => {
    mockPrismaUsers.user.findMany.mockResolvedValue([
      { id: 'user-db-1', userId: 'user-1' },
      { id: 'user-db-2', userId: 'user-2' }
    ])
    prismaMock.journey.findMany
      .mockResolvedValueOnce([{ id: 'journey-1', title: 'J1' }] as any)
      .mockResolvedValueOnce([{ id: 'journey-2', title: 'J2' }] as any)
    prismaMock.journey.delete.mockResolvedValue({} as any)
    prismaMock.journey.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(3)
    mockPrismaUsers.user.delete.mockResolvedValue({})

    await service(mockJob, mockLogger)

    expect(prismaMock.journey.delete).toHaveBeenCalledTimes(2)
    expect(mockPrismaUsers.user.delete).toHaveBeenCalledTimes(1)
    expect(mockPrismaUsers.user.delete).toHaveBeenCalledWith({
      where: { id: 'user-db-1' }
    })
  })

  it('should throw when findMany for anonymous users fails', async () => {
    const error = new Error('database connection failed')
    mockPrismaUsers.user.findMany.mockRejectedValue(error)

    await expect(service(mockJob, mockLogger)).rejects.toThrow(
      'database connection failed'
    )
    expect(mockLogger.error).toHaveBeenCalledWith(
      { error },
      'Anonymous journey cleanup failed'
    )
  })

  it('should log final counts on completion', async () => {
    mockPrismaUsers.user.findMany.mockResolvedValue([
      { id: 'user-db-1', userId: 'user-1' }
    ])
    prismaMock.journey.findMany.mockResolvedValue([
      { id: 'journey-1', title: 'J1' }
    ] as any)
    prismaMock.journey.delete.mockResolvedValue({} as any)
    prismaMock.journey.count.mockResolvedValue(0)
    mockPrismaUsers.user.delete.mockResolvedValue({})

    await service(mockJob, mockLogger)

    expect(mockLogger.info).toHaveBeenCalledWith(
      { deletedJourneyCount: 1, deletedUserCount: 1 },
      'Anonymous journey cleanup completed: deleted 1 journeys and 1 users'
    )
  })
})

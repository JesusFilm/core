import { Job } from 'bullmq'
import { Logger } from 'pino'

import { prismaMock } from '../../../../test/prismaMock'

import { service } from './service'

describe('E2E Cleanup Service', () => {
  let mockLogger: Logger

  beforeEach(() => {
    jest.clearAllMocks()
    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    } as any
  })

  describe('service', () => {
    it('should clean up test journeys and teams older than specified hours', async () => {
      const testJourneys = [
        {
          id: 'journey-1',
          title: 'First journey123',
          createdAt: new Date('2023-01-01')
        },
        {
          id: 'journey-2',
          title: 'Second journey456',
          createdAt: new Date('2023-01-01')
        }
      ]

      const testTeams = [
        {
          id: 'team-1',
          title: 'Automation TeamName123456',
          createdAt: new Date('2023-01-01')
        }
      ]

      const testTeamInvites = [
        {
          id: 'invite-1',
          email: 'playwright123@example.com',
          createdAt: new Date('2023-01-01')
        }
      ]

      const testJourneyInvites = [
        {
          id: 'jinvite-1',
          email: 'playwright456@example.com',
          updatedAt: new Date('2023-01-01')
        }
      ]

      // Mock successful operations
      prismaMock.journey.findMany.mockResolvedValue(testJourneys as any)
      prismaMock.team.findMany.mockResolvedValue(testTeams as any)
      prismaMock.userTeamInvite.findMany.mockResolvedValue(
        testTeamInvites as any
      )
      prismaMock.userInvite.findMany.mockResolvedValue(
        testJourneyInvites as any
      )

      prismaMock.journey.deleteMany.mockResolvedValue({ count: 2 })
      prismaMock.team.deleteMany.mockResolvedValue({ count: 1 })
      prismaMock.userJourney.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.journeyVisitor.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.event.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.block.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.userTeam.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.userTeamInvite.deleteMany.mockResolvedValue({ count: 1 })
      prismaMock.userInvite.deleteMany.mockResolvedValue({ count: 1 })

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await service(job, mockLogger)

      expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              createdAt: {
                lt: expect.any(Date)
              }
            },
            {
              OR: expect.arrayContaining([
                {
                  title: {
                    contains: 'First journey',
                    mode: 'insensitive'
                  }
                },
                {
                  title: {
                    contains: 'Second journey',
                    mode: 'insensitive'
                  }
                },
                {
                  title: {
                    contains: 'Renamed journey',
                    mode: 'insensitive'
                  }
                }
              ])
            }
          ]
        },
        select: {
          id: true,
          title: true,
          createdAt: true
        }
      })

      expect(prismaMock.journey.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['journey-1', 'journey-2'] } }
      })

      expect(prismaMock.team.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['team-1'] } }
      })

      expect(mockLogger.info).toHaveBeenCalledWith(
        { deletedJourneys: 2 },
        'Deleted test journeys'
      )

      expect(mockLogger.info).toHaveBeenCalledWith(
        { deletedTeams: 1 },
        'Deleted test teams'
      )
    })

    it('should perform dry run without deleting data', async () => {
      const testJourneys = [
        {
          id: 'journey-1',
          title: 'First journey123',
          createdAt: new Date('2023-01-01')
        }
      ]

      const testTeams = [
        {
          id: 'team-1',
          title: 'Automation TeamName123',
          createdAt: new Date('2023-01-01')
        }
      ]

      const testTeamInvites = [
        {
          id: 'invite-1',
          email: 'playwright123@example.com',
          createdAt: new Date('2023-01-01')
        }
      ]

      const testJourneyInvites = [
        {
          id: 'jinvite-1',
          email: 'playwright456@example.com',
          updatedAt: new Date('2023-01-01')
        }
      ]

      prismaMock.journey.findMany.mockResolvedValue(testJourneys as any)
      prismaMock.team.findMany.mockResolvedValue(testTeams as any)
      prismaMock.userTeamInvite.findMany.mockResolvedValue(
        testTeamInvites as any
      )
      prismaMock.userInvite.findMany.mockResolvedValue(
        testJourneyInvites as any
      )

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: true
        }
      } as Job

      await service(job, mockLogger)

      expect(prismaMock.journey.findMany).toHaveBeenCalled()
      expect(prismaMock.team.findMany).toHaveBeenCalled()
      expect(prismaMock.userTeamInvite.findMany).toHaveBeenCalled()
      expect(prismaMock.userInvite.findMany).toHaveBeenCalled()

      // Should not call any delete operations
      expect(prismaMock.journey.deleteMany).not.toHaveBeenCalled()
      expect(prismaMock.team.deleteMany).not.toHaveBeenCalled()
      expect(prismaMock.userJourney.deleteMany).not.toHaveBeenCalled()

      expect(mockLogger.info).toHaveBeenCalledWith(
        'DRY RUN: Would delete the following test data:'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Journey: First journey123 (journey-1) - Created: 2023-01-01T00:00:00.000Z'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Team: Automation TeamName123 (team-1) - Created: 2023-01-01T00:00:00.000Z'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Team Invite: playwright123@example.com (invite-1) - Created: 2023-01-01T00:00:00.000Z'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Journey Invite: playwright456@example.com (jinvite-1) - Updated: 2023-01-01T00:00:00.000Z'
      )
    })

    it('should use default cleanup hours when not specified', async () => {
      prismaMock.journey.findMany.mockResolvedValue([])
      prismaMock.team.findMany.mockResolvedValue([])
      prismaMock.userTeamInvite.findMany.mockResolvedValue([])
      prismaMock.userInvite.findMany.mockResolvedValue([])

      const job = {
        data: {
          __typename: 'e2eCleanup'
        }
      } as Job

      await service(job, mockLogger)

      expect(mockLogger.info).toHaveBeenCalledWith(
        { olderThanHours: 24, dryRun: false },
        'Starting e2e cleanup'
      )
    })

    it('should handle cleanup of team journeys when cleaning teams', async () => {
      const testTeams = [
        {
          id: 'team-1',
          title: 'Automation TeamName123',
          createdAt: new Date('2023-01-01')
        }
      ]

      const teamJourneys = [{ id: 'journey-1' }, { id: 'journey-2' }]

      prismaMock.journey.findMany.mockResolvedValue([])
      prismaMock.team.findMany.mockResolvedValue(testTeams as any)
      prismaMock.userTeamInvite.findMany.mockResolvedValue([])
      prismaMock.userInvite.findMany.mockResolvedValue([])
      prismaMock.journey.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(teamJourneys as any)
      prismaMock.team.deleteMany.mockResolvedValue({ count: 1 })
      prismaMock.journey.deleteMany.mockResolvedValue({ count: 2 })
      prismaMock.userJourney.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.journeyVisitor.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.event.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.block.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.userTeam.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.userTeamInvite.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.userInvite.deleteMany.mockResolvedValue({ count: 0 })

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await service(job, mockLogger)

      // Should clean up journeys owned by the teams
      expect(prismaMock.journey.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['journey-1', 'journey-2'] } }
      })
    })

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error')
      prismaMock.journey.findMany.mockRejectedValue(error)

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await expect(service(job, mockLogger)).rejects.toThrow('Database error')

      expect(mockLogger.error).toHaveBeenCalledWith(
        { error },
        'E2E cleanup failed'
      )
    })
  })
})

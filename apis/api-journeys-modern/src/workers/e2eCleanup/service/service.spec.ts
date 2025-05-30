import { Job } from 'bullmq'
import { Logger } from 'pino'

import { UserJourneyRole } from '.prisma/api-journeys-modern-client'

import { prismaMock } from '../../../../test/prismaMock'

import { service } from './service'

// Mock Apollo Client
const mockApolloQuery = jest.fn()
jest.mock('@apollo/client', () => ({
  ApolloClient: jest.fn().mockImplementation(() => ({
    query: (...args: any[]) => mockApolloQuery(...args)
  })),
  InMemoryCache: jest.fn(),
  createHttpLink: jest.fn()
}))

// Mock gql.tada
jest.mock('gql.tada', () => ({
  graphql: jest.fn().mockReturnValue('MOCK_QUERY')
}))

describe('E2E Cleanup Service', () => {
  let mockLogger: Logger

  beforeEach(() => {
    jest.clearAllMocks()
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as any
  })

  describe('service', () => {
    it('should clean up test journeys by title patterns and playwright users', async () => {
      const testJourneys = [
        {
          id: 'journey-1',
          title: 'First journey123',
          createdAt: new Date('2023-01-01'),
          userJourneys: [
            {
              userId: 'user-1',
              role: UserJourneyRole.owner
            }
          ]
        },
        {
          id: 'journey-2',
          title: 'Regular journey',
          createdAt: new Date('2023-01-01'),
          userJourneys: [
            {
              userId: 'playwright-user',
              role: UserJourneyRole.owner
            }
          ]
        },
        {
          id: 'journey-3',
          title: 'Another regular journey',
          createdAt: new Date('2023-01-01'),
          userJourneys: [
            {
              userId: 'regular-user',
              role: UserJourneyRole.owner
            }
          ]
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

      // Mock Apollo queries for user emails - only called for non-title-matching journeys
      mockApolloQuery
        .mockResolvedValueOnce({
          data: { user: { email: 'playwright123@example.com' } }
        }) // playwright-user
        .mockResolvedValueOnce({
          data: { user: { email: 'regular2@example.com' } }
        }) // regular-user

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

      // Should query all journeys, not with title filters
      expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date)
          }
        },
        include: {
          userJourneys: {
            where: {
              role: UserJourneyRole.owner
            }
          }
        }
      })

      // Should delete both journeys (one by title, one by playwright user)
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
    })

    it('should perform dry run with detailed logging', async () => {
      const testJourneys = [
        {
          id: 'journey-1',
          title: 'First journey123',
          createdAt: new Date('2023-01-01'),
          userJourneys: [
            {
              userId: 'user-1',
              role: UserJourneyRole.owner
            }
          ]
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

      // Should log filtering statistics in dry run
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          totalCandidates: 1,
          journeysByTitle: 1,
          journeysByPlaywrightUser: 0,
          totalSelected: 1,
          uniqueUsersChecked: 0,
          playwrightUsersFound: 0
        }),
        'Journey filtering completed'
      )

      expect(mockLogger.info).toHaveBeenCalledWith(
        'DRY RUN: Would delete the following test data:'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Journey: First journey123 (journey-1) - Created: 2023-01-01T00:00:00.000Z'
      )
    })

    it('should cache user email lookups', async () => {
      const testJourneys = [
        {
          id: 'journey-1',
          title: 'Regular journey 1',
          createdAt: new Date('2023-01-01'),
          userJourneys: [
            {
              userId: 'playwright-user',
              role: UserJourneyRole.owner
            }
          ]
        },
        {
          id: 'journey-2',
          title: 'Regular journey 2',
          createdAt: new Date('2023-01-01'),
          userJourneys: [
            {
              userId: 'playwright-user', // Same user as journey-1
              role: UserJourneyRole.owner
            }
          ]
        }
      ]

      // Mock single Apollo query - should only be called once due to caching
      mockApolloQuery.mockResolvedValueOnce({
        data: { user: { email: 'playwright123@example.com' } }
      })

      prismaMock.journey.findMany.mockResolvedValue(testJourneys as any)
      prismaMock.team.findMany.mockResolvedValue([])
      prismaMock.userTeamInvite.findMany.mockResolvedValue([])
      prismaMock.userInvite.findMany.mockResolvedValue([])

      prismaMock.journey.deleteMany.mockResolvedValue({ count: 2 })
      prismaMock.userJourney.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.journeyVisitor.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.event.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.block.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.userInvite.deleteMany.mockResolvedValue({ count: 0 })

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await service(job, mockLogger)

      // Should only call Apollo query once, despite same user owning multiple journeys
      expect(mockApolloQuery).toHaveBeenCalledTimes(1)

      // Should delete both journeys
      expect(prismaMock.journey.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['journey-1', 'journey-2'] } }
      })
    })

    it('should handle user lookup errors gracefully', async () => {
      const testJourneys = [
        {
          id: 'journey-1',
          title: 'Regular journey',
          createdAt: new Date('2023-01-01'),
          userJourneys: [
            {
              userId: 'error-user',
              role: UserJourneyRole.owner
            }
          ]
        }
      ]

      // Mock Apollo query error
      mockApolloQuery.mockRejectedValueOnce(new Error('User service error'))

      prismaMock.journey.findMany.mockResolvedValue(testJourneys as any)
      prismaMock.team.findMany.mockResolvedValue([])
      prismaMock.userTeamInvite.findMany.mockResolvedValue([])
      prismaMock.userInvite.findMany.mockResolvedValue([])

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await service(job, mockLogger)

      // Should log warning for failed user lookup
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'error-user',
          error: expect.any(Error)
        }),
        'Failed to fetch user email'
      )

      // Should not delete any journeys since user lookup failed and title doesn't match
      expect(prismaMock.journey.deleteMany).not.toHaveBeenCalled()

      // Should still log completion
      expect(mockLogger.info).toHaveBeenCalledWith(
        'E2E cleanup completed successfully'
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

    it('should not log info during actual cleanup (non-dry run)', async () => {
      const testJourneys = [
        {
          id: 'journey-1',
          title: 'First journey123',
          createdAt: new Date('2023-01-01'),
          userJourneys: [
            {
              userId: 'user-1',
              role: UserJourneyRole.owner
            }
          ]
        }
      ]

      prismaMock.journey.findMany.mockResolvedValue(testJourneys as any)
      prismaMock.team.findMany.mockResolvedValue([])
      prismaMock.userTeamInvite.findMany.mockResolvedValue([])
      prismaMock.userInvite.findMany.mockResolvedValue([])

      prismaMock.journey.deleteMany.mockResolvedValue({ count: 1 })
      prismaMock.userJourney.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.journeyVisitor.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.event.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.block.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.userInvite.deleteMany.mockResolvedValue({ count: 0 })

      const job = {
        data: {
          __typename: 'e2eCleanup',
          olderThanHours: 24,
          dryRun: false
        }
      } as Job

      await service(job, mockLogger)

      // Should NOT log filtering statistics during actual cleanup
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.objectContaining({
          totalCandidates: expect.any(Number)
        }),
        'Journey filtering completed'
      )

      // Should still log deletion results and completion
      expect(mockLogger.info).toHaveBeenCalledWith(
        { deletedJourneys: 1 },
        'Deleted test journeys'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'E2E cleanup completed successfully'
      )
    })
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Journey, JourneyNotification } from '@core/prisma/journeys/client'

import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyNotificationResolver } from './journeyNotification.resolver'

describe('JourneyNotificationResolver', () => {
  let resolver: JourneyNotificationResolver,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        JourneyNotificationResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    resolver = module.get<JourneyNotificationResolver>(
      JourneyNotificationResolver
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>

    prismaService.$transaction.mockImplementation(
      async (callback) => await callback(prismaService)
    )
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const journeyNotification = {
    id: '1',
    journeyId: 'journeyId',
    userId: 'userId',
    userJourneyId: 'userJourneyId',
    userTeamId: null,
    visitorInteractionEmail: false,
    userTeam: {
      id: 'userTeamId',
      userId: 'userId'
    }
  } as unknown as JourneyNotification
  const input = {
    journeyId: 'journeyId',
    visitorInteractionEmail: true
  }

  describe('eventEmailNotificationsUpdate', () => {
    it('should upsert an event email notification by userId and journeyId', async () => {
      prismaService.journeyNotification.upsert.mockResolvedValueOnce({
        ...journeyNotification,
        visitorInteractionEmail: true
      })
      prismaService.journey.findUnique.mockResolvedValue({
        id: 'journeyId',
        team: {
          id: 'teamId',
          userTeams: [
            {
              id: 'userJourneyId',
              userId: 'userId',
              teamId: 'teamId'
            }
          ]
        },
        userJourneys: [
          {
            id: 'userJourneyId',
            userId: 'userId',
            journeyId: 'journeyId',
            updatedAt: new Date(),
            role: 'owner',
            openedAt: null
          }
        ]
      } as unknown as Journey)
      expect(
        await resolver.journeyNotificationUpdate(ability, 'userId', input)
      ).toEqual({
        id: '1',
        journeyId: 'journeyId',
        userId: 'userId',
        userJourneyId: 'userJourneyId',
        userTeamId: null,
        visitorInteractionEmail: true,
        userTeam: {
          id: 'userTeamId',
          userId: 'userId'
        }
      })
      expect(prismaService.journeyNotification.upsert).toHaveBeenCalledWith({
        where: {
          userId_journeyId: {
            userId: 'userId',
            journeyId: 'journeyId'
          }
        },
        create: {
          userId: 'userId',
          userJourneyId: 'userJourneyId',
          userTeamId: 'userJourneyId',
          ...input
        },
        update: {
          userJourneyId: 'userJourneyId',
          userTeamId: 'userJourneyId',
          ...input
        },
        include: {
          userJourney: true,
          userTeam: true
        }
      })
    })

    it('should throw error if current user is not journey notification user', async () => {
      const journeyNotificaitonWithDifferentUserTeam = {
        ...journeyNotification,
        userTeam: {
          id: 'userTeamId',
          userId: 'anotherUserId'
        }
      }
      prismaService.journeyNotification.upsert.mockResolvedValueOnce({
        ...journeyNotificaitonWithDifferentUserTeam,
        visitorInteractionEmail: true
      })
      prismaService.journey.findUnique.mockResolvedValue({
        id: 'journeyId',
        team: {
          id: 'teamId',
          userTeams: [
            {
              id: 'userJourneyId',
              userId: 'userId',
              teamId: 'teamId'
            }
          ]
        },
        userJourneys: [
          {
            id: 'userJourneyId',
            userId: 'userId',
            journeyId: 'journeyId',
            updatedAt: new Date(),
            role: 'owner',
            openedAt: null
          }
        ]
      } as unknown as Journey)

      await expect(
        resolver.journeyNotificationUpdate(ability, 'userId', input)
      ).rejects.toThrow('user is not allowed to update journey notification')
    })
  })
})
